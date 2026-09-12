import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "app.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
        """
    )
    # 문제별 원본 점수만 저장한다. noise/cleanliness/... 최종 합산은 여기서 하지 않는다.
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS lifestyle_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            question_id TEXT NOT NULL,
            lifestyle_key TEXT NOT NULL,
            score INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS housing_conditions (
            user_id INTEGER PRIMARY KEY,
            guest_allowed BOOLEAN NOT NULL,
            pet_allowed BOOLEAN NOT NULL,
            notes TEXT DEFAULT '',
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS budget_selections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            deposit INTEGER NOT NULL,
            monthly_rent INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        )
        """
    )
    conn.commit()
    conn.close()
