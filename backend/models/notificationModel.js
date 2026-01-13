const mongoose = require("mongoose");

const NOTI_TYPE = {
  ORDER_STATUS_UPDATED: "ORDER_STATUS_UPDATED",
  ORDER_CANCELLED: "ORDER_CANCELLED",
};

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(NOTI_TYPE),
      required: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    // dữ liệu để FE điều hướng
    data: {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
      status: { type: String, default: "" },
    },

    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

module.exports = {
  Notification: mongoose.model("Notification", notificationSchema, "Notifications"),
  NOTI_TYPE,
};