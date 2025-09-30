import api from './api';

export const employeeService = {
  getAll: () => api.get('/api/employees/'),
  getById: (id) => api.get(`/api/employees/${id}/`),
  create: (data) => api.post('/api/employees/', data),
  update: (id, data) => api.patch(`/api/employees/${id}/`, data),
  delete: (id) => api.delete(`/api/employees/${id}/`),
  getByPosition: (position) => api.get(`/api/employees/by_position/?position=${position}`),
  getProfile: () => api.get('/api/employees/profile/'),
};

export const customerService = {
  getAll: () => api.get('/api/customers/'),
  getById: (id) => api.get(`/api/customers/${id}/`),
  create: (data) => api.post('/api/customers/', data),
  update: (id, data) => api.patch(`/api/customers/${id}/`, data),
  delete: (id) => api.delete(`/api/customers/${id}/`),
  search: (query) => api.get(`/api/customers/search/?q=${query}`),
  getVipCustomers: () => api.get('/api/customers/vip_customers/'),
  toggleVip: (id) => api.patch(`/api/customers/${id}/toggle_vip/`),
};

export const roomService = {
  getAll: () => api.get('/api/rooms/'),
  getById: (id) => api.get(`/api/rooms/${id}/`),
  create: (data) => api.post('/api/rooms/', data),
  update: (id, data) => api.patch(`/api/rooms/${id}/`, data),
  delete: (id) => api.delete(`/api/rooms/${id}/`),
  getAvailable: (checkIn, checkOut) => 
    api.get(`/api/rooms/available/?check_in=${checkIn}&check_out=${checkOut}`),
  getByStatus: (status) => api.get(`/api/rooms/by_status/?status=${status}`),
  updateStatus: (id, status) => api.patch(`/api/rooms/${id}/update_status/`, { status }),
};

export const roomTypeService = {
  getAll: () => api.get('/api/rooms/types/'),
  getById: (id) => api.get(`/api/rooms/types/${id}/`),
  create: (data) => api.post('/api/rooms/types/', data),
  update: (id, data) => api.patch(`/api/rooms/types/${id}/`, data),
  delete: (id) => api.delete(`/api/rooms/types/${id}/`),
};

export const bookingService = {
  getAll: () => api.get('/api/rooms/bookings/'),
  getById: (id) => api.get(`/api/rooms/bookings/${id}/`),
  create: (data) => api.post('/api/rooms/bookings/', data),
  update: (id, data) => api.patch(`/api/rooms/bookings/${id}/`, data),
  delete: (id) => api.delete(`/api/rooms/bookings/${id}/`),
  getTodayCheckins: () => api.get('/api/rooms/bookings/today_checkins/'),
  getTodayCheckouts: () => api.get('/api/rooms/bookings/today_checkouts/'),
  checkIn: (id) => api.patch(`/api/rooms/bookings/${id}/check_in/`),
  checkOut: (id) => api.patch(`/api/rooms/bookings/${id}/check_out/`),
};

export const serviceService = {
  getAll: () => api.get('/api/services/'),
  getById: (id) => api.get(`/api/services/${id}/`),
  create: (data) => api.post('/api/services/', data),
  update: (id, data) => api.patch(`/api/services/${id}/`, data),
  delete: (id) => api.delete(`/api/services/${id}/`),
  getByCategory: (categoryId) => api.get(`/api/services/by_category/?category_id=${categoryId}`),
  getPopular: () => api.get('/api/services/popular/'),
};

export const serviceCategoryService = {
  getAll: () => api.get('/api/services/categories/'),
  getById: (id) => api.get(`/api/services/categories/${id}/`),
  create: (data) => api.post('/api/services/categories/', data),
  update: (id, data) => api.patch(`/api/services/categories/${id}/`, data),
  delete: (id) => api.delete(`/api/services/categories/${id}/`),
};

export const serviceOrderService = {
  getAll: () => api.get('/api/services/orders/'),
  getById: (id) => api.get(`/api/services/orders/${id}/`),
  create: (data) => api.post('/api/services/orders/', data),
  update: (id, data) => api.patch(`/api/services/orders/${id}/`, data),
  delete: (id) => api.delete(`/api/services/orders/${id}/`),
  getTodayOrders: () => api.get('/api/services/orders/today_orders/'),
  getPendingOrders: () => api.get('/api/services/orders/pending_orders/'),
  getByEmployee: (employeeId) => api.get(`/api/services/orders/by_employee/?employee_id=${employeeId}`),
  assignEmployee: (id, employeeId) => api.patch(`/api/services/orders/${id}/assign_employee/`, { employee_id: employeeId }),
  updateStatus: (id, status) => api.patch(`/api/services/orders/${id}/update_status/`, { status }),
};

export const revenueService = {
  getDashboard: () => api.get('/api/revenue/reports/dashboard/'),
  getMonthlyChart: () => api.get('/api/revenue/reports/monthly_chart/'),
  getDailyChart: () => api.get('/api/revenue/reports/daily_chart/'),
  generateReport: (data) => api.post('/api/revenue/reports/generate_report/', data),
  getAllReports: () => api.get('/api/revenue/reports/'),
};

export const paymentService = {
  getAll: () => api.get('/api/revenue/payments/'),
  getById: (id) => api.get(`/api/revenue/payments/${id}/`),
  create: (data) => api.post('/api/revenue/payments/', data),
  update: (id, data) => api.patch(`/api/revenue/payments/${id}/`, data),
  delete: (id) => api.delete(`/api/revenue/payments/${id}/`),
  getTodayPayments: () => api.get('/api/revenue/payments/today_payments/'),
  getByMethod: (methodId) => api.get(`/api/revenue/payments/by_method/?method_id=${methodId}`),
};

export const paymentMethodService = {
  getAll: () => api.get('/api/revenue/payment-methods/'),
  getById: (id) => api.get(`/api/revenue/payment-methods/${id}/`),
  create: (data) => api.post('/api/revenue/payment-methods/', data),
  update: (id, data) => api.patch(`/api/revenue/payment-methods/${id}/`, data),
  delete: (id) => api.delete(`/api/revenue/payment-methods/${id}/`),
};