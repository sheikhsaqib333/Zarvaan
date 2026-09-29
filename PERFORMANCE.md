# Performance Test Report

Date: 2026-09-29

## Test environment

- Local Windows development machine, 12 logical processors, 16 GB RAM.
- Local Vite development server, local production preview, and local Express/SQLite API.
- k6 virtual users ran on the same machine as the services. These are controlled local tests, not a distributed test against Vercel's CDN.
- Production Vercel/Cloudflare/Render endpoints were not deployed or tested.

## Results

| Scenario | Virtual users | Requests | Failed | p95 latency | Result |
| --- | ---: | ---: | ---: | ---: | --- |
| Mixed storefront + public API smoke | 20 | 1,000 | 0% | 18.51 ms | Passed |
| Mixed storefront + public API | 500 | 175,580 | 0% | 2.67 ms | Passed |
| Mixed storefront + public API, before hardening | 1,000 | 350,300 | 0% | 13.48 ms | Passed |
| Mixed storefront + public API, after hardening | 1,000 | 280,804 | 0% | 6.23 ms | Passed |
| Local production-preview HTML only | 5,000 | 84,524 | 19.21% | 1.39 s | Failed threshold; connection refusals occurred |

The 5,000-user test generated about 2,735 requests/second against one local preview process. It refused 16,242 requests during the run; the preview responded again afterward, and the separate API health check stayed healthy. This demonstrates that one local process is not sufficient for that burst. It does not measure Vercel's edge CDN.

50,000 concurrent users were not attempted. A single-machine load generator and local services cannot safely or credibly certify 50,000 internet-distributed users.

## Protections added

- Vercel hosts the static storefront through its edge network.
- Cloudflare Worker caches public config/products for 30 seconds, reviews for 10 seconds, and unique upload URLs for one day.
- Production API and upload routes require a shared edge secret, preventing direct origin bypass.
- API compression and security headers are enabled; JSON bodies are capped at 2 MB and image uploads at 10 MB.
- Admin login is limited to 10 attempts per IP per 15 minutes; public review/appointment submissions are limited to 30 per IP per minute; uploads are limited to 20 per IP per minute.
- Appointment records are private and require an admin token.

## Remaining capacity work

The API remains a single Render process backed by SQLite. CDN caching lowers public read load, but cache misses, writes, and SQLite are still single-instance limits. This setup is not a verified 50,000-user capacity guarantee. Before making that promise, deploy the edge worker, move data to managed PostgreSQL and media to object storage, scale the API horizontally, then run a distributed production-like load test with defined request mix and arrival rate.

Run the repeatable test with `npm run perf:load`. Set `SITE_URL`, `API_URL`, `MAX_VUS`, and `PROFILE=frontend` as needed. Use `PROFILE=frontend` to isolate the static site and point `API_URL` to the Cloudflare Worker for mixed production tests.