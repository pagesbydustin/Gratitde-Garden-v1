-- This schema is for documentation purposes and reflects the structure of the data
-- stored in the JSON files.

-- Table structure for Users
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    "can-edit" BOOLEAN NOT NULL
);

-- Table structure for Journal Entries
CREATE TABLE journal_entries (
    id VARCHAR(36) PRIMARY KEY,
    "date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "moodScore" INT NOT NULL,
    text TEXT NOT NULL,
    "userId" INT NOT NULL,
    FOREIGN KEY ("userId") REFERENCES users(id)
);
