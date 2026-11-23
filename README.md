# frontvalue-assessment

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

Open <http://localhost:3000>. Express serves the built client and `/api` on the same port.

`pnpm build` writes the client and server builds to `src/client/dist` and `src/server/dist`. Run `pnpm start` to serve an existing build.

## Checks

```sh
pnpm lint
pnpm format:check
pnpm test
```
