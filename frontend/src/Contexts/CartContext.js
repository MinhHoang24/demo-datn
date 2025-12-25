import React, {
  createContext,
  useState,
  useContext,
  useCallback,
} from "react";
import apiInstance from "../Api/Api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  /**
   * 🔄 Sync cart từ server & CHUẨN HÓA DATA
   */
  const syncCartFromServer = useCallback(async () => {
    try {
      const res = await apiInstance.getCart();
      const items = res.data.cart?.items || [];

      const normalized = await Promise.all(
        items.map(async (item) => {
          const productRes = await apiInstance.getProductById(
            item.productId
          );

          const product = productRes.data.product;
          const variant =
            product.variants.find(
              (v) => v.color === item.variant.color
            ) || item.variant;

          return {
            _id: item._id,
            productId: product._id,
            productName: product.name,
            price: product.price,
            quantity: item.quantity,
            variant,
            image: variant.image,
          };
        })
      );

      setCart(normalized);
    } catch (e) {
      console.error("Sync cart failed", e);
    }
  }, []);

  /**
   * ➕ Add to cart
   */
  const addToCart = async (productId, color, quantity = 1) => {
    await apiInstance.addProductToCart(productId, color, quantity);
    await syncCartFromServer();
  };

  /**
   * 🔄 Update quantity
   */
  const updateCartQuantity = async (productId, color, quantity) => {
    await apiInstance.updateCartQuantity(productId, color, quantity);
    await syncCartFromServer();
  };

  /**
   * ❌ Remove item
   */
  const removeFromCart = async (productId, color) => {
    await apiInstance.removeProductFromCart(productId, color);
    await syncCartFromServer();
  };

  /**
   * 🧹 Clear cart (optional)
   */
  const clearCart = async () => {
    await apiInstance.clearCart();
    setCart([]);
    setSelectedItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        selectedItems,
        setSelectedItems,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        syncCartFromServer,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
};