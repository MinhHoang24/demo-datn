// routes/commentRoutes.js
const express = require("express");
const { addComment, getComments, updateMyComment } = require("../controllers/commentController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ user phải đăng nhập mới được đánh giá
router.post("/", protect, addComment);

// xem comments theo product
router.get("/:productId", getComments);

router.put(
  "/comments/:commentId",
  protect,        // middleware auth
  updateMyComment
);

module.exports = router;