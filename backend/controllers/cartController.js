const mongoose = require("mongoose");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

/**
 * Helper: tìm variant theo color
 */
function findVariant(product, color) {
  if (!color) return null;
  const c = String(color).toLowerCase();
  return (product.variants || []).find(
    (v) => (v.color || "").toLowerCase() === c
  );
}

/**
 * Helper: validate tồn kho theo variant.quantity
 */
function checkVariantStock(product, color, quantity) {
  if (!color) return { ok: true }; // nếu không chọn variant thì bỏ qua (tuỳ bạn)
  const v = findVariant(product, color);
  if (!v) return { ok: false, message: "Variant không tồn tại" };
  const stock = Number(v.quantity || 0);
  if (stock < quantity) return { ok: false, message: "Số lượng tồn kho không đủ" };
  return { ok: true };
}

/**
 * GET /cart
 * Lấy giỏ hàng của user (populate product để FE render)
 */
const getMyCart = async (req, res) => {
  try {
    const userId = req.userId;

    const cart = await Cart.findOne({ userId })
      .populate("items.productId", "name price image variants category brand")
      .lean();

    if (!cart) return res.json({ cart: { userId, items: [] } });

    return res.json({ cart });
  } catch (error) {
    console.error("getMyCart error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /cart/items
 * Body: { productId, quantity, color? }
 * - Nếu đã có item cùng productId+color => cộng quantity
 */
const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity, color } = req.body || {};

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "productId không hợp lệ" });
    }

    const qty = Number(quantity || 0);
    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ message: "quantity không hợp lệ" });
    }

    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    const colorStr = color ? String(color) : "";

    // check tồn kho theo variant
    const stockCheck = checkVariantStock(product, colorStr, qty);
    if (!stockCheck.ok) {
      return res.status(400).json({ message: stockCheck.message });
    }

    // upsert cart
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, items: [] });

    const existedIndex = cart.items.findIndex(
      (it) =>
        String(it.productId) === String(productId) &&
        String(it.color || "").toLowerCase() === String(colorStr).toLowerCase()
    );

    if (existedIndex !== -1) {
      const newQty = Number(cart.items[existedIndex].quantity) + qty;

      // check tồn kho cho tổng số lượng
      const stockCheck2 = checkVariantStock(product, colorStr, newQty);
      if (!stockCheck2.ok) {
        return res.status(400).json({ message: stockCheck2.message });
      }

      cart.items[existedIndex].quantity = newQty;
      cart.items[existedIndex].isSelected = true; // add lại thì auto selected
    } else {
      cart.items.push({
        productId,
        color: colorStr,
        quantity: qty,
        isSelected: true,
      });
    }

    await cart.save();

    const populated = await Cart.findOne({ userId })
      .populate("items.productId", "name price image variants category brand")
      .lean();

    return res.status(201).json({ message: "Đã thêm vào giỏ hàng", cart: populated });
  } catch (error) {
    console.error("addToCart error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PATCH /cart/items/:itemId
 * Body: { quantity }
 */
const updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.params;
    const { quantity } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "itemId không hợp lệ" });
    }

    const qty = Number(quantity || 0);
    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ message: "quantity không hợp lệ" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Giỏ hàng trống" });

    const idx = cart.items.findIndex((it) => String(it._id) === String(itemId));
    if (idx === -1) return res.status(404).json({ message: "Item không tồn tại trong giỏ" });

    const item = cart.items[idx];

    // validate tồn kho theo variant
    const product = await Product.findById(item.productId).lean();
    if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    const stockCheck = checkVariantStock(product, item.color, qty);
    if (!stockCheck.ok) {
      return res.status(400).json({ message: stockCheck.message });
    }

    cart.items[idx].quantity = qty;
    await cart.save();

    const populated = await Cart.findOne({ userId })
      .populate("items.productId", "name price image variants category brand")
      .lean();

    return res.json({ message: "Cập nhật số lượng thành công", cart: populated });
  } catch (error) {
    console.error("updateCartItemQuantity error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PATCH /cart/items/:itemId/select
 * Body: { isSelected: boolean }
 */
const toggleCartItemSelected = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.params;
    const { isSelected } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "itemId không hợp lệ" });
    }

    if (typeof isSelected !== "boolean") {
      return res.status(400).json({ message: "isSelected phải là boolean" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Giỏ hàng trống" });

    const idx = cart.items.findIndex((it) => String(it._id) === String(itemId));
    if (idx === -1) return res.status(404).json({ message: "Item không tồn tại trong giỏ" });

    cart.items[idx].isSelected = isSelected;
    await cart.save();

    const populated = await Cart.findOne({ userId })
      .populate("items.productId", "name price image variants category brand")
      .lean();

    return res.json({ message: "Cập nhật lựa chọn thành công", cart: populated });
  } catch (error) {
    console.error("toggleCartItemSelected error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PATCH /cart/select-all
 * Body: { isSelected: boolean }
 */
const selectAllCartItems = async (req, res) => {
  try {
    const userId = req.userId;
    const { isSelected } = req.body || {};

    if (typeof isSelected !== "boolean") {
      return res.status(400).json({ message: "isSelected phải là boolean" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Giỏ hàng trống" });

    cart.items.forEach((it) => (it.isSelected = isSelected));
    await cart.save();

    const populated = await Cart.findOne({ userId })
      .populate("items.productId", "name price image variants category brand")
      .lean();

    return res.json({ message: "Cập nhật chọn tất cả thành công", cart: populated });
  } catch (error) {
    console.error("selectAllCartItems error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE /cart/items/:itemId
 */
const removeCartItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "itemId không hợp lệ" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Giỏ hàng trống" });

    const before = cart.items.length;
    cart.items = cart.items.filter((it) => String(it._id) !== String(itemId));

    if (cart.items.length === before) {
      return res.status(404).json({ message: "Item không tồn tại trong giỏ" });
    }

    await cart.save();

    const populated = await Cart.findOne({ userId })
      .populate("items.productId", "name price image variants category brand")
      .lean();

    return res.json({ message: "Đã xóa sản phẩm khỏi giỏ", cart: populated });
  } catch (error) {
    console.error("removeCartItem error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE /cart/clear
 */
const clearCart = async (req, res) => {
  try {
    const userId = req.userId;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.json({ message: "Giỏ hàng đã trống", cart: { userId, items: [] } });

    cart.items = [];
    await cart.save();

    return res.json({ message: "Đã xóa toàn bộ giỏ hàng", cart: { userId, items: [] } });
  } catch (error) {
    console.error("clearCart error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getMyCart,
  addToCart,
  updateCartItemQuantity,
  toggleCartItemSelected,
  selectAllCartItems,
  removeCartItem,
  clearCart,
};