# Gratitude Garden - Application Blueprint

This document outlines the architecture, features, and data model for the Gratitude Garden application.

## 1. Core Concept

A digital journaling application designed to help users cultivate joy and reflection by recording daily gratitude entries. The app provides a calm, focused environment for users to track their mood and review their journey over time.

## 2. Core Features

- **Daily Gratitude Entries:** Users can write down what they're thankful for each day.
- **Mood Tracking:** Users can record their mood with each entry to see how their gratitude practice affects their well-being.
- **Daily Prompt:** The application provides a thoughtful prompt to guide daily reflection.
- **Entry Browsing:**
    - **Weekly Archive:** Users can review their past entries, grouped by week.
    - **Yearly Overview:** Users can visualize their mood trends over the year with a simple chart.
- **User Profiles:** The app supports multiple user profiles, allowing different people to use the application on the same device.
- **Admin Dashboard:** A protected area for an admin user to manage user profiles and application settings.
- **Data Persistence:** All data is stored in local JSON files (`users.json`, `entries.json`, `settings.json`) to ensure it persists between sessions in a local development environment.
- **AI Mood Analysis (Future):** Suggest related previous entries with similar mood scores as a tool for inspiration.

## 3. Technical Architecture

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **UI Library:** React with Shadcn/ui components
- **Styling:** Tailwind CSS
- **State Management:** React Context API for managing global user and settings state.
- **Data Storage:** Local JSON files managed by server-side actions in Next.js.
- **Authentication:** A simple profile-switching mechanism. Admin access is protected by a passcode stored in an environment variable.

## 4. Data Models

The application uses two primary data models, defined in `docs/backend.json`.

### User

Represents a user of the application.

| Field      | Type      | Description                                                    | Required |
|------------|-----------|----------------------------------------------------------------|----------|
| `id`       | `string`  | A unique identifier for the user.                              | Yes      |
| `name`     | `string`  | The display name of the user.                                  | Yes      |
| `email`    | `string`  | The user's email address.                                      | Yes      |

### JournalEntry

Represents a single gratitude journal entry.

| Field         | Type      | Description                                                                    | Required |
|---------------|-----------|--------------------------------------------------------------------------------|----------|
| `id`          | `string`  | A unique identifier for the entry.                                             | Yes      |
| `date`        | `string`  | The ISO 8601 date string of when the entry was created.                        | Yes      |
| `moodScore`   | `number`  | A numerical score from 1 to 5 representing the user's mood.                    | Yes      |
| `text`        | `string`  | The text content of the journal entry.                                         | Yes      |
| `prompt`      | `string`  | An optional prompt that inspired the entry.                                    | No       |
| `userId`      | `string`  | The ID of the user who created the entry, linking to a User document.          | Yes      |
