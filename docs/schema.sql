CREATE TABLE "users" (
  "id" INTEGER PRIMARY KEY,
  "name" TEXT NOT NULL,
  "can_edit" BOOLEAN NOT NULL
);

CREATE TABLE "journal_entries" (
  "id" TEXT PRIMARY KEY,
  "date" TEXT NOT NULL,
  "mood_score" INTEGER NOT NULL,
  "text" TEXT NOT NULL,
  "user_id" INTEGER NOT NULL,
  FOREIGN KEY ("user_id") REFERENCES "users" ("id")
);
