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
