import axios from 'axios';

// In production, call the same-origin Nginx proxy (mounted at `/api`).
// In development, `VITE_API_URL` can be set to `http://localhost:5000/api`.
const resolveApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL || '/api';
    if (typeof window === 'undefined') {
        return envUrl;
    }

    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';

    // Never call localhost backend when the app is served from a real domain/IP.
    return isLocalHost ? envUrl : '/api';
};

export const API_URL = resolveApiUrl();
export const ASSET_BASE_URL = API_URL.startsWith('http')
    ? API_URL.replace(/\/api\/?$/, '')
    : '';

// Set up Axios instance
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const { token } = JSON.parse(userInfo);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth Service
export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('userInfo', JSON.stringify(response.data));
        }
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('userInfo');
    },
    getCurrentUser: () => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            if (!userInfo || userInfo === 'undefined' || userInfo === 'null') return null;
            return JSON.parse(userInfo);
        } catch (err) {
            console.error('Failed to parse user info from storage:', err);
            localStorage.removeItem('userInfo');
            return null;
        }
    }
};

// Deal Service
export const dealService = {
    getDeals: async () => {
        return await api.get('/deals');
    },
    getDeal: async (id) => {
        return await api.get(`/deals/${id}`);
    },
    createDeal: async (formData) => {
        return await api.post('/deals', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    updateDeal: async (id, formData) => {
        return await api.put(`/deals/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteDeal: async (id) => {
        return await api.delete(`/deals/${id}`);
    }
};

// Banner Service
export const bannerService = {
    getAllBanners: async () => {
        return await api.get('/banners');
    },
    getBannerById: async (id) => {
        return await api.get(`/banners/${id}`);
    },
    createBanner: async (formData) => {
        return await api.post('/banners', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    updateBanner: async (id, formData) => {
        return await api.put(`/banners/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteBanner: async (id) => {
        return await api.delete(`/banners/${id}`);
    }
};
