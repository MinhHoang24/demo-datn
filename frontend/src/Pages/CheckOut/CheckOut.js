import React, { useEffect, useMemo, useState } from "react";
import { useCart } from "../../Contexts/CartContext";
import apiService from "../../Api/Api";
import { Modal } from "antd";

const Checkout = () => {
  const { cart, selectedItems, clearCart } = useCart();

  const isLoggedIn = localStorage.getItem("isLoggedIn");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [address, setAddress] = useState("");

  // ================= FETCH USER =================
  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await apiService.getUserProfile();
        if (!res.data?.user) throw new Error("No user");
        setUser(res.data.user);
        setAddress(res.data.user?.diaChi || "");
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isLoggedIn]);

  // ================= SELECTED PRODUCTS =================
  const selectedProducts = useMemo(() => {
    if (selectedItems.length === 0) return cart;
    const set = new Set(selectedItems);
    return cart.filter((item) => set.has(item._id));
  }, [cart, selectedItems]);

  // ================= EARLY RETURNS =================
  if (!isLoggedIn) {
    return (
      <div className="max-w-xl mx-auto p-10 text-center">
        <h2 className="text-xl font-semibold mb-2">
          Bạn chưa đăng nhập
        </h2>
        <p className="text-gray-600">
          Vui lòng đăng nhập để tiếp tục thanh toán.
        </p>
      </div>
    );
  }

  if (loading) return <div className="p-10">Loading...</div>;

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-10 text-center">
        <h2 className="text-xl font-semibold mb-2">
          Phiên đăng nhập đã hết hạn
        </h2>
        <p className="text-gray-600">
          Vui lòng đăng nhập lại để tiếp tục.
        </p>
      </div>
    );
  }

  // ================= HELPERS =================
  const formatPrice = (v) =>
    v.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  const total = selectedProducts.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      Modal.warning({
        title: "Giỏ hàng trống",
        content: "Vui lòng chọn ít nhất 1 sản phẩm.",
      });
      return;
    }

    if (paymentMethod !== "Cash on Delivery") {
      Modal.info({
        title: "Thông báo",
        content: "Phương thức thanh toán này sẽ được triển khai sau.",
      });
      return;
    }

    const payload = {
      userId: user._id,
      paymentMethod: "Cash on Delivery",
      items: selectedProducts.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        variant: { color: item.variant.color },
        price: item.price,
      })),
    };

    try {
      await apiService.createOrder(payload);

      try {
        await clearCart();
      } catch (e) {
        console.warn("Clear cart failed", e);
      }

      Modal.success({
        title: "Đặt hàng thành công",
        content: "Đơn hàng của bạn đã được tạo.",
      });
    } catch (err) {
      Modal.error({
        title: "Đặt hàng thất bại",
        content:
          err.response?.data?.message ||
          "Có lỗi xảy ra, vui lòng thử lại.",
      });
    }
  };

  // ================= UI =================
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* USER INFO */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Thông tin người nhận</h2>
          <p><b>Tên:</b> {user.userName}</p>
          <p><b>SĐT:</b> {user.phoneNumber}</p>

          <input
            className="border w-full p-2 mt-2 rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Địa chỉ nhận hàng"
            required
          />
        </div>

        {/* ITEMS */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Sản phẩm</h2>

          {selectedProducts.map((item) => (
            <div
              key={item._id}
              className="flex justify-between border-b py-2 text-sm"
            >
              <span>
                {item.productName} ({item.variant.color}) × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}

          <div className="text-right font-bold mt-3">
            Tổng: {formatPrice(total)}
          </div>
        </div>

        {/* PAYMENT */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Phương thức thanh toán</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {["Cash on Delivery", "Credit Card", "PayPal"].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`
                  border rounded-lg p-4 text-left transition
                  ${
                    paymentMethod === method
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-500"
                      : "border-gray-300 hover:border-blue-400"
                  }
                `}
              >
                <p className="font-medium">{method}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {method === "Cash on Delivery"
                    ? "Thanh toán khi nhận hàng"
                    : "Sẽ hỗ trợ sau"}
                </p>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={selectedProducts.length === 0}
          className={`
            w-full py-3 rounded text-white font-medium
            ${
              selectedProducts.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500"
            }
          `}
        >
          Đặt hàng
        </button>
      </form>
    </div>
  );
};

export default Checkout;