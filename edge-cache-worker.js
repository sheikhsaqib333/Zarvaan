const READ_CACHE_SECONDS = {
  '/api/site-config': 30,
  '/api/products': 30,
  '/api/reviews': 10,
  '/api/likes': 10,
};

function cacheKeyFor(request) {
  const url = new URL(request.url);
  url.searchParams.set('__origin', request.headers.get('Origin') || 'no-origin');
  return new Request(url.toString(), { method: 'GET' });
}

function withCacheStatus(response, value) {
  const headers = new Headers(response.headers);
  headers.set('X-Edge-Cache', value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env, context) {
    const backendOrigin = env.BACKEND_ORIGIN?.replace(/\/+$/, '');
    if (!backendOrigin || !env.EDGE_SHARED_SECRET) {
      return new Response('Edge backend configuration is incomplete.', { status: 503 });
    }

    const incomingUrl = new URL(request.url);
    const cacheSeconds = request.method === 'GET'
      ? READ_CACHE_SECONDS[incomingUrl.pathname]
      : undefined;
    const isUpload = request.method === 'GET' && incomingUrl.pathname.startsWith('/uploads/');
    const cacheTtl = cacheSeconds ?? (isUpload ? 86400 : undefined);
    const cache = caches.default;
    const cacheKey = cacheTtl ? cacheKeyFor(request) : null;

    if (cacheKey) {
      const cached = await cache.match(cacheKey);
      if (cached) {
        return withCacheStatus(cached, 'HIT');
      }
    }

    const upstreamUrl = new URL(request.url);
    upstreamUrl.protocol = new URL(backendOrigin).protocol;
    upstreamUrl.host = new URL(backendOrigin).host;

    try {
      const upstreamRequest = new Request(upstreamUrl.toString(), request);
      const upstreamHeaders = new Headers(upstreamRequest.headers);
      upstreamHeaders.set('X-Edge-Secret', env.EDGE_SHARED_SECRET);
      const clientIp = request.headers.get('CF-Connecting-IP');
      if (clientIp) {
        upstreamHeaders.set('CF-Connecting-IP', clientIp);
      }
      const upstream = await fetch(new Request(upstreamRequest, { headers: upstreamHeaders }));
      if (cacheKey && upstream.ok) {
        const headers = new Headers(upstream.headers);
        headers.set('Cache-Control', `public, max-age=0, s-maxage=${cacheTtl}, stale-while-revalidate=60`);
        headers.append('Vary', 'Origin');
        const cacheable = new Response(upstream.clone().body, {
          status: upstream.status,
          statusText: upstream.statusText,
          headers,
        });
        context.waitUntil(cache.put(cacheKey, cacheable.clone()));
        return withCacheStatus(cacheable, 'MISS');
      }
      return upstream;
    } catch {
      return new Response('Store API temporarily unavailable.', {
        status: 503,
        headers: { 'Retry-After': '2', 'Cache-Control': 'no-store' },
      });
    }
  },
};