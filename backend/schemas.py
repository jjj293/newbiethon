"""
Pydantic 스키마 정의 파일
"""

from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


def to_camel(snake_str: str) -> str:
    first, *rest = snake_str.split("_")
    return first + "".join(word.capitalize() for word in rest)


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


# ---------------- 사용자 생성 입력 스키마 ----------------

class LifestyleCreate(CamelModel):
    noise: int
    cleanliness: int
    sleep: int
    privacy: int
    conflict: int
    social: int

    @field_validator("noise", "cleanliness", "sleep", "privacy", "conflict", "social")
    @classmethod
    def score_in_range(cls, v: int) -> int:
        if not (0 <= v <= 16):
            raise ValueError("lifestyle 점수는 0~16 사이여야 합니다.")
        return v


class PreferenceCreate(CamelModel):
    guest_allowed: bool
    pet_allowed: bool
    notes: Optional[str] = None


class BudgetPreferenceCreate(CamelModel):
    deposit_min: int
    deposit_max: int
    monthly_rent_min: int
    monthly_rent_max: int


class ProfileUpdate(CamelModel):
    """
    회원가입(POST /auth/register) 이후, 온보딩 설문 결과로
    프로필을 채우거나 수정할 때 쓰는 스키마.
    user id는 URL 경로(PUT /users/{user_id})로 받으므로 여기엔 없다.
    """

    gender: str
    age: int
    is_smoker: bool
    regions: List[str] = Field(default_factory=list)
    lifestyle: LifestyleCreate
    preferences: PreferenceCreate
    budgets: List[BudgetPreferenceCreate] = Field(default_factory=list)


# ---------------- 사용자 조회 출력 스키마 ----------------

class LifestyleOut(CamelModel):
    noise: int
    cleanliness: int
    sleep: int
    privacy: int
    conflict: int
    social: int


class PreferenceOut(CamelModel):
    guest_allowed: bool
    pet_allowed: bool
    notes: Optional[str] = None


class BudgetPreferenceOut(CamelModel):
    deposit_min: int
    deposit_max: int
    monthly_rent_min: int
    monthly_rent_max: int


class UserOut(CamelModel):
    id: str
    # 회원가입만 하고 아직 온보딩(프로필 입력)을 안 했으면 전부 None일 수 있다.
    gender: Optional[str] = None
    age: Optional[int] = None
    is_smoker: Optional[bool] = None
    regions: List[str] = Field(default_factory=list)
    lifestyle: Optional[LifestyleOut] = None
    preferences: Optional[PreferenceOut] = None
    budgets: List[BudgetPreferenceOut] = Field(default_factory=list)


# ---------------- 매칭 결과 응답 스키마 ----------------

class LifestyleSimilarityOut(CamelModel):
    noise: float
    cleanliness: float
    sleep: float
    privacy: float
    conflict: float
    social: float


class PreferenceScoreOut(CamelModel):
    guest: float
    pet: float


class ComplementDetailsOut(CamelModel):
    social_privacy_fit: float
    noise_sleep_fit: float
    clean_conflict_fit: float
    useful_difference: float


class DirectMatchOut(CamelModel):
    user_id: str
    match_score: float
    complement_score: float
    matched_regions: List[str]
    lifestyle_similarity: LifestyleSimilarityOut
    preferences: PreferenceScoreOut
    strengths: List[str]
    risks: List[str]


class ComplementaryMatchOut(CamelModel):
    user_id: str
    match_score: float
    complement_score: float
    matched_regions: List[str]
    complement_details: ComplementDetailsOut
    strengths: List[str]
    risks: List[str]


class MatchResponse(CamelModel):
    direct_matches: List[DirectMatchOut]
    complementary_matches: List[ComplementaryMatchOut]