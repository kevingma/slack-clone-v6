## Wasp Cursor IDE Template

This is a basic starter template for [Wasp](https://wasp-lang.dev/) apps but with a couple of modifications to give you the best experience when using the [Cursor IDE](https://cursor.sh/) for development. Specifically, a `.cursorrules` file optimized for Wasp apps, and Wasp example code curated specifically for Cursor.

## Getting Started

1. Make sure you have Wasp installed: `curl -sSL https://get.wasp-lang.dev/installer.sh | sh -s`
2. Create a new repo from this template: [Use the Wasp Cursor Template](https://github.com/wasp-lang/cursor-template/generate)
3. Clone your new repo: `git clone https://github.com/<your-username>/<your-repo-name>.git`
4. Position yourself in the project directory: `cd <your-repo-name>`
5. Run `wasp db start` to start the Postgres database.
6. In a new terminal, run `wasp db migrate-dev` to migrate the database.
7. Run `wasp start` to start the development server.

## How it works with Cursor

We've included a `.cursorrules` file that provides context to the Cursor AI so that it can help you build your Wasp app. Make sure Cursor can access this file by going to `preferences > cursor settings > general > include .cursorrules file`.

The `.cursorrules` file is our attempt at fixing the common mistakes the AI assistants make while building a Wasp full-stack app, but if you find that the AI is still making mistakes, you can try to add more context to the `.cursorrules` file, or within the Cursor settings.

Also, make sure you have the [Wasp docs](https://wasp-lang.dev/docs) indexed in Cursor. You can do this by going to `preferences > cursor settings > features > add new doc `. Then, you can include them in Cursor chat by using the `@docs` keyword. This often improves the AI's ability to help you with Wasp-specific code.

## Project Structure

The project is structured to offer just enough context for the AI to help you with Wasp-specific code, and to get you started with building your app quickly, but without overwhelming you with too much code.

In the sections below, we'll go through each directory and explain why we've included them and what they do.

```
src/
├── auth/                          // Auth-related files
├── client/                        // Client-only components and the Main.tsx app wrapper
├── exampleNotesFeature/           // Example feature code (for Cursor)
│   ├── ExampleNotePage.tsx           
│   ├── ExampleNoteDashboard.tsx      
│   └── operations.ts              // Example server-side functions 
├── main.wasp                      // App configuration file where you can define routes, auth, operations, etc.
├── .cursorrules                   // Cursor rules file / where the magic happens
```

### `main.wasp`

The `main.wasp` file is the main configuration file for your app. It's where you define your routes, auth, operations, etc.

This is Wasp's secret sauce and allows Wasp to generate the full-stack code for your app, so you can just focus on writing the business logic.

For more info on Wasp's config file and how Wasp works, check out the [Wasp Introduction](https://wasp-lang.dev/docs#so-what-does-the-code-look-like).

### Auth

The `auth` directory contains the login and signup pages. They import and take advantage of Wasp's Auth API to handle the full-stack auth logic for you. E.g., after defining the Auth methods you'd like to use in `main.wasp`, Wasp will generate the login and signup forms for the defined methods, and handle the full-stack auth logic for you, including validation, error handling, etc.

For more info on Wasp Auth, check out the [Wasp Auth docs](https://wasp-lang.dev/docs/auth/overview).

### Client

The `client` directory contains the client-only components and the `Main.tsx` app wrapper. It also contains the `Main.css` file, which imports Tailwind CSS so you can can get started styling your app with Tailwind without having to configure it yourself.

### Example Notes Feature

The `exampleNotesFeature` directory contains the example full-stack feature code. It's a simple page that allows you to create, read, update, and delete notes.

This feature is a good starting point for the AI to reference and use an example when creating new features for your app. It is especially convenient when using Cusror Compose to create and edit features across multiple files. Once you start building out a feature set of your own, you can delete this example feature if you like.

Note that this directory includes an `operations.ts` file, which contains the server-side functions for the feature. Because these functions are defined in the `main.wasp` file, Wasp will configure the server to use them, and also make them available to the client.

For more info on Wasp Operations, check out the [Wasp Operations docs](https://wasp-lang.dev/docs/data-model/operations/overview).

## Extra help

If you get stuck, you can ask for help on the [Wasp Discord](https://discord.gg/rzdnErX). =}