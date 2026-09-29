# Deployment

The Vite storefront is deployed on Vercel. The Express API, SQLite database, and uploaded images run on Render because Vercel's serverless filesystem is not persistent.

## Deploy the API

1. In Render, create a Blueprint from this repository and select `render.yaml`.
2. Set `ADMIN_PASSCODE` to a private passcode of at least 8 characters and `ADMIN_SESSION_SECRET` to a long random secret. Do not commit either value.
3. Deploy the service. Its persistent disk stores the SQLite database and uploaded images.
4. After creating the Vercel project, set `CORS_ORIGINS` to its exact production origin, such as `https://your-store.vercel.app`, and `PUBLIC_BACKEND_URL` to the Render service URL, such as `https://zarvaan-api.onrender.com`.

## Deploy the storefront

1. Import this GitHub repository into Vercel with the Vite framework preset and root directory `.`.
2. Set the Vercel environment variable `VITE_API_BASE_URL` to the Render service URL, without a trailing slash.
3. Deploy or redeploy after setting the environment variable.

Vercel serves the customer storefront at `https://your-store.vercel.app/` and the separate admin entry at `https://your-store.vercel.app/admin`. The admin uses server-side passcode verification; protect the Render environment variables and use HTTPS.

Local `data/` and `uploads/` are intentionally excluded from Git. The deployed API starts with seed content; re-upload images and import store JSON through the admin if you need to migrate content. Existing local upload URLs are not included in the repository.
