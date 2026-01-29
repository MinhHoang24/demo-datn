const express = require("express");
const router = express.Router();
const { protect, isAdmin } = require("../middlewares/authMiddleware");

const {
  getAdminDashboard,

  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,

  manageUsers,
  deleteUser,

  manageProducts,
  createProduct,
  deleteProduct,
  updateProduct,

  getAllOrders,
  getOrderDetail,
  updateOrderStatus,

  uploadImage,
  deleteCancelledOrder,
  getTotalRevenue,
  getRevenueByCategory
} = require("../controllers/adminController");

const { cancelOrderByAdmin } = require("../controllers/orderController");

router.get("/", protect, isAdmin, getAdminDashboard);

router.get("/profile", protect, isAdmin, getAdminProfile);
router.patch("/profile", protect, isAdmin, updateAdminProfile);
router.patch("/change-password", protect, isAdmin, changeAdminPassword);

router.get("/users", protect, isAdmin, manageUsers);
router.delete("/users/:id", protect, isAdmin, deleteUser);

router.get("/products", protect, isAdmin, manageProducts);
router.post("/products", protect, isAdmin, createProduct);
router.delete("/products/:id", protect, isAdmin, deleteProduct);
router.patch("/products/:id", protect, isAdmin, updateProduct);

router.get("/order", protect, isAdmin, getAllOrders);

router.get("/orders/:orderId", protect, isAdmin, getOrderDetail);

router.put("/order/update-status", protect, isAdmin, updateOrderStatus);

router.patch("/orders/:orderId/cancel", protect, isAdmin, cancelOrderByAdmin);

router.post("/upload/upload-image", protect, isAdmin, uploadImage);

router.delete(
  "/orders/:orderId",
  protect,
  isAdmin,
  deleteCancelledOrder
);

router.get("/revenue/total", protect, isAdmin, getTotalRevenue);

router.get(
  "/revenue/by-category",
  protect,
  isAdmin,
  getRevenueByCategory
);

module.exports = router;