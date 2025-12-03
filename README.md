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

1.  **Select a User:** The application starts with the "Admin" profile selected. To begin as a regular user, use the user selection dropdown in the header to choose a profile.
2.  **Admin Access:** To access the admin portal, keep the "Admin" user selected and click on any navigation link. You will be prompted to enter the admin passcode (the default is `admin123`). This will take you to the Admin Portal where you can manage users or view application stats.
3.  **Write an Entry:** As a regular user, fill out the form on the homepage to record your daily gratitude and mood.
4.  **Explore:** Check out the "Weekly Archive" and "Yearly Overview" pages to reflect on your journey.

## Tech Stack

- [Next.js](https://nextjs.org/): A React framework for building server-side rendered and static web applications.
- [React](https://reactjs.org/): A JavaScript library for building user interfaces.
- [Tailwind CSS](https://tailwindcss.com/): A utility-first CSS framework for rapid UI development.
- [Shadcn/ui](https://ui.shadcn.com/): A collection of re-usable components built with Radix UI and Tailwind CSS.
- [date-fns](https://date-fns.org/): A modern JavaScript date utility library.
- [Lucide React](https://lucide.dev/): A beautiful and consistent icon toolkit.
- [Recharts](https://recharts.org/): A composable charting library built on React components.
- **Local JSON files**: Used for data storage in this demonstration. Note: in a production environment with a read-only filesystem, new data will not persist across sessions.

