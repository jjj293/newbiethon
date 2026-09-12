"""
SQLAlchemy ORM 모델 정의 파일
"""

from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)

    # 로그인 계정 정보. 회원가입 시점에는 이것만 채워진다.
    username = Column(String, nullable=True, unique=True, index=True)
    password_hash = Column(String, nullable=True)

    # 프로필 정보. 온보딩(설문) 전에는 전부 비어있을 수 있어서 nullable로 둔다.
    nickname = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    is_smoker = Column(Boolean, nullable=True)

    regions = relationship(
        "UserRegion", back_populates="user", cascade="all, delete-orphan"
    )
    lifestyle = relationship(
        "Lifestyle", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    preferences = relationship(
        "Preference", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    budgets = relationship(
        "BudgetPreference", back_populates="user", cascade="all, delete-orphan"
    )


class UserRegion(Base):
    __tablename__ = "user_regions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    region = Column(String, nullable=False)

    user = relationship("User", back_populates="regions")


class Lifestyle(Base):
    __tablename__ = "lifestyles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True, index=True)

    noise = Column(Integer, nullable=False)
    cleanliness = Column(Integer, nullable=False)
    sleep = Column(Integer, nullable=False)
    privacy = Column(Integer, nullable=False)
    conflict = Column(Integer, nullable=False)
    social = Column(Integer, nullable=False)

    user = relationship("User", back_populates="lifestyle")


class Preference(Base):
    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True, index=True)

    guest_allowed = Column(Boolean, nullable=False)
    pet_allowed = Column(Boolean, nullable=False)
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="preferences")


class BudgetPreference(Base):
    __tablename__ = "budget_preferences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

    deposit_min = Column(Integer, nullable=False)
    deposit_max = Column(Integer, nullable=False)
    monthly_rent_min = Column(Integer, nullable=False)
    monthly_rent_max = Column(Integer, nullable=False)

    user = relationship("User", back_populates="budgets")