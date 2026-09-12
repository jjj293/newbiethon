"""
기본 프로필(닉네임/성별/나이/희망 지역/흡연 여부) 저장을 담당하는 라우터 모듈.

기존 users 테이블(gender/age/is_smoker)과 user_regions 테이블을 그대로 재사용한다.
새로운 profiles 테이블이나 정수 user_id를 별도로 만들지 않는다 - 로그인에서 발급되는
UUID 문자열 user_id를 프로젝트 전체의 공통 식별자로 그대로 사용한다.

lifestyle/preferences/budgets(라이프스타일 담당 팀원 몫)는 이 라우터가 다루지 않으며,
PUT /users/{user_id}(main.py)는 그대로 유지한다.
"""

from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

import models
from database import get_db

router = APIRouter()

ALLOWED_GENDERS = {"남", "여"}
ALLOWED_REGIONS = {"안암", "보문", "종암", "제기동"}


class ProfileIn(BaseModel):
    user_id: str
    nickname: str
    gender: str
    age: int
    preferred_regions: List[str]
    smoking: bool


@router.post("/profile")
def save_profile(payload: ProfileIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if user is None:
        return {"success": False, "message": "존재하지 않는 사용자입니다."}

    if payload.nickname.strip() == "":
        return {"success": False, "message": "닉네임을 입력해주세요."}

    if payload.gender not in ALLOWED_GENDERS:
        return {"success": False, "message": "성별은 남 또는 여만 가능합니다."}

    if payload.age <= 0:
        return {"success": False, "message": "나이는 1 이상의 정수여야 합니다."}

    if not (1 <= len(payload.preferred_regions) <= 4) or not set(
        payload.preferred_regions
    ).issubset(ALLOWED_REGIONS):
        return {
            "success": False,
            "message": "희망 거주 지역은 안암/보문/종암/제기동 중 1개 이상 4개 이하로 선택해주세요.",
        }

    user.nickname = payload.nickname
    user.gender = payload.gender
    user.age = payload.age
    user.is_smoker = payload.smoking

    db.query(models.UserRegion).filter(models.UserRegion.user_id == payload.user_id).delete()
    for region in payload.preferred_regions:
        db.add(models.UserRegion(user_id=payload.user_id, region=region))

    db.commit()
    return {"success": True, "message": "프로필이 저장되었습니다."}
