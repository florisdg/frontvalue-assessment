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

## Considerations / decisions

- To keep project simple and small size no fetching library or state management library was used for React. Instead, API's are consumed with basic `fetch()` and React's builtin state management `useState()`. On a larger project I recommend using a state management library and fetching library. (I personally like Zustand for state and TanStack Query for fetching)
- As project development goes on, make sure AGENTS.md is always up-to-date with the current state of the project.
  - Consider creating specific skills for agents in `.agents/skills`
  - Consider creating a CONVENTIONS.md file and point the AGENTS.md to it. This file may contain a style guide and code conventions the agent should use.
- favorite jokes are stored in localStorage for persistence, but should really be stored in a database. I did consider `sqlite` but wanted to keep the project small.
- No proper router has been setup for the frontend. There are no true URLs you can navigate to.
