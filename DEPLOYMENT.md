# Avangarda Deployment Guide

This project currently contains:

- `apps/web`: Next.js frontend
- `apps/cms`: Strapi CMS
- `apps/worker`: indexing worker for Meilisearch

## Frontend

- Framework: Next.js 14
- Root directory for Vercel: `apps/web`
- Build command: `npm run build`
- Start command: `npm run start`

## Required frontend environment variables

- `NEXT_PUBLIC_SITE_URL=https://avangarda.media`
- `NEXT_PUBLIC_STRAPI_URL=https://cms.avangarda.media`
- `NEXT_PUBLIC_STRAPI_PUBLIC_URL=https://cms.avangarda.media`

Optional, server-side only:

- `STRAPI_URL=https://cms.avangarda.media`

## Required CMS environment variables

- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_NAME`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `DATABASE_SSL`
- `JWT_SECRET`
- `ADMIN_JWT_SECRET`
- `APP_KEYS`
- `API_TOKEN_SALT`
- `HOST=0.0.0.0`
- `PORT=1337`

## Namecheap DNS for Vercel frontend

Typical records:

- `A` record
  - Host: `@`
  - Value: `76.76.21.21`
- `CNAME` record
  - Host: `www`
  - Value: `cname.vercel-dns.com`

Always confirm inside Vercel Domains settings because Vercel may show project-specific verification instructions.

## Recommended production architecture

- Frontend: Vercel
- CMS: Railway / Render / VPS
- Database: managed Postgres

## Important note about uploads

The current Strapi app uses local uploads by default. For production, prefer:

- Railway/Render with persistent disk, or
- object storage such as S3 / Cloudinary

Without persistent media storage, uploaded files may be lost on redeploy or instance replacement.
