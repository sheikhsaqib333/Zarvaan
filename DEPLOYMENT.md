# Deployment and Traffic Architecture

The storefront and API run on Cloudflare Workers. Vite assets are served through the Worker, store records and likes use D1, and uploaded images are stored as chunked D1 blobs. The existing Vercel project can also serve the storefront, with `VITE_API_BASE_URL` pointing to the Worker. No Render service or R2 bucket is required.

## Cloudflare setup

1. Install dependencies and authenticate Wrangler with `npm install` and `npx wrangler login`.
2. Create the D1 database with `npx wrangler d1 create zarvaan-store`, then copy its ID into `wrangler.toml`.
3. Apply schema migrations with `npx wrangler d1 migrations apply zarvaan-store --remote`.
4. Set a private admin passcode and a separate random signing secret with `npx wrangler secret put ADMIN_PASSCODE` and `npx wrangler secret put ADMIN_SESSION_SECRET`. Enter values only in the terminal prompts; never commit them.
5. Build and deploy with `npm run build` and `npx wrangler deploy`.

The one-time `npx tsx scripts/migrate-local-store-to-d1.ts` utility copies the local catalog, reviews, appointments, likes, and uploaded images into D1. It leaves local files unchanged and does not migrate the old admin passcode.

## Vercel frontend

The Vercel project uses `VITE_API_BASE_URL=https://zarvaan-store.msaqibsaleem9-b4f.workers.dev` for Production. Redeploy after changing this build-time variable. Worker CORS allows the production Vercel origin listed in `wrangler.toml`.

The customer storefront is available at `https://zarvaan-w3s7.vercel.app/` and `https://zarvaan-store.msaqibsaleem9-b4f.workers.dev/`. The admin panel is available at either origin's `/admin` path. Admin credentials are verified by the Worker; private appointments are fetched only after admin login.

## Free-tier limits

Cloudflare Workers and D1 have usage quotas, not unlimited capacity. Uploaded images count against D1 storage and query limits; monitor account usage and avoid large or frequent uploads. R2 is intentionally not used because it was not enabled on this account.

## Load testing

Run `npm run perf:load`. Configure `SITE_URL`, `API_URL`, `MAX_VUS`, and `PROFILE=frontend` as needed. Use the Cloudflare Worker URL for `API_URL` in production tests.

Local `data/` and `uploads/` are intentionally excluded from Git. The migration utility preserves them; do not delete the local copies until the remote catalog and media have been verified.
