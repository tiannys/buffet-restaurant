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
    getLowStock: (branchId?: string) =>
        apiClient.get('/menus/low-stock', { params: { branch_id: branchId } }),
    updateStock: (id: string, stockQuantity: number) =>
        apiClient.patch(`/menus/${id}/update-stock`, { stock_quantity: stockQuantity }),
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
    getDashboardWithSessions: (branchId?: string) =>
        apiClient.get('/tables/dashboard-with-sessions', { params: { branch_id: branchId } }),
    getByType: (type: string, branchId?: string) =>
        apiClient.get(`/tables/by-type/${type}`, { params: { branch_id: branchId } }),
    getByZone: (zone: string, branchId?: string) =>
        apiClient.get(`/tables/by-zone/${zone}`, { params: { branch_id: branchId } }),
    create: (data: any) => apiClient.post('/tables', data),
    update: (id: string, data: any) => apiClient.put(`/tables/${id}`, data),
    delete: (id: string) => apiClient.delete(`/tables/${id}`),
    updateStatus: (id: string, status: string) =>
        apiClient.patch(`/tables/${id}/status`, { status }),
    toggleOutOfService: (id: string, notes?: string) =>
        apiClient.post(`/tables/${id}/toggle-service`, { notes }),
};

export const sessions = {
    start: (data: any) => apiClient.post('/sessions/start', data),
    getActive: () => apiClient.get('/sessions/active'),
    getOne: (id: string) => apiClient.get(`/sessions/${id}`),
    getForCustomer: (id: string) => apiClient.get(`/sessions/customer/${id}`),
    end: (id: string, paymentData?: any) => apiClient.post(`/sessions/${id}/end`, paymentData || {}),
    pause: (id: string) => apiClient.post(`/sessions/${id}/pause`),
    resume: (id: string) => apiClient.post(`/sessions/${id}/resume`),
    updatePackage: (id: string, packageId: string) =>
        apiClient.patch(`/sessions/${id}/package`, { package_id: packageId }),
    updateGuestCount: (id: string, adultCount: number, childCount: number) =>
        apiClient.patch(`/sessions/${id}/guests`, { adult_count: adultCount, child_count: childCount }),
    transferTable: (id: string, newTableId: string) =>
        apiClient.patch(`/sessions/${id}/transfer`, { new_table_id: newTableId }),
    getTimeRemaining: (id: string) => apiClient.get(`/sessions/${id}/time-remaining`),
    getQRCode: (id: string) => apiClient.get(`/sessions/${id}/qr-code`),
    getWarnings: () => apiClient.get('/sessions/warnings/all'),
    checkWarnings: (id: string) => apiClient.get(`/sessions/${id}/warnings`),
    markWarningAsSent: (id: string) => apiClient.post(`/sessions/${id}/mark-warning-sent`),
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
    getDailySales: (startDate: string, endDate: string) =>
        apiClient.get(`/reports/daily-sales?start_date=${startDate}&end_date=${endDate}`),
    getRevenueByPackage: (startDate: string, endDate: string) =>
        apiClient.get(`/reports/revenue-by-package?start_date=${startDate}&end_date=${endDate}`),
    getPaymentMethods: (startDate: string, endDate: string) =>
        apiClient.get(`/reports/payment-methods?start_date=${startDate}&end_date=${endDate}`),
    getTopItems: (startDate: string, endDate: string, limit = 10) =>
        apiClient.get(`/reports/top-items?start_date=${startDate}&end_date=${endDate}&limit=${limit}`),
    getMenuStats: (startDate: string, endDate: string) =>
        apiClient.get(`/reports/menu-stats?start_date=${startDate}&end_date=${endDate}`),
    getDashboardSummary: (startDate: string, endDate: string) =>
        apiClient.get(`/reports/dashboard-summary?start_date=${startDate}&end_date=${endDate}`),
};

export const settings = {
    get: () => apiClient.get('/settings'),
    update: (data: any) => apiClient.put('/settings', data),
    uploadLogo: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/uploads/logo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};
