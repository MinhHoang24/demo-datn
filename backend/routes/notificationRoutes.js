const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.patch("/:id/read", protect, markNotificationRead);
router.patch("/read-all", protect, markAllNotificationsRead);

module.exports = router;