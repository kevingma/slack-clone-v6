# Slack Clone v5

A Slack-like real-time chat application built with [Wasp](https://wasp-lang.dev/), React, and PostgreSQL. It supports multiple workspaces, channel-based conversations, direct messages, and message threads (like Slack threads), all in a modern TypeScript codebase with TailwindCSS styling.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

- **Multi-workspace Support**  
  Users can create and switch between multiple workspaces.

- **Channel-based Chat**  
  Each workspace supports multiple channels for group communication.

- **Direct Messages (DMs)**  
  One-on-one or multi-user private messaging channels.

- **Message Threads**  
  Continue in-depth discussions without cluttering the main channel.

- **Reactions on Messages**  
  React with emojis to any message.

- **Authentication**  
  - **Local (username/email + password)**  
  - **Google OAuth**  
  - **GitHub OAuth**

- **User Profiles**  
  Update display name and other details.

- **Built-in Onboarding**  
  Guiding newly registered users to complete their profile.

- **TailwindCSS Styling**  
  Simplify the UI design process with TailwindCSS utility classes.

---

## Tech Stack

- **Wasp** (Full-stack framework for building React/Node apps with minimal boilerplate)  
- **React** (Frontend library)  
- **TypeScript** (Strong typing for both client and server)  
- **Node.js** (Server runtime)  
- **PostgreSQL** (Database)  
- **Prisma** (Database ORM)  
- **TailwindCSS** (Utility-first CSS framework)

---

## Prerequisites

1. **Wasp CLI**  
   Install Wasp using the official instructions:
   ```bash
   curl -sSL https://get.wasp-lang.dev/installer.sh | sh -
   ```
2. **Node.js** (v16 or above recommended)
3. **npm** (comes with Node) or **yarn** (optional)
4. **PostgreSQL** database (accessible via `DATABASE_URL` environment variable)

---

## Installation

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/your-username/slack-clone-wasp.git
   cd slack-clone-wasp
   ```

2. **Install Dependencies**  
   ```bash
   npm install
   ```
   > Or use your preferred package manager (e.g., `yarn`).

---

## Configuration

1. **Environment Variables**  
   Provide database access and OAuth credentials. For example:
   ```bash
   # .env or .env.server (Wasp's recommended approach)
   DATABASE_URL=postgresql://user:pass@localhost:5432/slack_clone_db
   GITHUB_CLIENT_ID=...
   GITHUB_CLIENT_SECRET=...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```
   The above keys should match how your provider gave them to you, and must align with how you defined your Google and GitHub login flows in:
   ```
   src/auth/google.js
   src/auth/github.js
   ```

2. **Tailwind**  
   Configuration is in `tailwind.config.cjs` and `postcss.config.cjs`. Adjust as needed.

3. **Wasp Configuration**  
   All Wasp-specific config (routes, pages, auth methods, etc.) is in `main.wasp`.

---

## Database Setup

1. **Initialize the Database**  
   Ensure PostgreSQL is running. Then run migrations:
   ```bash
   wasp db migrate-dev
   ```
   This will create the necessary tables in your database.

2. **(Optional) Seed Data**  
   If you have a seeding script, run it (e.g., `wasp db seed`). If not, proceed with an empty database.

---

## Running the App

1. **Start the Application**  
   ```bash
   wasp start
   ```
   This command will:
   - Compile the Prisma client.
   - Launch the web server on the default port (localhost:3000).
   - Launch the frontend dev server on localhost:3000.

2. **Open in Browser**  
   Visit [http://localhost:3000](http://localhost:3000) to see the Slack Clone in action.

3. **Login / Signup**  
   - Click **Sign Up** to create a new account (local or via Google/GitHub).
   - After logging in, you’ll be redirected to the **Onboarding** page (if you haven’t set a proper username or display name yet).

---

## Project Structure

A simplified overview of the folders and files:

```
cursor-template/
├── schema.prisma            # Database schema for Prisma
├── main.wasp                # Wasp config for routes, auth, etc.
├── package.json             # Project dependencies & scripts
├── tailwind.config.cjs      # Tailwind configuration
├── postcss.config.cjs       # PostCSS configuration for Tailwind
├── public/
│   └── logo.webp            # Public assets
├── src/
│   ├── auth/                # Auth pages & logic
│   ├── chatFeature/         # Chat operations & pages
│   ├── dmFeature/           # Direct Messaging operations & pages
│   ├── workspaceFeature/    # Workspaces (CRUD & logic)
│   ├── userFeature/         # User profile & settings
│   ├── client/              # React client files
│   │   ├── components/      # Reusable React components for the landing page
│   │   ├── Main.tsx         # Root component used by Wasp
│   │   ├── LandingPage.tsx  # The landing page
│   │   └── Main.css         # Global Tailwind styles
└── ...
```

---

## Troubleshooting

- **Database Connection Errors**  
  Check your `DATABASE_URL` in `.env.server` or `.env`. Confirm that PostgreSQL is running and reachable.

- **OAuth Failures**  
  Ensure your Google/GitHub Client IDs and Secrets are correct and the callback URLs match your provider settings.

- **Port Conflicts**  
  By default, Wasp uses port 3000. If that port is in use, free it or adjust the config.

---

## License

This project is provided under the [MIT License](https://opensource.org/licenses/MIT). You’re free to use and modify it as needed.

---

Happy hacking! Feel free to open issues or PRs if you spot any bugs or want to propose improvements.