# Media Platform Starter (Docker)

This starter runs:
- Strapi CMS (Postgres)
- Next.js website
- Meilisearch (fast search)
- Worker (Strapi webhook -> Meilisearch index)

## Setup
1) Copy `.env.example` to `.env`
2) Replace `change_me` values with anything (random strings)

## Run
`docker compose up --build`

## Open
- Website: http://localhost:3000
- Strapi Admin: http://localhost:1337/admin

## Worker token (for indexing)
In Strapi Admin:
Settings -> API Tokens -> Create -> Full access
Paste into `.env` as `STRAPI_WORKER_TOKEN=...`
Restart docker.

## Webhook (for indexing)
Settings -> Webhooks -> Create
URL: `http://worker:4000/webhooks/strapi`
Events: Entry publish, Entry unpublish, Entry update

## Init search (one time)
`curl -X POST http://localhost:4000/admin/init-search`
