"""
Dhruva Database Initializer
Creates SQLite database and seeds default onboarding data.
"""
import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'dhruva.db')
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), 'schema.sql')
SEED_PATH = os.path.join(os.path.dirname(__file__), 'onboarding_seed.json')

def init_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Apply schema
    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        cursor.executescript(f.read())

    # Seed default explorer if none exists
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        cursor.execute(
            "INSERT INTO users (id, username, email, explorer_level, current_xp) VALUES (?, ?, ?, ?, ?)",
            ("user-001", "DhruvaVoyager", "explorer@dhruva.dev", 1, 0)
        )
        cursor.execute(
            "INSERT INTO onboarding_progress (user_id, completed_tutorial, selected_archetype, preferred_city) VALUES (?, ?, ?, ?)",
            ("user-001", True, "Curious Nomad", "Pune")
        )
        cursor.execute(
            "INSERT INTO badges_awarded (id, user_id, badge_key, badge_name) VALUES (?, ?, ?, ?)",
            ("badge-001", "user-001", "first_spark", "First Light Explorer")
        )
        conn.commit()
        print("✓ Database initialized with schema and seed data.")
    else:
        print("✓ Database already populated.")

    conn.close()

if __name__ == "__main__":
    init_database()
