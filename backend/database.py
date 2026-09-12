"""
DB 연결 설정 파일

- SQLite 파일(roommate.db)에 연결하는 엔진을 만든다.
- 요청 하나마다 사용할 DB 세션(SessionLocal)을 만든다.
- 모든 모델(models.py)이 상속받을 Base 클래스를 만든다.

로그인 계정 정보(username/password)도 이제 이 DB의 User 테이블에 함께 저장한다.
(예전에 app.py가 따로 쓰던 raw-sqlite3 + app.db는 더 이상 쓰지 않는다.)

배포 환경에서는 DATABASE_URL 환경변수로 Postgres 등을 지정한다.
지정하지 않으면 로컬 개발용 SQLite 파일을 그대로 사용한다.
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./roommate.db")

# 일부 관리형 Postgres(Render/Heroku 계열)는 postgres:// 형식을 주는데,
# 최신 SQLAlchemy는 postgresql://을 요구한다.
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
