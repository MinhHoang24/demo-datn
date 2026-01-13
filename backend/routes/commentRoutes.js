// routes/commentRoutes.js
const express = require("express");
const { addComment, getComments } = require("../controllers/commentController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ user phải đăng nhập mới được đánh giá
router.post("/", protect, addComment);

// xem comments theo product
router.get("/:productId", getComments);

module.exports = router;