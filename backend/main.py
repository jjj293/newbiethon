"""
FastAPI 애플리케이션 진입점.
"""

import os
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload

import models
import schemas
from app import router as auth_router
from database import Base, engine, get_db
from matching import BudgetRange, LifestyleScores, UserProfile, find_top_matches
from profile_routes import router as profile_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Roommate Matching API")

allow_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
frontend_origin = os.environ.get("FRONTEND_ORIGIN")
if frontend_origin:
    allow_origins.append(frontend_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.py에 있던 로그인/회원가입 라우트(/health, /auth/register, /auth/login)를
# 매칭 API와 같은 서버에 합친다.
app.include_router(auth_router)
app.include_router(profile_router)


def _get_user_or_404(db: Session, user_id: str) -> models.User:
    user = (
        db.query(models.User)
        .options(
            joinedload(models.User.regions),
            joinedload(models.User.lifestyle),
            joinedload(models.User.preferences),
            joinedload(models.User.budgets),
        )
        .filter(models.User.id == user_id)
        .first()
    )
    if user is None:
        raise HTTPException(status_code=404, detail=f"user '{user_id}'를 찾을 수 없습니다.")
    return user


def _to_user_out(user: models.User) -> schemas.UserOut:
    """
    DB User -> 응답 스키마 변환.
    회원가입만 하고 온보딩(프로필 입력)을 아직 안 한 사용자는
    lifestyle/preferences가 아예 없을 수 있으므로 None을 허용한다.
    """
    return schemas.UserOut(
        id=user.id,
        gender=user.gender,
        age=user.age,
        is_smoker=user.is_smoker,
        regions=[r.region for r in user.regions],
        lifestyle=schemas.LifestyleOut.model_validate(user.lifestyle) if user.lifestyle else None,
        preferences=schemas.PreferenceOut.model_validate(user.preferences) if user.preferences else None,
        budgets=[schemas.BudgetPreferenceOut.model_validate(b) for b in user.budgets],
    )


def _has_complete_profile(user: models.User) -> bool:
    """매칭에 필요한 최소 정보(gender, lifestyle, preferences)가 다 채워졌는지 확인한다."""
    return user.gender is not None and user.lifestyle is not None and user.preferences is not None


def _to_user_profile(user: models.User) -> UserProfile:
    return UserProfile(
        id=user.id,
        gender=user.gender,
        regions=[r.region for r in user.regions],
        budgets=[
            BudgetRange(
                deposit_min=b.deposit_min, deposit_max=b.deposit_max,
                monthly_rent_min=b.monthly_rent_min, monthly_rent_max=b.monthly_rent_max,
            )
            for b in user.budgets
        ],
        lifestyle=LifestyleScores(
            noise=user.lifestyle.noise, cleanliness=user.lifestyle.cleanliness,
            sleep=user.lifestyle.sleep, privacy=user.lifestyle.privacy,
            conflict=user.lifestyle.conflict, social=user.lifestyle.social,
        ),
        guest_allowed=user.preferences.guest_allowed,
        pet_allowed=user.preferences.pet_allowed,
    )


@app.get("/users/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: str, db: Session = Depends(get_db)):
    return _to_user_out(_get_user_or_404(db, user_id))


@app.put("/users/{user_id}", response_model=schemas.UserOut)
def update_profile(user_id: str, payload: schemas.ProfileUpdate, db: Session = Depends(get_db)):
    """
    회원가입(POST /auth/register)으로 이미 존재하는 사용자에게
    온보딩 설문 결과(gender/age/is_smoker/regions/lifestyle/preferences/budgets)를 채워 넣는다.
    이미 프로필이 있으면 통째로 덮어쓴다 (지역/예산은 삭제 후 재생성, lifestyle/preferences는 갱신).
    """
    user = _get_user_or_404(db, user_id)

    user.gender = payload.gender
    user.age = payload.age
    user.is_smoker = payload.is_smoker

    db.query(models.UserRegion).filter(models.UserRegion.user_id == user_id).delete()
    for region in payload.regions:
        db.add(models.UserRegion(user_id=user_id, region=region))

    db.query(models.BudgetPreference).filter(models.BudgetPreference.user_id == user_id).delete()
    for budget in payload.budgets:
        db.add(models.BudgetPreference(
            user_id=user_id, deposit_min=budget.deposit_min, deposit_max=budget.deposit_max,
            monthly_rent_min=budget.monthly_rent_min, monthly_rent_max=budget.monthly_rent_max,
        ))

    if user.lifestyle is None:
        db.add(models.Lifestyle(
            user_id=user_id, noise=payload.lifestyle.noise, cleanliness=payload.lifestyle.cleanliness,
            sleep=payload.lifestyle.sleep, privacy=payload.lifestyle.privacy,
            conflict=payload.lifestyle.conflict, social=payload.lifestyle.social,
        ))
    else:
        user.lifestyle.noise = payload.lifestyle.noise
        user.lifestyle.cleanliness = payload.lifestyle.cleanliness
        user.lifestyle.sleep = payload.lifestyle.sleep
        user.lifestyle.privacy = payload.lifestyle.privacy
        user.lifestyle.conflict = payload.lifestyle.conflict
        user.lifestyle.social = payload.lifestyle.social

    if user.preferences is None:
        db.add(models.Preference(
            user_id=user_id, guest_allowed=payload.preferences.guest_allowed,
            pet_allowed=payload.preferences.pet_allowed, notes=payload.preferences.notes,
        ))
    else:
        user.preferences.guest_allowed = payload.preferences.guest_allowed
        user.preferences.pet_allowed = payload.preferences.pet_allowed
        user.preferences.notes = payload.preferences.notes

    db.commit()
    return _to_user_out(_get_user_or_404(db, user_id))


@app.get("/matches/{user_id}", response_model=schemas.MatchResponse)
def get_matches(user_id: str, db: Session = Depends(get_db)):
    current_user_model = _get_user_or_404(db, user_id)
    if not _has_complete_profile(current_user_model):
        raise HTTPException(
            status_code=400,
            detail="프로필을 먼저 완성해주세요 (gender/lifestyle/preferences 필요).",
        )
    current_user = _to_user_profile(current_user_model)

    other_user_models: List[models.User] = (
        db.query(models.User)
        .options(
            joinedload(models.User.regions), joinedload(models.User.lifestyle),
            joinedload(models.User.preferences), joinedload(models.User.budgets),
        )
        .filter(models.User.id != user_id)
        .all()
    )
    # 아직 온보딩을 안 끝낸(프로필이 비어있는) 사용자는 매칭 후보에서 제외한다.
    other_users = [_to_user_profile(u) for u in other_user_models if _has_complete_profile(u)]

    direct_results, complementary_results = find_top_matches(current_user, other_users, top_n=3)

    direct_matches = [
        schemas.DirectMatchOut(
            user_id=r["user_id"], match_score=r["match_score"], complement_score=r["complement_score"],
            matched_regions=r["matched_regions"],
            lifestyle_similarity=schemas.LifestyleSimilarityOut(**r["lifestyle_similarity"]),
            preferences=schemas.PreferenceScoreOut(**r["preferences"]),
            strengths=r["direct_strengths"], risks=r["direct_risks"],
        )
        for r in direct_results
    ]

    complementary_matches = [
        schemas.ComplementaryMatchOut(
            user_id=r["user_id"], match_score=r["match_score"], complement_score=r["complement_score"],
            matched_regions=r["matched_regions"],
            complement_details=schemas.ComplementDetailsOut(**r["complement_details"]),
            strengths=r["complement_strengths"], risks=r["complement_risks"],
        )
        for r in complementary_results
    ]

    return schemas.MatchResponse(direct_matches=direct_matches, complementary_matches=complementary_matches)