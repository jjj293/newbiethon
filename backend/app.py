from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

import models
from database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


class LifestyleAnswerIn(BaseModel):
    questionId: str
    lifestyleKey: str
    choice: str
    score: int


class BudgetIn(BaseModel):
    deposit: int
    monthlyRent: int


class PreferencesIn(BaseModel):
    guestAllowed: bool
    petAllowed: bool
    budget: list[BudgetIn]
    notes: str = ""


class SurveySubmission(BaseModel):
    userId: str
    lifestyleAnswers: list[LifestyleAnswerIn]
    preferences: PreferencesIn


# 문제별 원본 점수만 저장한다. noise/cleanliness/... 최종 합산은 여기서 하지 않고,
# 이후 별도 집계 로직에서 lifestyle_answers 테이블을 읽어 계산할 예정이다.
@app.post("/api/lifestyle-preferences")
def submit_survey(payload: SurveySubmission, db: Session = Depends(get_db)):
    response = models.SurveyResponse(
        user_id=payload.userId,
        guest_allowed=payload.preferences.guestAllowed,
        pet_allowed=payload.preferences.petAllowed,
        notes=payload.preferences.notes,
    )
    db.add(response)
    db.flush()

    for answer in payload.lifestyleAnswers:
        db.add(
            models.LifestyleAnswer(
                response_id=response.id,
                question_id=answer.questionId,
                lifestyle_key=answer.lifestyleKey,
                score=answer.score,
            )
        )

    for budget in payload.preferences.budget:
        db.add(
            models.BudgetSelection(
                response_id=response.id,
                deposit=budget.deposit,
                monthly_rent=budget.monthlyRent,
            )
        )

    db.commit()
    db.refresh(response)

    return {"id": response.id, "userId": response.user_id}
