# frontvalue-assessment

See [NOTES.md](NOTES.md) for the work log and more on the decisions made during development.

The React frontend lives in `src/client` and the Express API in `src/server`.

## Run locally

Use Node.js 26.13.1 and pnpm 12.21.0. Set `OPENROUTER_API_KEY` in `.env.local` in the project root or in the server environment.

In project root, run:

```sh
pnpm install
pnpm dev
# src/client and src/server will now start
```

Open the URL printed by Vite. On page load the client fetches `GET /api/jokes` through Vite's proxy to Express on port 3000. Express returns ten random Chuck Norris jokes approved for a workplace audience by Gemini 3.1 Flash Lite via OpenRouter.

## Serve the production build

After installing dependencies and setting the OpenRouter key, run from the project root:

```sh
pnpm serve:prod
```

Open <http://localhost:3000>. Express serves the Vite build and handles `/api` on the same port.

`pnpm build` writes the client and server builds to `src/client/dist` and `src/server/dist`. Run `pnpm start` to serve an existing build.

## Key decisions

- **Vite and Express.** Vite keeps the React setup small. A thin Express API keeps the OpenRouter key on the server.
- **Moderation.** I chose Gemini 3.1 Flash Lite for its low cost and structured output. The server matches verdicts by joke ID and returns only jokes the model explicitly approves.
- **Favorites.** Favorites only need to persist across reloads in the same browser, so `localStorage` is enough.

## Checks

```sh
pnpm lint
pnpm format:check
pnpm test
```
