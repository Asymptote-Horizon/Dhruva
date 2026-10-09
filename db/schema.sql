-- Dhruva Geospatial & User State Relational Schema
-- SQLite / PostgreSQL Compatible

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT,
    explorer_level INTEGER DEFAULT 1,
    current_xp INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS onboarding_progress (
    user_id TEXT PRIMARY KEY,
    completed_tutorial BOOLEAN DEFAULT FALSE,
    selected_archetype TEXT DEFAULT 'Curious Nomad', -- 'Citadel Historian', 'Urban Sentinel', 'Night Voyager'
    permissions_granted BOOLEAN DEFAULT FALSE,
    preferred_city TEXT DEFAULT 'Pune',
    onboarded_at TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_checkins (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    place_id TEXT NOT NULL,
    city TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    safety_rating INTEGER, -- 1-5 user perceived safety
    notes TEXT,
    checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS user_quests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    quest_title TEXT NOT NULL,
    city TEXT NOT NULL,
    target_poi_id TEXT NOT NULL,
    xp_reward INTEGER DEFAULT 100,
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'COMPLETED', 'EXPIRED'
    completed_at TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS badges_awarded (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    badge_key TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
