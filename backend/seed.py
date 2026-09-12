"""
테스트용 시드 데이터 생성 스크립트.

실행 방법:
    python seed.py
"""

from database import Base, engine, SessionLocal
import models


def reset_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def add_user(
    db, user_id, gender, age, is_smoker, regions, lifestyle,
    guest_allowed, pet_allowed, budgets, notes="",
):
    user = models.User(id=user_id, gender=gender, age=age, is_smoker=is_smoker)
    db.add(user)

    for region in regions:
        db.add(models.UserRegion(user_id=user_id, region=region))

    db.add(models.Lifestyle(user_id=user_id, **lifestyle))

    db.add(models.Preference(
        user_id=user_id, guest_allowed=guest_allowed, pet_allowed=pet_allowed, notes=notes,
    ))

    for deposit_min, deposit_max, rent_min, rent_max in budgets:
        db.add(models.BudgetPreference(
            user_id=user_id, deposit_min=deposit_min, deposit_max=deposit_max,
            monthly_rent_min=rent_min, monthly_rent_max=rent_max,
        ))


def seed(db):
    COMMON_BUDGET = [(1000, 2000, 50, 70)]

    def ls(noise, cleanliness, sleep, privacy, conflict, social):
        return dict(noise=noise, cleanliness=cleanliness, sleep=sleep,
                    privacy=privacy, conflict=conflict, social=social)

    add_user(db, "user001", "F", 25, False, ["안암", "보문"],
             ls(8, 8, 8, 8, 8, 8), True, True, COMMON_BUDGET,
             notes="깔끔한 룸메이트를 찾고 있어요.")

    add_user(db, "user002", "F", 24, True, ["안암"],
             ls(7, 9, 7, 9, 7, 9), True, True, COMMON_BUDGET)

    contradictory = ls(14, 8, 2, 14, 8, 14)
    add_user(db, "user003", "F", 27, False, ["안암"], contradictory, True, True, COMMON_BUDGET)
    add_user(db, "user004", "F", 26, False, ["안암", "제기동"], contradictory, True, True, COMMON_BUDGET)

    add_user(db, "user005", "F", 23, False, ["안암"],
             ls(3, 4, 12, 2, 4, 14), True, False, COMMON_BUDGET)
    add_user(db, "user006", "F", 29, True, ["안암", "보문"],
             ls(12, 12, 3, 2, 12, 14), True, False, COMMON_BUDGET)

    add_user(db, "user007", "F", 28, False, ["안암"],
             ls(16, 16, 16, 16, 16, 16), True, True, COMMON_BUDGET)
    add_user(db, "user008", "F", 22, True, ["안암"],
             ls(0, 0, 0, 0, 0, 0), True, True, COMMON_BUDGET)

    add_user(db, "user009", "F", 24, False, ["안암"],
             ls(14, 8, 2, 8, 8, 8), True, True, COMMON_BUDGET)
    add_user(db, "user010", "F", 25, False, ["안암", "회기"],
             ls(2, 8, 14, 8, 8, 8), True, True, COMMON_BUDGET)

    add_user(db, "user011", "F", 26, False, ["안암"],
             ls(8, 2, 8, 8, 14, 8), True, True, COMMON_BUDGET)
    add_user(db, "user012", "F", 27, False, ["안암"],
             ls(8, 14, 8, 8, 14, 8), True, True, COMMON_BUDGET)

    add_user(db, "user013", "F", 23, True, ["안암"],
             ls(8, 2, 8, 8, 2, 8), True, True, COMMON_BUDGET)
    add_user(db, "user014", "F", 24, False, ["안암"],
             ls(8, 14, 8, 8, 2, 8), True, True, COMMON_BUDGET)

    add_user(db, "user015", "M", 25, False, ["안암"],
             ls(8, 8, 8, 8, 8, 8), True, True, COMMON_BUDGET)

    add_user(db, "user016", "F", 26, False, ["논현"],
             ls(8, 8, 8, 8, 8, 8), True, True, COMMON_BUDGET)

    add_user(db, "user017", "F", 27, False, ["안암"],
             ls(8, 8, 8, 8, 8, 8), True, True, [(5000, 6000, 150, 200)])


def main():
    reset_database()
    db = SessionLocal()
    try:
        seed(db)
        db.commit()
        print("시드 데이터 생성 완료: user001 ~ user017")
    finally:
        db.close()


if __name__ == "__main__":
    main()