# frontvalue-assessment

React frontend lives in `src/client`. The standalone Express API backend lives in `src/server`.

## Run locally

Use Node.js 26.13.1 and pnpm 12.21.0. Set `OPENROUTER_API_KEY` in `.env.local` in the project root or in the server environment.

In project root, run:

```sh
pnpm install
pnpm dev
# src/client and src/server will now start
```

Open the URL printed by Vite. On page load the client fetches `GET /api/jokes` through Vite's proxy to Express on port 3000. Express returns ten random Chuck Norris jokes approved for a workplace audience by Gemini 3.1 Flash Lite via OpenRouter.

## Build

```sh
pnpm --filter @frontvalue/client build
pnpm --filter @frontvalue/server build
```

`pnpm build` builds both packages. `pnpm start` runs the compiled Express API on port 3000.

For production, serve `src/client/dist` from a static host and forward `/api` requests to the Express API.

## Checks

```sh
pnpm lint
pnpm format:check
pnpm test
```
