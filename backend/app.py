"""
로그인/회원가입 기능을 담당하는 라우터 모듈.

FastAPI() 앱을 직접 만들지 않고 APIRouter로 정의해서,
main.py에서 매칭 API와 한 서버 + 한 DB 테이블(User)로 합쳐 쓴다.

회원가입 시점에는 User row를 "계정 정보만" 채워서 만든다.
gender/age/lifestyle 등 매칭에 필요한 프로필 정보는 아직 비어있고,
나중에 main.py의 PUT /users/{user_id} 로 채워 넣는다.
"""

import hashlib
import os
import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

import models
from database import get_db

router = APIRouter()


class AuthRequest(BaseModel):
    username: str
    password: str


def _hash_password(password: str, salt: bytes | None = None) -> str:
    """비밀번호를 평문으로 저장하지 않기 위해 salt + PBKDF2로 해싱한다."""
    salt = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return salt.hex() + ":" + digest.hex()


def _verify_password(password: str, stored: str) -> bool:
    salt_hex, _, _ = stored.partition(":")
    salt = bytes.fromhex(salt_hex)
    return _hash_password(password, salt) == stored


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/auth/register")
def register(payload: AuthRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.username == payload.username).first()
    if existing is not None:
        return {"success": False, "message": "이미 사용 중인 아이디입니다."}

    user = models.User(
        id=str(uuid.uuid4()),
        username=payload.username,
        password_hash=_hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    return {"success": True, "user_id": user.id}


@router.post("/auth/login")
def login(payload: AuthRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == payload.username).first()
    if user is None or user.password_hash is None or not _verify_password(payload.password, user.password_hash):
        return {"success": False, "message": "아이디 또는 비밀번호가 올바르지 않습니다."}
    return {"success": True, "user_id": user.id}
