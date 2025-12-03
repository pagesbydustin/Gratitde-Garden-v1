-- This SQL script defines the database schema for the Gratitude Garden application.
-- It is based on the entities defined in `docs/backend.json`.

-- Users Table
-- Stores user profile information.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

-- Journal Entries Table
-- Stores the gratitude entries for each user.
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
    text TEXT NOT NULL,
    prompt VARCHAR(255),
    user_id INTEGER NOT NULL,
    
    -- Foreign key constraint to link entries to a user.
    -- If a user is deleted, all their entries are also deleted.
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(date);
