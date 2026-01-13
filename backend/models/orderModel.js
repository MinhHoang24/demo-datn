const mongoose = require("mongoose");

const ORDER_STATUS = {
  PENDING: "PENDING", // chờ xác nhận
  CONFIRMED: "CONFIRMED", // đã xác nhận / đang giao
  DELIVERED: "DELIVERED", // đã giao
  CANCELLED: "CANCELLED", // hủy
};

const PAYMENT_METHOD = {
  COD: "COD",
  QR: "QR", // để sau
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

    // snapshot để đơn không bị ảnh hưởng khi product thay đổi
    name: { type: String, required: true },
    image: { type: String, required: true },

    variant: {
      color: { type: String, default: "" },
      image: { type: String, default: "" },
    },

    unitPrice: { type: Number, required: true }, // giá tại thời điểm mua (đã tính sale nếu có)
    quantity: { type: Number, required: true, min: 1 },

    lineTotal: { type: Number, required: true }, // unitPrice * quantity
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

    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },

    receiver: {
      name: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      address: { type: String, required: true },
      note: { type: String, default: "" },
    },

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