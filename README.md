# frontvalue-assessment

React frontend lives in `src/client`. The standalone Express API backend lives in `src/server`.

## Run locally

Use Node.js 26.13.1 and pnpm 12.21.0.

In project root, run:

```sh
pnpm install
pnpm dev
# src/client and src/server will now start
```

Open the URL printed by Vite. The client fetches `GET /api/hello` through Vite's proxy to Express on port 3000.

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
