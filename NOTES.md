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
  - create AGENTS.md for basic instructions

## Considerations

- To keep project simple and small size no fetching library or state management library was used for React. Instead, API's are consumed with basic `fetch()` and React's builtin state management `useState()`. On a larger project I recommend using a state management library and fetching library. (I personally like Zustand for state and TanStack Query for fetching)
- As project development goes on, make sure AGENTS.md is always up-to-date with the current state of the project.
  - Consider creating specific skills for agents in `.agents/skills`
  - Consider creating a CONVENTIONS.md file  and point the AGENTS.md to it. This file may contain a style guide and code conventions the agent should use.
