const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  getMyOrders,
  getMyOrderById,
  cancelOrderByUser,
  checkoutSelectedCODFromCart,
  checkoutBuyNowCOD,
  checkoutBuyNowOnline,
  checkoutCartOnline
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

router.get("/orders/by-txn/:txnRef", protect, async (req, res) => {
  const order = await Order.findOne({
    paymentTxnRef: req.params.txnRef,
    userId: req.userId,
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json({ order });
});

router.post("/checkout/buy-now/online", protect, checkoutBuyNowOnline);
router.post("/checkout/online", protect, checkoutCartOnline);

module.exports = router;