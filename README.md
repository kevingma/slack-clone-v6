## Wasp Cursor IDE Template

This is a template to help you build your Wasp app with the [Cursor IDE](https://cursor.sh/).

## Getting Started

1. Make sure you have Wasp installed: `curl -sSL https://get.wasp-lang.dev/installer.sh | sh -s`
2. Run `wasp new -t cursor-template` to fetch the template.
3. Position yourself in the project directory: `cd cursor-template`
4. Run `wasp db start` to start the Postgres database.
5. In a new terminal, run `wasp db migrate-dev` to migrate the database.
6. Run `wasp start` to start the development server.

## How it works with Cursor

We've included a `.cursorrules` file that provides context to the Cursor AI so that it can help you build your Wasp app. Make sure Cursor can access this file by going to `preferences > cursor settings > general > include .cursorrules file`.

The `.cursorrules` file is our attempt at fixing the common mistakes the AI assistants make while building a Wasp full-stack app, but if you find that the AI is still making mistakes, you can try to add more context to the `.cursorrules` file, or within the Cursor settings.

Also, make sure you have the [Wasp docs](https://wasp-lang.dev/docs) indexed in Cursor. You can do this by going to `preferences > cursor settings > features > add new doc `. Then, you can include them in Cursor chat by using the `@docs` keyword. This often improves the AI's ability to help you with Wasp-specific code.
