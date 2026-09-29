# Deployment and Traffic Architecture

The customer app is a static Vite bundle for Vercel's edge CDN. The API/database/uploads run on Render. A Cloudflare Worker in front of Render caches public reads and media, and the production API rejects traffic that bypasses that worker.

## Deploy the API

1. Create a Render Blueprint from `render.yaml`.
2. Set `ADMIN_PASSCODE` to a private passcode of at least 8 characters; `ADMIN_SESSION_SECRET` and `EDGE_SHARED_SECRET` to separate, long random values. Never commit these values.
3. Set `CORS_ORIGINS` to the exact Vercel origin, for example `https://your-store.vercel.app`.
4. Set `PUBLIC_BACKEND_URL` after deploying the Cloudflare Worker; it must be the Worker URL, not the Render origin.
5. Deploy the service. The persistent Render disk holds SQLite and uploaded media.

## Deploy the edge API proxy

1. Edit `wrangler.toml` so `BACKEND_ORIGIN` is the Render service URL.
2. Install/authenticate Wrangler and deploy with `wrangler deploy`.
3. Set the Worker secret to the same private value as Render's `EDGE_SHARED_SECRET`: `wrangler secret put EDGE_SHARED_SECRET`.
4. Set Render's `PUBLIC_BACKEND_URL` to the Worker URL and redeploy the API.
5. The Worker caches public config/products for 30 seconds, reviews for 10 seconds, and unique uploaded media for one day. It never caches writes or private appointments. Add the Worker to a custom API domain if desired.

## Deploy the storefront

1. Import this GitHub repository into Vercel using root directory `.`.
2. Set Vercel's `VITE_API_BASE_URL` to the Cloudflare Worker URL, without a trailing slash.
3. Deploy or redeploy.

The links are `https://your-store.vercel.app/` for customers and `https://your-store.vercel.app/admin` for admins. Admin credentials are checked by the API; appointments are only fetched after admin login.

## Load testing

Run `npm run perf:load`. Configure `SITE_URL`, `API_URL`, `MAX_VUS`, and `PROFILE=frontend` as needed. The test checks the storefront plus parallel read-only config, products, reviews, and appointments requests. Use the Cloudflare Worker URL for `API_URL` in production tests.

## Capacity limits

Vercel's static CDN can serve storefront assets independently of the Render API. The current API still uses one Render service instance and SQLite on a persistent disk. Edge caching reduces read traffic substantially, but admin writes, customer submissions, cache misses, and SQLite remain single-instance bottlenecks. This setup is not a guarantee for 50,000 simultaneous dynamic API users. For that target, migrate SQLite to managed PostgreSQL, media to object storage, then load-test a production-like multi-instance API behind Cloudflare before announcing the capacity.

Local `data/` and `uploads/` are intentionally excluded from Git. The deployed API starts with seed content; export/import store JSON and re-upload images to migrate local data.
