# Gratitude Garden

A simple application to cultivate joy and reflection, one entry at a time. This project is built with Next.js, React, and Tailwind CSS, featuring local JSON file-based data storage.

## Features

- **Daily Gratitude Entries:** Write down what you're thankful for each day.
- **Mood Tracking:** Record your mood with each entry to see how your gratitude practice affects your well-being.
- **Weekly Archive:** Review your past entries, grouped by week.
- **Yearly Overview:** Visualize your mood trends over the year with a simple chart.
- **User Profiles:** Switch between different user profiles.
- **Admin Portal:** A dedicated, passcode-protected dashboard for managing users, application settings, and viewing aggregated user statistics.
- **Configurable Settings:** Admins can change the daily gratitude prompt and toggle UI elements.
- **Email Archive:** Send a formatted archive of all your entries to your email.
- **Speech-to-Text:** Use your microphone to dictate journal entries.

## Getting Started

1.  **Select a User:** Use the user selection dropdown in the header to choose a profile. The application starts with the "Admin" profile selected by default.
2.  **Admin Access:** To access admin features, select the "Admin" user and enter the passcode (the default is `admin123`). This will take you to the Admin Portal where you can manage users or view application stats.
3.  **Write an Entry:** As a regular user, fill out the form on the homepage to record your daily gratitude and mood.
4.  **Explore:** Check out the "Weekly Archive" and "Yearly Overview" pages to reflect on your journey.

## Tech Stack

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- Local JSON files for data storage (Note: this is for demonstration purposes; in a production environment, new data will not persist on a read-only filesystem).
