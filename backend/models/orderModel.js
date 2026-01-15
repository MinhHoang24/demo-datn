const mongoose = require("mongoose");

const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

const PAYMENT_METHOD = {
  COD: "COD",
  QR: "QR", // VNPay
};

const PAYMENT_STATUS = {
  UNPAID: "UNPAID",
  PAID: "PAID",
};

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: { type: String, required: true },
    image: { type: String, required: true },

    variant: {
      color: { type: String, default: "" },
      image: { type: String, default: "" },
    },

    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: { type: [orderItemSchema], required: true },

    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },

    /* ================= PAYMENT ================= */
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: PAYMENT_METHOD.COD,
    },

    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
    },

    paymentGateway: {
      type: String,
      default: "", // "VNPAY"
    },

    paymentTxnRef: {
      type: String,
      default: "", // vnp_TxnRef
      index: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    paymentMeta: {
      type: Object,
      default: null, // lưu raw response VNPay
    },

    /* ================= PRICE ================= */
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },

    /* ================= RECEIVER ================= */
    receiver: {
      name: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      address: { type: String, required: true },
      note: { type: String, default: "" },
    },

    /* ================= TIMELINE ================= */
    cancelReason: { type: String, default: "" },
    cancelledAt: { type: Date, default: null },

    confirmedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

module.exports = {
  Order: mongoose.model("Order", orderSchema, "Orders"),
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
};