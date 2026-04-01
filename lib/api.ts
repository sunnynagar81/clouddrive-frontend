import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' &&
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const foldersApi = {
  create: (data: { name: string; parentId?: string | null }) =>
    api.post('/folders', data),
  get: (id: string) => api.get(`/folders/${id}`),
  update: (id: string, data: { name?: string; parentId?: string | null }) =>
    api.patch(`/folders/${id}`, data),
  delete: (id: string) => api.delete(`/folders/${id}`),
};

export const filesApi = {
  init: (data: {
    name: string;
    mimeType: string;
    sizeBytes: number;
    folderId?: string | null;
  }) => api.post('/files/init', data),
  complete: (fileId: string) => api.post('/files/complete', { fileId }),
  get: (id: string) => api.get(`/files/${id}`),
  update: (id: string, data: { name?: string; folderId?: string | null }) =>
    api.patch(`/files/${id}`, data),
  delete: (id: string) => api.delete(`/files/${id}`),
};

export const sharesApi = {
  create: (data: {
    resourceType: string;
    resourceId: string;
    granteeUserId: string;
    role: string;
  }) => api.post('/shares', data),
  list: (resourceType: string, resourceId: string) =>
    api.get(`/shares/${resourceType}/${resourceId}`),
  delete: (id: string) => api.delete(`/shares/${id}`),
  createLink: (data: {
    resourceType: string;
    resourceId: string;
    expiresAt?: string;
    password?: string;
  }) => api.post('/link-shares', data),
  resolveLink: (token: string, password?: string) =>
    api.get(`/link/${token}${password ? `?password=${password}` : ''}`),
  deleteLink: (id: string) => api.delete(`/link-shares/${id}`),
};

export const searchApi = {
  search: (q: string, type?: string) =>
    api.get(`/search?q=${q}${type ? `&type=${type}` : ''}`),
  recent: () => api.get('/recent'),
  getStars: () => api.get('/stars'),
  addStar: (resourceType: string, resourceId: string) =>
    api.post('/stars', { resourceType, resourceId }),
  removeStar: (resourceType: string, resourceId: string) =>
    api.delete('/stars', { data: { resourceType, resourceId } }),
  getTrash: () => api.get('/trash'),
  restore: (resourceType: string, resourceId: string) =>
    api.post('/trash/restore', { resourceType, resourceId }),
};

export default api;