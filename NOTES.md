# Notes

While developing I used Codex with GPT 6.2 Sol. Depending on the difficulty of my task or question I mostly use medium/high/extra-high reasoning.

## Work log

- wednesday 18 november
  - (15 min) create repo
  - (30 min) look into architecture and tooling choices
- thursday 19 november
  - (1hr) continue research architecture and tooling
    - first considered Next.js(includes backend), then Vite+. Finally decided on standard Vite for frontend and Express.js for a separate backend.
  - (1hr) scaffold project, initialize frontend and backend code
- friday 20 november
  - (5 min) create AGENTS.md for basic instructions
  - (25 mins) setup component library for frontend, create basic app layout
  - (10 mins) create JokeList component and /api/jokes endpoint that returns 10 jokes
  - (30 mins) create /api/jokes/random endpoint and fetch one random joke every 5 secs. Turn fetching on/off with JokeTimer component
  - (45 mins) add ability to favorite up to 10 jokes, store them in localStorage.
- monday 23 november
  - (30 mins) Do not retrieve jokes of the following categories from the Chuck Norris API: `explicit`, `political`, and `religion`. These are more likely to be inappropriate or sensitive to others.
  - (1hr 30 mins) Research and implement joke filtering via LLM from OpenRouter.
    - researched with Codex how to implement a joke filtering system.
    - researched which model to use, landed upon a model that supports structured outputs. That way we get a reliable JSON structure
  - (15 mins) add command `pnpm run serve:prod` to compile production build and let express.js serve the client bundle.
- tuesday 24 november
  - (15 mins) add Github Action workflow that runs code checks and builds the code
  - (30 mins) finalize documentation in README.md and NOTES.md

## Considerations / decisions

- I chose a standard Vite setup with a separate Express API to keep the OpenRouter key on the server. Vite proxies `/api` during development. In production, Node runs the compiled Express server, which handles `/api` and Express serves the Vite build at '/'
- I exclude `explicit`, `political`, and `religion` jokes at the source and let Gemini 3.1 Flash Lite judge the remaining jokes for a general audience. Structured output lets the server match each verdict to its joke ID. If moderation fails, the API returns an error so unreviewed jokes stay out of the feed.
- The client uses `fetch()` and React state to keep the data flow small. On a larger project I’d consider TanStack Query for fetching and Zustand for state management.
- As project development goes on, make sure AGENTS.md is always up-to-date with the current state of the project.
  - Consider creating specific skills for agents in `.agents/skills`
  - Consider creating a CONVENTIONS.md file and point the AGENTS.md to it. This file may contain a style guide and code conventions the agent should use.
- I considered SQLite for favorites. But the browser's `localStorage` also covers persistence across reloads and keeps the app small. I’d add server-side storage if favorites needed to follow a user across devices.
- Home and Favorites use URL hashes. With two views, that keeps navigation small and lets you open `#favorites` directly, no router needed.
- The Express tests mock both upstream APIs so the checks are repeatable and CI can run without an OpenRouter key.
