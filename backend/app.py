import sqlite3

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import get_connection, init_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


class AuthRequest(BaseModel):
    username: str
    password: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/auth/register")
def register(payload: AuthRequest):
    # NOTE: 해커톤 MVP 범위로 비밀번호를 평문 저장한다.
    # 실제 서비스로 확장할 경우 bcrypt 등 안전한 해싱으로 반드시 교체해야 한다.
    conn = get_connection()
    try:
        cursor = conn.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (payload.username, payload.password),
        )
        conn.commit()
        return {"success": True, "user_id": cursor.lastrowid}
    except sqlite3.IntegrityError:
        return {"success": False, "message": "이미 사용 중인 아이디입니다."}
    finally:
        conn.close()


@app.post("/auth/login")
def login(payload: AuthRequest):
    conn = get_connection()
    row = conn.execute(
        "SELECT user_id, password FROM users WHERE username = ?",
        (payload.username,),
    ).fetchone()
    conn.close()

    if row is None or row["password"] != payload.password:
        return {"success": False, "message": "아이디 또는 비밀번호가 올바르지 않습니다."}

    return {"success": True, "user_id": row["user_id"]}


class LifestyleAnswerIn(BaseModel):
    question_id: str
    lifestyle_key: str
    score: int


class BudgetIn(BaseModel):
    deposit: int
    monthly_rent: int


class HousingConditionsIn(BaseModel):
    guest_allowed: bool
    pet_allowed: bool
    budget: list[BudgetIn]
    notes: str = ""


class LifestylePreferencesSubmission(BaseModel):
    user_id: int
    lifestyle_answers: list[LifestyleAnswerIn]
    housing_conditions: HousingConditionsIn


# 문제별 원본 점수만 저장한다. noise/cleanliness/... 최종 합산은 여기서 하지 않고,
# 이후 별도 집계 로직에서 lifestyle_answers 테이블을 읽어 계산할 예정이다.
# 재제출 시 해당 user_id의 기존 데이터를 덮어쓴다 (사람당 최신 상태 하나만 유지).
@app.post("/lifestyle-preferences")
def submit_lifestyle_preferences(payload: LifestylePreferencesSubmission):
    conn = get_connection()
    try:
        conn.execute(
            "DELETE FROM lifestyle_answers WHERE user_id = ?", (payload.user_id,)
        )
        for answer in payload.lifestyle_answers:
            conn.execute(
                """
                INSERT INTO lifestyle_answers (user_id, question_id, lifestyle_key, score)
                VALUES (?, ?, ?, ?)
                """,
                (payload.user_id, answer.question_id, answer.lifestyle_key, answer.score),
            )

        conn.execute(
            """
            INSERT INTO housing_conditions (user_id, guest_allowed, pet_allowed, notes)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                guest_allowed = excluded.guest_allowed,
                pet_allowed = excluded.pet_allowed,
                notes = excluded.notes
            """,
            (
                payload.user_id,
                payload.housing_conditions.guest_allowed,
                payload.housing_conditions.pet_allowed,
                payload.housing_conditions.notes,
            ),
        )

        conn.execute(
            "DELETE FROM budget_selections WHERE user_id = ?", (payload.user_id,)
        )
        for budget in payload.housing_conditions.budget:
            conn.execute(
                """
                INSERT INTO budget_selections (user_id, deposit, monthly_rent)
                VALUES (?, ?, ?)
                """,
                (payload.user_id, budget.deposit, budget.monthly_rent),
            )

        conn.commit()
        return {"success": True, "user_id": payload.user_id}
    finally:
        conn.close()
