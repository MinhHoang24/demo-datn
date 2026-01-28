import axios from "axios";

// export const base_url = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
export const base_url = "http://localhost:5000";
axios.defaults.withCredentials = true;

const apiInstance = axios.create({
  baseURL: base_url,
  timeout: 60000,
});

apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

const apiService = {
  // User APIs
  registerUser: (newUser) => apiInstance.post("/register", newUser),
  loginUser: (user) => apiInstance.post("/login", user),

  verifyOtp: ({ email, otp }) =>
    apiInstance.post("/verify-otp", { email, otp }),
  resendOtp: ({ email }) =>
    apiInstance.post("/resend-otp", { email }),

  getUserProfile: () => apiInstance.get("/profile"),
  updateUserProfile: (userData) => apiInstance.put("/profile", userData),

  changePassword: (currentPassword, newPassword) =>
    apiInstance.put("/change-password", { currentPassword, newPassword }),

  // Product APIs
  getProducts: (params) => apiInstance.get("/product", { params }),
  getProductById: (productId) => apiInstance.get(`/product/${productId}`),
  getRelatedProducts: (productId) =>
    apiInstance.get(`/product/${productId}/related`),

  // POST /product/:productId/review
  addReview: (productId, payload) =>
    apiInstance.post(`/product/${productId}/review`, payload),

  addComment: ({ productId, text, rating }) =>
    apiInstance.post(`/comments`, { productId, text, rating }),

  // GET /comments/:productId
  getComments: (productId) => apiInstance.get(`/comments/${productId}`),

  // GET /cart
  getCart: () => apiInstance.get("/cart"),

  addToCart: ({ productId, color, quantity }) =>
    apiInstance.post("/cart/items", { productId, color, quantity }),

  updateCartItemQuantity: (itemId, quantity) =>
    apiInstance.patch(`/cart/items/${itemId}`, { quantity }),

  toggleCartItemSelected: (itemId, isSelected) =>
    apiInstance.patch(`/cart/items/${itemId}/select`, { isSelected }),

  selectAllCartItems: (isSelected) =>
    apiInstance.patch("/cart/select-all", { isSelected }),

  removeCartItem: (itemId) => apiInstance.delete(`/cart/items/${itemId}`),

  clearCart: () => apiInstance.delete("/cart/clear"),

  getCartCount: () => apiInstance.get("/cart/count"),

  getMyOrders: (params) =>
    apiInstance.get("/orders/my", { params }),

  getMyOrderDetail: (orderId) => apiInstance.get(`/orders/${orderId}`),

  cancelMyOrder: (orderId, reason) =>
    apiInstance.patch(`/orders/${orderId}/cancel`, { reason }),

  checkoutCOD: (receiver) =>
    apiInstance.post("/orders/checkout/cod", receiver ? { receiver } : {}),

  checkoutBuyNowCOD: ({ items, receiver }) =>
    apiInstance.post("/orders/checkout/buy-now/cod", {
      items,
      receiver,
    }),

  createVNPayPayment: (receiver) =>
    apiInstance.post("/payments/vnpay/create", receiver ? { receiver } : {}),

  createVNPayBuyNowPayment: ({ items, receiver }) =>
    apiInstance.post("/payments/vnpay/create-buy-now", {
      items,
      receiver,
    }),

  checkoutBuyNowOnline: ({ items, receiver }) =>
    apiInstance.post("/orders/checkout/buy-now/online", {
      items,
      receiver,
    }),

  checkoutCartOnline: (receiver) =>
    apiInstance.post(
      "/orders/checkout/online",
      receiver ? { receiver } : {}
    ),

  getOrderByTxnRef: (txnRef) =>
    apiInstance.get(`/orders/by-txn/${txnRef}`),

  // (OPTIONAL) FE có thể dùng để poll trạng thái nếu cần sau
  getPaymentSession: (txnRef) =>
    apiInstance.get(`/payments/session/${txnRef}`),

  getNotifications: (params) => apiInstance.get("/notifications", { params }),

  markNotificationRead: (id) =>
    apiInstance.patch(`/notifications/${id}/read`),

  markAllNotificationsRead: () =>
    apiInstance.patch("/notifications/read-all"),

  getAdminDashboard: () => apiInstance.get("/admin"),

  getAdminProfile: () => apiInstance.get("/admin/profile"),
  updateAdminProfile: (adminData) =>
    apiInstance.patch("/admin/profile", adminData),

  changeAdminPassword: (passwordData) =>
    apiInstance.patch("/admin/change-password", passwordData),

  getAllUsers: (params) =>
    apiInstance.get("/admin/users", { params }),
  deleteUser: (userId) => apiInstance.delete(`/admin/users/${userId}`),

  getAllProducts: (params) =>
    apiInstance.get("/admin/products", { params }),
  createProduct: (productData) => apiInstance.post("/admin/products", productData),
  deleteProduct: (productId) => apiInstance.delete(`/admin/products/${productId}`),
  updateProduct: (productId, productData) =>
    apiInstance.patch(`/admin/products/${productId}`, productData),

  getAdminOrders: (params) => apiInstance.get("/admin/order", { params }),

  getAdminOrderDetail: (orderId) =>
    apiInstance.get(`/admin/orders/${orderId}`),

  updateAdminOrderStatus: ({ orderId, status }) =>
    apiInstance.put("/admin/order/update-status", { orderId, status }),

  cancelAdminOrder: (orderId) =>
    apiInstance.patch(`/admin/orders/${orderId}/cancel`),

  uploadImage: (formData) =>
    apiInstance.post("/admin/upload/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  forgotPassword: (data) =>
    apiInstance.post("/forgot-password", data),

  resetPassword: (token, data) =>
    apiInstance.post(`/reset-password/${token}`, data),

  deleteAdminOrder: (orderId) =>
    apiInstance.delete(`/admin/orders/${orderId}`),

  updateMyComment: (commentId, data) =>
    apiInstance.put(`/comments/${commentId}`, data),

  getAdminTotalRevenue: () =>
    apiInstance.get("/admin/revenue/total"),
};

export default apiService;