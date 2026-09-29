import http from 'k6/http';
import { check, sleep } from 'k6';

const siteUrl = (__ENV.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const apiUrl = (__ENV.API_URL || 'http://localhost:4000').replace(/\/$/, '');
const maxVUs = Math.max(1, Number.parseInt(__ENV.MAX_VUS || '1000', 10));
const mixedTraffic = __ENV.PROFILE !== 'frontend';

const quarter = Math.max(1, Math.round(maxVUs * 0.25));
const half = Math.max(quarter, Math.round(maxVUs * 0.5));

export const options = {
  stages: [
    { duration: '20s', target: quarter },
    { duration: '20s', target: half },
    { duration: '40s', target: maxVUs },
    { duration: '20s', target: maxVUs },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1500'],
  },
};

export default function () {
  const page = http.get(`${siteUrl}/`, { tags: { surface: 'storefront' } });
  check(page, {
    'storefront returns 200': (response) => response.status === 200,
  });

  if (mixedTraffic) {
    const responses = http.batch([
      ['GET', `${apiUrl}/api/site-config`, null, { tags: { surface: 'api', endpoint: 'config' } }],
      ['GET', `${apiUrl}/api/products`, null, { tags: { surface: 'api', endpoint: 'products' } }],
      ['GET', `${apiUrl}/api/reviews`, null, { tags: { surface: 'api', endpoint: 'reviews' } }],
    ]);

    check(responses[0], { 'config returns 200': (response) => response.status === 200 });
    check(responses[1], { 'products return 200': (response) => response.status === 200 });
    check(responses[2], { 'reviews return 200': (response) => response.status === 200 });
    check(responses[0], {
      'config includes shared-cache policy': (response) => response.headers['Cache-Control']?.includes('s-maxage=30'),
    });
  }

  sleep(1);
}