import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import apiService from "../Api/Api";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isLoggedIn } = useContext(AuthContext);

  const [cartCount, setCartCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);

  // tránh gọi API lặp
  const fetchingRef = useRef(false);

  const fetchCartCount = useCallback(async () => {
    if (!isLoggedIn) {
      setCartCount(0);
      setLoadingCount(false);
      return;
    }

    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      setLoadingCount(true);
      const res = await apiService.getCartCount();

      // 🔥 rule chuẩn: items.length
      setCartCount(Number(res?.data?.count || 0));
    } catch (error) {
      console.error("fetchCartCount error:", error);
      setCartCount(0);
    } finally {
      setLoadingCount(false);
      fetchingRef.current = false;
    }
  }, [isLoggedIn]);

  // login / logout → tự sync
  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        loadingCount,
        fetchCartCount, // 🔥 CartPage / AddToCart gọi
        setCartCount,   // optional
      }}
    >
      {children}
    </CartContext.Provider>
  );
};