const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const {
  createVNPayPayment,
  vnpayIPN,
  vnpayReturn,
  createVNPayBuyNowPayment
} = require("../controllers/paymentController");

router.post("/vnpay/create", protect, createVNPayPayment);

router.get("/vnpay/ipn", vnpayIPN);
router.get("/vnpay/return", vnpayReturn);
router.post(
  "/vnpay/create-buy-now",
  protect,
  createVNPayBuyNowPayment
);

module.exports = router;