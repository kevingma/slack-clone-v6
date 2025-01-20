# Slack Clone v5

A Slack-like real-time chat application built with [Wasp](https://wasp-lang.dev/), React, and PostgreSQL. It supports multiple workspaces, channel-based conversations, direct messages, message threads (like Slack threads), message attachments, and AI-powered auto-replies on mentions (including persona generation).

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
  - [Required Environment Variables](#required-environment-variables)
  - [Optional Environment Variables](#optional-environment-variables)
  - [Tailwind](#tailwind)
  - [Wasp Configuration](#wasp-configuration)
- [Database Setup](#database-setup)
- [Running the App Locally](#running-the-app-locally)
- [Deploying to Fly.io](#deploying-to-flyio)
- [Project Structure](#project-structure)
- [AI Mentions & Persona Generation](#ai-mentions--persona-generation)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

- **Multi-Workspace Support**  
  Users can create multiple workspaces, each containing channels, to keep conversations organized.

- **Channel-based Chat**  
  Within a workspace, you can have numerous channels for group communication.

- **Direct Messages (DMs)**  
  One-on-one private messaging channels between two users.

- **Message Threads**  
  Continue in-depth conversations on a message without cluttering the main channel.

- **Reactions on Messages**  
  React with emojis (e.g., :+1: or :heart:) on any message.

- **Message Attachments**  
  Upload files to any message via Amazon S3. View or download them directly.

- **Authentication**  
  - **Local (username/email + password)**  
  - **Google OAuth**  
  - **GitHub OAuth**

- **User Profiles**  
  - Change your display name.
  - Onboarding flow to finalize username, display name, or other details.

- **AI Mentions**  
  - Mentions of `@DisplayName` can trigger an AI-based auto-response if that user has a persona. 
  - The system can dynamically generate a “persona” for a user based on past messages.

- **TailwindCSS Styling**  
  Use Tailwind classes for quick UI development.

- **Wasp**  
  Wasp provides a simple, declarative way to structure the full-stack (client + server). Build and run the entire app with minimal boilerplate.

---

## Tech Stack

- **Wasp** (Full-stack framework for building React/Node apps)
- **React** (Frontend library)
- **TypeScript** (Type-safe codebase)
- **Node.js** (Server runtime)
- **PostgreSQL** (Database)
- **Prisma** (Database ORM)
- **TailwindCSS** (Utility-first CSS framework)
- **AWS S3** (File storage for attachments)
- **OpenAI API** (AI auto-replies with persona generation)

---

## Prerequisites

1. **Wasp CLI**  
   Install Wasp by following [the official instructions](https://wasp-lang.dev/docs#installation):
   ```bash
   curl -sSL https://get.wasp-lang.dev/installer.sh | sh -
   ```
2. **Node.js** (v16 or above recommended)
3. **npm** or **yarn** (whichever you prefer)
4. **PostgreSQL** database (reachable via `DATABASE_URL` env var)
5. **AWS S3 Bucket** (for file attachments)
6. **OpenAI Account** + **API Key** (for AI-based auto-replies and persona generation, optional if you don’t need AI features)

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
   or
   ```bash
   yarn
   ```

---

## Configuration

### Required Environment Variables

Create a `.env` (or `.env.server`) file in the project root. You **must** provide:

```bash
# Database URL (PostgreSQL)
DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DB_NAME>"

# For local signups:
JWT_SECRET="<some_random_string>"

# For Google OAuth
GOOGLE_CLIENT_ID="<your_google_oauth_client_id>"
GOOGLE_CLIENT_SECRET="<your_google_oauth_client_secret>"

# For GitHub OAuth
GITHUB_CLIENT_ID="<your_github_client_id>"
GITHUB_CLIENT_SECRET="<your_github_client_secret>"

# For S3 uploads
AWS_S3_BUCKET="<your_aws_s3_bucket_name>"
AWS_S3_REGION="<your_s3_bucket_region>"
AWS_ACCESS_KEY_ID="<your_aws_access_key>"
AWS_SECRET_ACCESS_KEY="<your_aws_secret_access_key>"

# For AI (OpenAI)
OPENAI_API_KEY="<your_openai_api_key>"
```

> **Note**: The `JWT_SECRET` is required by Wasp for authentication. Make sure it is a sufficiently random and secure string in production.

### Optional Environment Variables

- **`PRIMARY_REGION`** (Fly.io)  
  If using Fly.io, you can specify the primary region for the server (e.g., `iad`, `fra`, etc.) in the `fly-server.toml`.
- **`PORT`**  
  You can override the default port if needed (`3000` for the dev server).

### Tailwind

- **Configuration**  
  - `tailwind.config.cjs`
  - `postcss.config.cjs`

- **Global Styles**  
  - `Main.css` in `src/client/`

You can adjust colors, themes, etc. in the `tailwind.config.cjs`.

### Wasp Configuration

Wasp uses a single configuration file, **`main.wasp`**, to define:

- **App info**  
- **Routes**  
- **Pages**  
- **Auth** (local, Google, GitHub)  
- **Queries/Actions** (pointing to your server code)  

---

## Database Setup

1. **Run Migrations**  
   Make sure PostgreSQL is running. Then:
   ```bash
   wasp db migrate-dev
   ```
   This will create or update the tables in your PostgreSQL database as defined by `schema.prisma`.

2. **(Optional) Seeding**  
   If you have a seed script, run:
   ```bash
   wasp db seed
   ```
   or create your initial data manually.

---

## Running the App Locally

1. **Start the Application**  
   ```bash
   wasp start
   ```
   - This compiles the Prisma client and starts both the server (Node) and client (Vite) on port `3000`.
   - Visit [http://localhost:3000](http://localhost:3000) to load the app.

2. **Login / Signup**  
   - **Sign Up** with either local credentials (email/password), Google, or GitHub (depending on your environment variables).
   - After a fresh signup, you’ll be prompted for Onboarding (to set a display name, etc.).

3. **Play around**  
   - Create or join a workspace.  
   - Create channels.  
   - Send messages and attachments in a channel.  
   - Mention other users with `@DisplayName`.  
   - If AI is configured, the mentioned user’s persona might auto-reply.

---

## Deploying to Fly.io

This project includes **`fly-server.toml`** (for the server) and **`fly-client.toml`** (for the client).

1. **Install Fly CLI**  
   Refer to [Fly.io docs](https://fly.io/docs/hands-on/installing/) for CLI instructions.

2. **Login to Fly**  
   ```bash
   fly auth login
   ```

3. **Create/Configure**  
   - Update `fly-server.toml` and `fly-client.toml` to your desired app names, regions, etc.
   - Run `fly apps create <app-name>` or let Fly do it automatically upon first deploy.

4. **Deploy**  
   - **Server**:  
     ```bash
     cd path/to/project
     # Ensure environment variables are set in Fly secrets
     fly secrets set DATABASE_URL="..."
     fly secrets set JWT_SECRET="..."
     # etc.
     fly deploy -c fly-server.toml
     ```
   - **Client**:  
     ```bash
     fly deploy -c fly-client.toml
     ```

5. **Check Logs**  
   ```bash
   fly logs -c fly-server.toml
   ```

---

## Project Structure

A simplified overview:

```
cursor-template/
├── main.wasp                # Wasp config: routes, auth, etc.
├── schema.prisma            # Database schema (Prisma)
├── package.json             # Dependencies
├── README.md                # (You are here)
├── tailwind.config.cjs      # Tailwind config
├── postcss.config.cjs       # PostCSS config for Tailwind
├── public/
│   └── logo.webp            # Public assets
├── src/
│   ├── auth/                # Auth logic (Login, Signup, OAuth, Onboarding)
│   ├── chatFeature/         # Chat logic (channels, messages, reactions, threads)
│   ├── dmFeature/           # Direct message logic
│   ├── aiFeature/           # AI integration (persona generation, AI replies)
│   ├── workspaceFeature/    # Workspaces (CRUD & membership)
│   ├── userFeature/         # User profile & display name updates
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities (e.g., `utils.ts`)
│   └── client/              # React client files
│       ├── Main.tsx         # Root component used by Wasp
│       ├── LandingPage.tsx  # Landing page
│       ├── Main.css         # Global Tailwind styles
│       └── components/      # Reusable UI components
└── ...
```

---

## AI Mentions & Persona Generation

When a user is mentioned (e.g., `@JohnDoe`) in a channel message:

1. **Check for user’s persona**  
   - If the user has a `persona` string in the database, the code can generate a reply automatically.
   - If the user’s `persona` is empty, the app attempts to create it by analyzing that user’s entire message history.

2. **OpenAI Integration**  
   - The code calls the OpenAI Chat Completion API with a prompt that includes:
     - The user’s persona
     - The entire channel’s conversation so far
     - The mention content (what triggered the mention)
   - The AI responds in the style described by the persona.

3. **AI’s Response**  
   - The auto-generated reply appears as a new message from a bot user (with `userId = 1` by default).

> **Important**: You need `OPENAI_API_KEY` set in your environment for this to work.

---

## Troubleshooting

- **Database Connection Errors**  
  - Confirm your `DATABASE_URL` in `.env`.  
  - Ensure PostgreSQL is running and accessible.

- **OAuth Failures**  
  - Check your Google/GitHub Client IDs and secrets.  
  - Verify callback URLs in the provider settings match your deployment or localhost config.

- **Missing S3 / AWS Credentials**  
  - Ensure `AWS_S3_BUCKET`, `AWS_S3_REGION`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY` are set.

- **AI Not Responding**  
  - Make sure `OPENAI_API_KEY` is valid.  
  - Check logs for rate limits or OpenAI errors.

- **Persona Not Generated**  
  - The code attempts to create a persona if it’s missing when a user is first mentioned. If the user has not posted any messages, the persona might remain very generic.

- **Port Conflicts**  
  - Wasp dev server defaults to port 3000. If it’s taken, free it or update config.

---

## License

This project is provided under the [MIT License](https://opensource.org/licenses/MIT). You’re free to use and modify it as needed.

---

Happy Hacking! If you find bugs or improvements, open an issue or submit a PR.