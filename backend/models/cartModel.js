const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    // dùng color làm khóa variant (khớp model Product hiện tại)
    color: { type: String, default: "" },

    quantity: { type: Number, required: true, min: 1 },

    // user tick chọn sản phẩm nào để đi thanh toán
    isSelected: { type: Boolean, default: true },

    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Cart", cartSchema, "Carts");