from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from database import Base


class SurveyResponse(Base):
    __tablename__ = "survey_responses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    guest_allowed = Column(Boolean, nullable=False)
    pet_allowed = Column(Boolean, nullable=False)
    notes = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    lifestyle_answers = relationship(
        "LifestyleAnswer", back_populates="response", cascade="all, delete-orphan"
    )
    budget_selections = relationship(
        "BudgetSelection", back_populates="response", cascade="all, delete-orphan"
    )


class LifestyleAnswer(Base):
    __tablename__ = "lifestyle_answers"

    id = Column(Integer, primary_key=True, index=True)
    response_id = Column(Integer, ForeignKey("survey_responses.id"), nullable=False)
    question_id = Column(String, nullable=False)
    lifestyle_key = Column(String, nullable=False)
    score = Column(Integer, nullable=False)

    response = relationship("SurveyResponse", back_populates="lifestyle_answers")


class BudgetSelection(Base):
    __tablename__ = "budget_selections"

    id = Column(Integer, primary_key=True, index=True)
    response_id = Column(Integer, ForeignKey("survey_responses.id"), nullable=False)
    deposit = Column(Integer, nullable=False)
    monthly_rent = Column(Integer, nullable=False)

    response = relationship("SurveyResponse", back_populates="budget_selections")
