const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const {
  createVNPayPayment,
  vnpayIPN,
  vnpayReturn,
} = require("../controllers/paymentController");

/**
 * CREATE PAYMENT
 * 🔒 CẦN LOGIN (có token)
 */
router.post("/vnpay/create", protect, createVNPayPayment);

/**
 * IPN & RETURN
 * ❗ VNPay gọi server-to-server → KHÔNG DÙNG protect
 */
router.get("/vnpay/ipn", vnpayIPN);
router.get("/vnpay/return", vnpayReturn);

module.exports = router;