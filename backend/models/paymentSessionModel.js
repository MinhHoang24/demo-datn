const mongoose = require("mongoose");

const PAYMENT_SESSION_STATUS = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
};

const paymentSessionItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const paymentSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // "cart" hoặc "buy-now" (bạn có thể mở rộng sau)
    source: { type: String, default: "cart" },

    items: { type: [paymentSessionItemSchema], required: true },

    receiver: {
      name: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      address: { type: String, required: true },
      note: { type: String, default: "" },
    },

    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },

    // vnp_TxnRef sẽ dùng luôn _id dạng string
    txnRef: { type: String, required: true, unique: true, index: true },

    status: {
      type: String,
      enum: Object.values(PAYMENT_SESSION_STATUS),
      default: PAYMENT_SESSION_STATUS.PENDING,
      index: true,
    },

    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },

    // lưu raw ipn/return
    vnpayMeta: { type: Object, default: null },
  },
  { timestamps: true, versionKey: false }
);

module.exports = {
  PaymentSession: mongoose.model("PaymentSession", paymentSessionSchema, "PaymentSessions"),
  PAYMENT_SESSION_STATUS,
};