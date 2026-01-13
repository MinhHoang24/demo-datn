const express = require("express");
const router = express.Router();
const { protect, isAdmin } = require("../middlewares/authMiddleware");

const {
  // dashboard
  getAdminDashboard,

  // profile
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,

  // users
  manageUsers,
  deleteUser,

  // products
  manageProducts,
  createProduct,
  deleteProduct,
  updateProduct,

  // orders (list/detail/update-status)
  getAllOrders,
  getOrderDetail,
  updateOrderStatus,

  // upload
  uploadImage,
} = require("../controllers/adminController");

// ✅ admin cancel order nằm ở orderController (hoàn kho + noti user + noti admin + emit)
const { cancelOrderByAdmin } = require("../controllers/orderController");

// =======================
// Admin dashboard
// =======================
router.get("/", protect, isAdmin, getAdminDashboard);

// =======================
// Admin profile
// =======================
router.get("/profile", protect, isAdmin, getAdminProfile);
router.patch("/profile", protect, isAdmin, updateAdminProfile);
router.patch("/change-password", protect, isAdmin, changeAdminPassword);

// =======================
// Users
// =======================
router.get("/users", protect, isAdmin, manageUsers);
router.delete("/users/:id", protect, isAdmin, deleteUser);

// =======================
// Products
// =======================
router.get("/products", protect, isAdmin, manageProducts);
router.post("/products", protect, isAdmin, createProduct);
router.delete("/products/:id", protect, isAdmin, deleteProduct);
router.patch("/products/:id", protect, isAdmin, updateProduct);

// =======================
// Orders
// =======================

// 📌 Danh sách đơn hàng
// GET /admin/order?status=&page=&limit=&q=&from=&to=
router.get("/order", protect, isAdmin, getAllOrders);

// 📌 Chi tiết đơn hàng
// GET /admin/orders/:orderId
router.get("/orders/:orderId", protect, isAdmin, getOrderDetail);

// 📌 Cập nhật trạng thái đơn hàng (transition chặt + noti user + noti admin)
// PUT /admin/order/update-status
router.put("/order/update-status", protect, isAdmin, updateOrderStatus);

// 📌 Admin hủy đơn (hoàn kho + noti user + noti admin + emit)
// PATCH /admin/orders/:orderId/cancel
router.patch("/orders/:orderId/cancel", protect, isAdmin, cancelOrderByAdmin);

// =======================
// Upload image
// =======================
router.post("/upload/upload-image", protect, isAdmin, uploadImage);

module.exports = router;