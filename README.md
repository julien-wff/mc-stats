# MC Stats

A small Svelte app that turns a Minecraft world’s `stats/` folder into a readable leaderboard.

<img width="1419" height="920" alt="demo" src="https://github.com/user-attachments/assets/f8712125-e908-4cac-b225-b54469fb0731" />

Public URL: https://mcstats.netlify.app/

## What it does

-   You upload the `stats` folder from a Minecraft world save (files named `<uuid>.json`).
-   The app parses each player’s stats JSON.
-   It aggregates a few “main” stats (e.g. time played, deaths, distance, blocks broken/placed, crafts, and similar) and displays them as leaderboards.
-   Player UUIDs are resolved to player names using mojang's public API.

## Where to find the `stats/` folder

In a world save directory:

-   **Java Edition**: `.minecraft/saves/<world>/stats/`

You should upload the folder that contains files like:

-   `0f84c…-….json`
-   `a12bd…-….json`

## Development

Install dependencies and run locally:

```sh
bun install
bun run dev
```

Build a production version:

```sh
bun run build
bun run preview
```

## Notes

This is mostly a static app (meant to be hosted as static assets, e.g. on Netlify). However, mojang's public API don't return CORS headers, so there is an internal endpoint to proxy the request. Right now, it is configured to use Netlify's edge functions.
