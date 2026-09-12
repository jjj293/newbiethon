"""
매칭 계산 전용 모듈. DB/FastAPI 코드는 전혀 없다.
"""

from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

LIFESTYLE_ITEMS = ["noise", "cleanliness", "sleep", "privacy", "conflict", "social"]


# ============================================================
# 자료구조 정의
# ============================================================

@dataclass
class LifestyleScores:
    noise: int
    cleanliness: int
    sleep: int
    privacy: int
    conflict: int
    social: int


@dataclass
class BudgetRange:
    deposit_min: int
    deposit_max: int
    monthly_rent_min: int
    monthly_rent_max: int


@dataclass
class UserProfile:
    id: str
    gender: str
    regions: List[str]
    budgets: List[BudgetRange]
    lifestyle: LifestyleScores
    guest_allowed: bool
    pet_allowed: bool


# ============================================================
# 5. Hard Filter
# ============================================================

def range_overlaps(min_a: int, max_a: int, min_b: int, max_b: int) -> bool:
    return max(min_a, min_b) <= min(max_a, max_b)


def region_matches(regions_a: List[str], regions_b: List[str]) -> List[str]:
    set_b = set(regions_b)
    matched = [r for r in regions_a if r in set_b]
    seen = set()
    result = []
    for r in matched:
        if r not in seen:
            seen.add(r)
            result.append(r)
    return result


def budget_matches(budgets_a: List[BudgetRange], budgets_b: List[BudgetRange]) -> bool:
    for a in budgets_a:
        for b in budgets_b:
            deposit_ok = range_overlaps(a.deposit_min, a.deposit_max, b.deposit_min, b.deposit_max)
            rent_ok = range_overlaps(
                a.monthly_rent_min, a.monthly_rent_max, b.monthly_rent_min, b.monthly_rent_max
            )
            if deposit_ok and rent_ok:
                return True
    return False


def passes_hard_filter(user_a: UserProfile, user_b: UserProfile) -> bool:
    if user_a.id == user_b.id:
        return False
    if user_a.gender != user_b.gender:
        return False
    if not region_matches(user_a.regions, user_b.regions):
        return False
    if not budget_matches(user_a.budgets, user_b.budgets):
        return False
    return True


# ============================================================
# 6. 일반 Matching Score
# ============================================================

def lifestyle_similarity(score_a: int, score_b: int) -> float:
    return 1 - abs(score_a - score_b) / 16


def calculate_lifestyle_score(
    lifestyle_a: LifestyleScores, lifestyle_b: LifestyleScores
) -> Tuple[float, Dict[str, float]]:
    similarities: Dict[str, float] = {}
    for item in LIFESTYLE_ITEMS:
        similarities[item] = lifestyle_similarity(
            getattr(lifestyle_a, item), getattr(lifestyle_b, item)
        )
    average_similarity = sum(similarities.values()) / len(LIFESTYLE_ITEMS)
    lifestyle_score = average_similarity * 80
    return lifestyle_score, similarities


def calculate_preference_score(
    user_a: UserProfile, user_b: UserProfile
) -> Tuple[float, Dict[str, float]]:
    guest_score = 10.0 if user_a.guest_allowed == user_b.guest_allowed else 0.0
    pet_score = 10.0 if user_a.pet_allowed == user_b.pet_allowed else 0.0
    return guest_score + pet_score, {"guest": guest_score, "pet": pet_score}


def calculate_match_score(
    user_a: UserProfile, user_b: UserProfile
) -> Tuple[float, Dict[str, float], Dict[str, float]]:
    lifestyle_score, similarities = calculate_lifestyle_score(user_a.lifestyle, user_b.lifestyle)
    preference_score, preference_breakdown = calculate_preference_score(user_a, user_b)
    match_score = round(lifestyle_score + preference_score, 1)
    return match_score, similarities, preference_breakdown


# ============================================================
# 7. Complement Score
# ============================================================

def calculate_social_privacy_fit(a: LifestyleScores, b: LifestyleScores) -> float:
    sp1 = 1 - abs(a.social - (16 - b.privacy)) / 16
    sp2 = 1 - abs(b.social - (16 - a.privacy)) / 16
    return (sp1 + sp2) / 2


def calculate_noise_sleep_fit(a: LifestyleScores, b: LifestyleScores) -> float:
    ns1 = 1 - abs(a.noise - b.sleep) / 16
    ns2 = 1 - abs(b.noise - a.sleep) / 16
    return (ns1 + ns2) / 2


@dataclass
class CleanConflictResult:
    fit: float
    clean_gap: float
    conflict_capacity: float


def calculate_clean_conflict_fit(a: LifestyleScores, b: LifestyleScores) -> CleanConflictResult:
    clean_gap = abs(a.cleanliness - b.cleanliness) / 16
    conflict_level = (a.conflict + b.conflict) / 32
    conflict_similarity = 1 - abs(a.conflict - b.conflict) / 16
    conflict_capacity = conflict_level * conflict_similarity
    fit = 1 - clean_gap * (1 - conflict_capacity)
    return CleanConflictResult(fit=fit, clean_gap=clean_gap, conflict_capacity=conflict_capacity)


def calculate_useful_difference(
    a: LifestyleScores, b: LifestyleScores, cross_fit: float
) -> float:
    role_difference = (
        abs(a.social - b.social) / 16
        + abs(a.privacy - b.privacy) / 16
        + abs(a.noise - b.noise) / 16
        + abs(a.sleep - b.sleep) / 16
    ) / 4
    return role_difference * cross_fit


@dataclass
class ComplementDetails:
    social_privacy_fit: float
    noise_sleep_fit: float
    clean_conflict_fit: float
    useful_difference: float
    clean_gap: float
    conflict_capacity: float


def calculate_complement_score(
    user_a: UserProfile, user_b: UserProfile
) -> Tuple[float, ComplementDetails]:
    a, b = user_a.lifestyle, user_b.lifestyle

    social_privacy_fit = calculate_social_privacy_fit(a, b)
    noise_sleep_fit = calculate_noise_sleep_fit(a, b)
    clean_conflict = calculate_clean_conflict_fit(a, b)

    cross_fit = (social_privacy_fit + noise_sleep_fit) / 2
    useful_difference = calculate_useful_difference(a, b, cross_fit)

    complement_score = 100 * (
        social_privacy_fit * 0.30
        + noise_sleep_fit * 0.30
        + clean_conflict.fit * 0.25
        + useful_difference * 0.15
    )

    details = ComplementDetails(
        social_privacy_fit=social_privacy_fit,
        noise_sleep_fit=noise_sleep_fit,
        clean_conflict_fit=clean_conflict.fit,
        useful_difference=useful_difference,
        clean_gap=clean_conflict.clean_gap,
        conflict_capacity=clean_conflict.conflict_capacity,
    )

    return round(complement_score, 1), details


# ============================================================
# 8, 9. strengths / risks 생성
# ============================================================

_ITEM_TEMPLATES = {
    "noise": {
        "strength": "소음에 대한 기준이 비슷해 생활 소음 문제로 갈등이 생길 가능성이 낮아요.",
        "risk": "소음 민감도 차이가 커 생활 소음으로 갈등이 생길 수 있어요.",
    },
    "cleanliness": {
        "strength": "청결 기준이 비슷해 청소나 정리정돈 방식이 잘 맞을 가능성이 높아요.",
        "risk": "청결 기준 차이로 청소나 정리정돈 문제에서 갈등이 생길 수 있어요.",
    },
    "sleep": {
        "strength": "생활 및 수면 패턴이 비슷해 함께 생활하기 편할 가능성이 높아요.",
        "risk": "생활 및 수면 시간이 달라 서로의 수면을 방해할 가능성이 있어요.",
    },
    "privacy": {
        "strength": "개인 공간에 대한 기준이 비슷해 서로 편안하게 생활할 가능성이 높아요.",
        "risk": "개인 공간에 대한 요구 수준이 달라 한 사람이 불편함을 느낄 수 있어요.",
    },
    "conflict": {
        "strength": "갈등을 해결하는 방식이 비슷해 문제가 생겼을 때 원활하게 조율할 가능성이 높아요.",
        "risk": "갈등 상황에서 원하는 해결 방식이 달라 의견 충돌이 길어질 수 있어요.",
    },
    "social": {
        "strength": "함께 지내고 교류하는 정도에 대한 선호가 비슷해요.",
        "risk": "한 사람은 교류를 원하고 다른 사람은 혼자 있는 시간을 더 원할 수 있어요.",
    },
}

_CROSS_MESSAGES = {
    "social_privacy_strength": "한 사람의 교류 성향과 다른 사람의 개인공간에 대한 요구가 잘 맞아요.",
    "social_privacy_risk": "한 사람의 교류 욕구가 다른 사람의 개인공간을 침해한다고 느껴질 수 있어요.",
    "noise_sleep_strength": "소음 민감도와 수면 패턴이 잘 맞아 늦은 시간 생활로 인한 충돌 가능성이 낮아요.",
    "noise_sleep_risk": "한 사람의 생활 시간이 다른 사람의 수면을 방해할 가능성이 있어요.",
    "clean_conflict_strength": "청결 기준에는 차이가 있지만 갈등이 생겼을 때 대화로 조율할 가능성이 높아요.",
    "clean_conflict_risk": "청결 기준 차이가 크고 갈등을 조율하는 방식도 달라 생활 중 마찰이 생길 수 있어요.",
}

STRENGTH_DIFF_THRESHOLD = 3
RISK_DIFF_THRESHOLD = 7
MAX_MESSAGES = 3


def _generate_item_level_messages(
    lifestyle_a: LifestyleScores, lifestyle_b: LifestyleScores
) -> Tuple[List[str], List[str]]:
    strengths: List[str] = []
    risks: List[str] = []
    for item in LIFESTYLE_ITEMS:
        diff = abs(getattr(lifestyle_a, item) - getattr(lifestyle_b, item))
        if diff <= STRENGTH_DIFF_THRESHOLD:
            strengths.append(_ITEM_TEMPLATES[item]["strength"])
        elif diff >= RISK_DIFF_THRESHOLD:
            risks.append(_ITEM_TEMPLATES[item]["risk"])
    return strengths, risks


def _generate_cross_level_messages(details: ComplementDetails) -> Tuple[List[str], List[str]]:
    strengths: List[str] = []
    risks: List[str] = []

    if details.social_privacy_fit >= 0.75:
        strengths.append(_CROSS_MESSAGES["social_privacy_strength"])
    if details.social_privacy_fit <= 0.45:
        risks.append(_CROSS_MESSAGES["social_privacy_risk"])

    if details.noise_sleep_fit >= 0.75:
        strengths.append(_CROSS_MESSAGES["noise_sleep_strength"])
    if details.noise_sleep_fit <= 0.45:
        risks.append(_CROSS_MESSAGES["noise_sleep_risk"])

    if details.clean_gap >= 0.375 and details.conflict_capacity >= 0.7:
        strengths.append(_CROSS_MESSAGES["clean_conflict_strength"])
    if details.clean_gap >= 0.375 and details.conflict_capacity <= 0.4:
        risks.append(_CROSS_MESSAGES["clean_conflict_risk"])

    return strengths, risks


def generate_strengths_and_risks(
    lifestyle_a: LifestyleScores,
    lifestyle_b: LifestyleScores,
    complement_details: Optional[ComplementDetails] = None,
) -> Tuple[List[str], List[str]]:
    strengths, risks = _generate_item_level_messages(lifestyle_a, lifestyle_b)

    if complement_details is not None:
        cross_strengths, cross_risks = _generate_cross_level_messages(complement_details)
        strengths = strengths + cross_strengths
        risks = risks + cross_risks

    return strengths[:MAX_MESSAGES], risks[:MAX_MESSAGES]


# ============================================================
# 10~11. 후보 계산 및 Top-N 선정
# ============================================================

def _to_percent(value: float) -> float:
    return round(value * 100, 1)


def calculate_candidate_result(user: UserProfile, candidate: UserProfile) -> dict:
    match_score, similarities, preference_breakdown = calculate_match_score(user, candidate)
    complement_score, complement_details = calculate_complement_score(user, candidate)

    matched_regions = region_matches(user.regions, candidate.regions)

    direct_strengths, direct_risks = generate_strengths_and_risks(
        user.lifestyle, candidate.lifestyle
    )
    complement_strengths, complement_risks = generate_strengths_and_risks(
        user.lifestyle, candidate.lifestyle, complement_details
    )

    return {
        "user_id": candidate.id,
        "match_score": match_score,
        "complement_score": complement_score,
        "matched_regions": matched_regions,
        "lifestyle_similarity": {item: _to_percent(v) for item, v in similarities.items()},
        "preferences": preference_breakdown,
        "complement_details": {
            "social_privacy_fit": _to_percent(complement_details.social_privacy_fit),
            "noise_sleep_fit": _to_percent(complement_details.noise_sleep_fit),
            "clean_conflict_fit": _to_percent(complement_details.clean_conflict_fit),
            "useful_difference": _to_percent(complement_details.useful_difference),
        },
        "direct_strengths": direct_strengths,
        "direct_risks": direct_risks,
        "complement_strengths": complement_strengths,
        "complement_risks": complement_risks,
    }


def find_top_matches(
    user: UserProfile, other_users: List[UserProfile], top_n: int = 3
) -> Tuple[List[dict], List[dict]]:
    candidates = [other for other in other_users if passes_hard_filter(user, other)]
    results = [calculate_candidate_result(user, candidate) for candidate in candidates]

    direct_matches = sorted(results, key=lambda r: r["match_score"], reverse=True)[:top_n]
    complementary_matches = sorted(results, key=lambda r: r["complement_score"], reverse=True)[
        :top_n
    ]

    return direct_matches, complementary_matches