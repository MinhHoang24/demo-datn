const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  getMyOrders,
  getMyOrderById,
  cancelOrderByUser,
  checkoutSelectedCODFromCart,
  checkoutBuyNowCOD
} = require("../controllers/orderController");

// ✅ Checkout COD từ cart selected
// POST /orders/checkout/cod
router.post("/checkout/cod", protect, checkoutSelectedCODFromCart);

router.post(
  "/checkout/buy-now/cod",
  protect,
  checkoutBuyNowCOD
);

// Danh sách đơn của tôi
// GET /orders/my
router.get("/my", protect, getMyOrders);

// Hủy đơn (chỉ PENDING + COD)
// PATCH /orders/:orderId/cancel
router.patch("/:orderId/cancel", protect, cancelOrderByUser);

// Chi tiết đơn của tôi (để sau cùng)
// GET /orders/:orderId
router.get("/:orderId", protect, getMyOrderById);

module.exports = router;