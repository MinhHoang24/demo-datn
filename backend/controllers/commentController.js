// controllers/commentController.js
const mongoose = require("mongoose");
const Comment = require("../models/commentModel");
const Product = require("../models/productModel");
const { Order, ORDER_STATUS } = require("../models/orderModel");

/**
 * POST /comments
 * Body: { productId, text, rating }
 * Yêu cầu: user đăng nhập (req.userId)
 * Chỉ cho đánh giá nếu user đã mua và đơn ở trạng thái DELIVERED
 * Chặn đánh giá 2 lần
 */
const addComment = async (req, res) => {
  try {
    const userId = req.userId; // ✅ lấy từ auth middleware
    const { productId, text, rating } = req.body || {};

    // Validate productId
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "productId không hợp lệ" });
    }

    // Validate text
    const textFinal = String(text || "").trim();
    if (!textFinal) {
      return res.status(400).json({ message: "Thiếu nội dung đánh giá" });
    }

    // Validate rating (1..5)
    const ratingNum = Number(rating);
    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "rating phải nằm trong khoảng 1-5" });
    }

    // (Optional nhưng nên có): check product tồn tại
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // ✅ CHECK USER ĐÃ MUA + ĐÃ NHẬN (DELIVERED) CHƯA
    const hasPurchased = await Order.exists({
      userId,
      status: ORDER_STATUS.DELIVERED, // ✅ đúng field theo Order model mới
      "items.productId": new mongoose.Types.ObjectId(productId),
    });

    if (!hasPurchased) {
      return res.status(403).json({
        message: "Bạn chỉ có thể đánh giá sau khi mua và nhận sản phẩm (đơn đã giao)",
      });
    }

    // ✅ chặn đánh giá 2 lần
    const existed = await Comment.findOne({ productId, userId }).lean();
    if (existed) {
      return res.status(400).json({
        message: "Bạn đã đánh giá sản phẩm này rồi",
      });
    }

    const comment = await Comment.create({
      productId,
      userId,
      text: textFinal,
      rating: ratingNum,
    });

    return res.status(201).json({ message: "Đánh giá thành công", comment });
  } catch (err) {
    // Nếu bạn áp unique index ở DB, lỗi trùng sẽ vào đây (E11000)
    if (err?.code === 11000) {
      return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này rồi" });
    }
    console.error("addComment error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /comments/:productId
 * Lấy tất cả comments của sản phẩm
 */
const getComments = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "productId không hợp lệ" });
    }

    const comments = await Comment.find({ productId })
      .sort({ createdAt: -1 })
      .populate("userId", "userName email") // ✅ đúng field theo userModel của bạn
      .lean();

    // Bạn có thể return [] thay vì 404 nếu muốn FE dễ xử lý hơn.
    return res.status(200).json({ message: "Comments fetched successfully", comments });
  } catch (err) {
    console.error("getComments error:", err);
    return res.status(500).json({ message: "Error fetching comments", error: err.message });
  }
};

module.exports = { addComment, getComments };