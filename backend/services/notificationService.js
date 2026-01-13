const User = require("../models/userModel");
const { Notification, NOTI_TYPE } = require("../models/notificationModel");
const { emitToAdmins, emitToUser } = require("../socket/socketServer");
const { ORDER_STATUS_LABEL } = require("../constants/orderStatus");

/* =========================
   CORE HELPERS
========================= */

async function notifyUser({ userId, type, title, message, data }) {
  const noti = await Notification.create({
    userId,
    type,
    title,
    message,
    data,
  });

  emitToUser(userId, "notification:new", noti);
  return noti;
}

async function notifyAdmins({ type, title, message, data }) {
  const adminIds = await User.find({ role: "admin" }).distinct("_id");
  if (!adminIds.length) return;

  const docs = adminIds.map((adminId) => ({
    userId: adminId,
    type,
    title,
    message,
    data,
  }));

  await Notification.insertMany(docs);
  emitToAdmins("notification:new", { type, title, message, data });
}

/* =========================
   ORDER-SPECIFIC HELPERS
========================= */


async function notifyOrderStatusUpdated({ order }) {
  const statusLabel =
    ORDER_STATUS_LABEL[order.status] ?? order.status;
  await notifyUser({
    userId: order.userId,
    type: NOTI_TYPE.ORDER_STATUS_UPDATED,
    title: "Cập nhật trạng thái đơn hàng",
    message: `Đơn hàng #${order._id} đã chuyển sang trạng thái ${statusLabel}`,
    data: { orderId: order._id, status: order.status },
  });
}

async function notifyOrderCancelledByUser({ order }) {
  await notifyAdmins({
    type: NOTI_TYPE.ORDER_CANCELLED,
    title: "User hủy đơn hàng",
    message: `User ${order.userId} đã hủy đơn #${order._id}. Lý do: ${order.cancelReason}`,
    data: { orderId: order._id, status: order.status },
  });
}

async function notifyOrderCancelledByAdmin({ order }) {
  await notifyUser({
    userId: order.userId,
    type: NOTI_TYPE.ORDER_CANCELLED,
    title: "Đơn hàng đã bị hủy",
    message: `Đơn hàng #${order._id} đã bị hủy bởi admin.`,
    data: { orderId: order._id, status: order.status },
  });
}

module.exports = {
  notifyUser,
  notifyAdmins,

  notifyOrderStatusUpdated,
  notifyOrderCancelledByUser,
  notifyOrderCancelledByAdmin,
};