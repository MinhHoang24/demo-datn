// models/commentModel.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    rating: { type: Number, default: 0, min: 1, max: 5 },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: false }
);

// ✅ 1 user chỉ được đánh giá 1 lần cho 1 sản phẩm
commentSchema.index({ productId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Comment", commentSchema);