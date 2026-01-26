const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  getMyCart,
  addToCart,
  updateCartItemQuantity,
  toggleCartItemSelected,
  selectAllCartItems,
  removeCartItem,
  clearCart,
  getCartCount
} = require("../controllers/cartController");

const router = express.Router();

router.get("/", protect, getMyCart);
router.post("/items", protect, addToCart);

router.patch("/items/:itemId", protect, updateCartItemQuantity);
router.patch("/items/:itemId/select", protect, toggleCartItemSelected);

router.patch("/select-all", protect, selectAllCartItems);

router.delete("/items/:itemId", protect, removeCartItem);
router.delete("/clear", protect, clearCart);

router.get("/count", protect, getCartCount);

module.exports = router;