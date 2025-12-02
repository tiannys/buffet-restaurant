import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;

// API functions
export const auth = {
    login: (username: string, password: string) =>
        apiClient.post('/auth/login', { username, password }),
    getProfile: () => apiClient.get('/auth/me'),
    logout: () => apiClient.post('/auth/logout'),
};

export const users = {
    getAll: () => apiClient.get('/users'),
    getOne: (id: string) => apiClient.get(`/users/${id}`),
    create: (data: any) => apiClient.post('/users', data),
    update: (id: string, data: any) => apiClient.put(`/users/${id}`, data),
    delete: (id: string) => apiClient.delete(`/users/${id}`),
};

export const roles = {
    getAll: () => apiClient.get('/roles'),
};

export const branches = {
    getAll: () => apiClient.get('/branches'),
};

export const packages = {
    getAll: () => apiClient.get('/packages'),
    create: (data: any) => apiClient.post('/packages', data),
    update: (id: string, data: any) => apiClient.put(`/packages/${id}`, data),
    delete: (id: string) => apiClient.delete(`/packages/${id}`),
};

export const menus = {
    getAll: () => apiClient.get('/menus'),
    getCategories: () => apiClient.get('/menus/categories/all'),
    create: (data: any) => apiClient.post('/menus', data),
    update: (id: string, data: any) => apiClient.put(`/menus/${id}`, data),
    delete: (id: string) => apiClient.delete(`/menus/${id}`),
    toggleAvailability: (id: string) => apiClient.patch(`/menus/${id}/toggle-availability`),
    toggleStock: (id: string, isOutOfStock: boolean) =>
        apiClient.patch(`/menus/${id}/toggle-stock`, { is_out_of_stock: isOutOfStock }),
    uploadImage: (file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        return apiClient.post('/menus/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    createCategory: (data: any) => apiClient.post('/menus/categories', data),
    updateCategory: (id: string, data: any) => apiClient.put(`/menus/categories/${id}`, data),
    deleteCategory: (id: string) => apiClient.delete(`/menus/categories/${id}`),
};

export const tables = {
    getAll: () => apiClient.get('/tables'),
    getDashboard: () => apiClient.get('/tables/dashboard'),
    create: (data: any) => apiClient.post('/tables', data),
    update: (id: string, data: any) => apiClient.put(`/tables/${id}`, data),
    delete: (id: string) => apiClient.delete(`/tables/${id}`),
    updateStatus: (id: string, status: string) =>
        apiClient.patch(`/tables/${id}/status`, { status }),
};

export const sessions = {
    start: (data: any) => apiClient.post('/sessions/start', data),
    getActive: () => apiClient.get('/sessions/active'),
    getForCustomer: (id: string) => apiClient.get(`/sessions/customer/${id}`),
    end: (id: string) => apiClient.post(`/sessions/${id}/end`),
};

export const orders = {
    create: (data: any) => apiClient.post('/orders/customer', data),
    getPending: () => apiClient.get('/orders/pending'),
    getBySession: (sessionId: string) => apiClient.get(`/orders/session/${sessionId}`),
    updateStatus: (id: string, status: string) =>
        apiClient.patch(`/orders/${id}/status`, { status }),
    markWaste: (itemId: string, data: any) =>
        apiClient.post(`/orders/items/${itemId}/mark-waste`, data),
};

export const billing = {
    calculateBill: (sessionId: string) => apiClient.get(`/billing/calculate/${sessionId}`),
    createReceipt: (data: any) => apiClient.post('/billing/receipts', data),
    getReceipts: () => apiClient.get('/billing/receipts'),
};

export const loyalty = {
    getMembers: () => apiClient.get('/loyalty/members'),
    findByPhone: (phone: string) => apiClient.get(`/loyalty/members/phone/${phone}`),
    createMember: (data: any) => apiClient.post('/loyalty/members', data),
    getPointsHistory: (id: string) => apiClient.get(`/loyalty/members/${id}/points-history`),
};

export const reports = {
    getSales: (dateFrom: string, dateTo: string) =>
        apiClient.get(`/reports/sales?date_from=${dateFrom}&date_to=${dateTo}`),
    getWaste: (dateFrom: string, dateTo: string) =>
        apiClient.get(`/reports/waste?date_from=${dateFrom}&date_to=${dateTo}`),
};
