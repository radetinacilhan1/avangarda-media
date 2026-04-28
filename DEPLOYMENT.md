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

## Recommended path for this project

For the current Avangarda setup, the safest sequence is:

1. Deploy `apps/web` to Vercel
2. Point `avangarda.media` and `www.avangarda.media` to Vercel
3. Deploy Strapi CMS from `apps/cms`
4. Point `cms.avangarda.media` to the CMS host
5. Re-deploy Vercel so frontend reads the public CMS instead of localhost

## Render blueprint for CMS

This repository now contains a root `render.yaml` file for deploying:

- `avangarda-cms` web service
- `avangarda-db` managed Postgres
- persistent uploads disk

### Render steps

1. Open [https://dashboard.render.com](https://dashboard.render.com)
2. Click `New` -> `Blueprint`
3. Connect the GitHub repo `radetinacilhan1/avangarda-media`
4. Select the repository root so Render sees `render.yaml`
5. Create the blueprint
6. After the CMS service is created, open the `avangarda-cms` service
7. Set:
   - `PUBLIC_URL=https://cms.avangarda.media`
8. Redeploy the CMS service

### Namecheap DNS for CMS

After Render gives you the default service hostname (example: `avangarda-cms.onrender.com`), add:

- `CNAME`
  - Host: `cms`
  - Value: `<your-render-host>.onrender.com`

Then in Render add custom domain:

- `cms.avangarda.media`

## Why production currently looks different from localhost

If the Vercel site looks thinner or shows fallback content while localhost looks complete, that means the frontend is live but the public CMS is not yet serving the same data.

Localhost currently uses:

- local Next.js frontend
- local Strapi CMS
- local Postgres content
- local uploads

Production will only match localhost after:

- CMS is deployed publicly
- frontend points to that CMS
- content/uploads are copied or transferred

## Content migration note

Deploying the CMS alone is not enough if the remote database is empty.
To make production match localhost, we must also move:

- Strapi content from local Postgres
- uploaded files from `apps/cms/public/uploads`

The most reliable next step after CMS deploy is to either:

- restore a Postgres dump into the production database, and
- copy the local uploads folder to the persistent disk

or use a Strapi content transfer flow between local and remote instances.

## Important note about uploads

The current Strapi app uses local uploads by default. For production, prefer:

- Railway/Render with persistent disk, or
- object storage such as S3 / Cloudinary

Without persistent media storage, uploaded files may be lost on redeploy or instance replacement.
