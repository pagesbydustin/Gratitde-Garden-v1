-- This schema is for documentation purposes and reflects the structure of the data
-- stored in the JSON files. The application itself does not use a SQL database.

-- Table structure for Users
CREATE TABLE users (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "can-edit" BOOLEAN NOT NULL DEFAULT FALSE
);

-- Table structure for Journal Entries
CREATE TABLE journal_entries (
    "id" TEXT PRIMARY KEY,
    "date" TEXT NOT NULL,
    "moodScore" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "users" ("id")
);

-- Sample data for Users
INSERT INTO users (id, name, "can-edit") VALUES (1, 'L.R.', 1);
INSERT INTO users (id, name, "can-edit") VALUES (2, 'J.R.', 1);
INSERT INTO users (id, name, "can-edit") VALUES (3, 'Admin', 1);
INSERT INTO users (id, name, "can-edit") VALUES (4, 'D.P.', 1);
INSERT INTO users (id, name, "can-edit") VALUES (5, 'H.D.', 1);
