const mongoose = require("mongoose");
const { Notification } = require("../models/notificationModel");

// GET /notifications?isRead=&page=&limit=
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.userId;

    const { isRead, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = { userId };

    if (typeof isRead !== "undefined") {
      filter.isRead = String(isRead) === "true";
    }

    const [total, notifications, unreadCount] = await Promise.all([
      Notification.countDocuments(filter),
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    return res.json({
      notifications,
      unreadCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("getMyNotifications error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /notifications/:id/read
const markNotificationRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Notification id không hợp lệ" });
    }

    const noti = await Notification.findOne({ _id: id, userId });
    if (!noti) return res.status(404).json({ message: "Notification not found" });

    if (!noti.isRead) {
      noti.isRead = true;
      noti.readAt = new Date();
      await noti.save();
    }

    return res.json({ message: "Marked as read", notification: noti });
  } catch (error) {
    console.error("markNotificationRead error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /notifications/read-all
const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.userId;

    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return res.json({ message: "Marked all as read" });
  } catch (error) {
    console.error("markAllNotificationsRead error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};