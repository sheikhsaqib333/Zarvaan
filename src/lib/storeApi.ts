import type { Product, ProductReview, PreviewAppointment } from '../types/clothing';
import type { SiteConfig } from '../types/siteConfig';

export interface StoreExportPayload {
  siteConfig: SiteConfig;
  products: Product[];
  reviews: ProductReview[];
  appointments: PreviewAppointment[];
}

export interface ProductLikeSummary {
  count: number;
  liked: boolean;
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

function apiUrl(path: string): string {
  return `${apiBaseUrl}${path}`;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const adminToken = typeof window === 'undefined'
    ? null
    : window.sessionStorage.getItem('zavraan_admin_token');
  const response = await fetch(apiUrl(url), {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
      ...(init?.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const storeApi = {
  getSiteConfig: () => requestJson<SiteConfig>('/api/site-config'),
  saveSiteConfig: (siteConfig: SiteConfig) =>
    requestJson<SiteConfig>('/api/site-config', {
      method: 'PUT',
      body: JSON.stringify(siteConfig),
    }),
  getProducts: () => requestJson<Product[]>('/api/products'),
  saveProducts: (products: Product[]) =>
    requestJson<Product[]>('/api/products', {
      method: 'PUT',
      body: JSON.stringify(products),
    }),
  getLikes: () => requestJson<Record<string, number>>('/api/likes'),
  toggleLike: (productId: string, visitorId: string) =>
    requestJson<ProductLikeSummary>(`/api/products/${encodeURIComponent(productId)}/like`, {
      method: 'POST',
      headers: { 'X-Visitor-Id': visitorId },
    }),
  getReviews: () => requestJson<ProductReview[]>('/api/reviews'),
  saveReviews: (reviews: ProductReview[]) =>
    requestJson<ProductReview[]>('/api/reviews', {
      method: 'PUT',
      body: JSON.stringify(reviews),
    }),
  getAppointments: () => requestJson<PreviewAppointment[]>('/api/appointments'),
  saveAppointments: (appointments: PreviewAppointment[]) =>
    requestJson<PreviewAppointment[]>('/api/appointments', {
      method: 'PUT',
      body: JSON.stringify(appointments),
    }),
  exportStore: () => requestJson<StoreExportPayload>('/api/export'),
  importStore: (payload: StoreExportPayload) =>
    requestJson<{ ok: true }>('/api/import', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getSqlMigration: () => requestJson<{ sql: string }>('/api/migration/sql'),
  getFirebaseMigration: () => requestJson<{ firebase: StoreExportPayload }>('/api/migration/firebase'),
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const adminToken = typeof window === 'undefined'
      ? null
      : window.sessionStorage.getItem('zavraan_admin_token');
    const response = await fetch(apiUrl('/api/upload'), {
      method: 'POST',
      body: formData,
      headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
    });

    if (!response.ok) {
      throw new Error('Image upload failed');
    }

    const result = (await response.json()) as { url: string };
    return {
      ...result,
      url: /^https?:\/\//i.test(result.url) ? result.url : apiUrl(result.url),
    };
  },
  loginAdmin: (passcode: string) =>
    requestJson<{ token: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ passcode }),
    }),
  changeAdminPasscode: (passcode: string) =>
    requestJson<{ ok: true }>('/api/admin/passcode', {
      method: 'PUT',
      body: JSON.stringify({ passcode }),
    }),
  submitReview: (review: Omit<ProductReview, 'id' | 'date'>) =>
    requestJson<ProductReview>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    }),
  submitAppointment: (appointment: PreviewAppointment) =>
    requestJson<PreviewAppointment>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment),
    }),
};
