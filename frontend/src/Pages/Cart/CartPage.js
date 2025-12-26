import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { MdDelete } from "react-icons/md";
import Loader from "../../Components/Loader/Loader";
import Toast from "../../Components/Toast/Toast";
import { useCart } from "../../Contexts/CartContext";

export default function CartPage() {
  const navigate = useNavigate();

  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    syncCartFromServer,
  } = useCart();

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    syncCartFromServer();
  }, []);

  const formatPrice = (price) =>
    price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "0₫";

    const calcItemTotal = (item) => {
        const sale = item.variant.sale || 0;
        return item.price * (1 - sale / 100) * item.quantity;
    };

  const totalAmount = cart.reduce(
    (sum, i) => sum + calcItemTotal(i),
    0
  );

  const handleCheckout = async () => {
    if (!cart.length) {
      setToast({ message: "Giỏ hàng trống", type: "error" });
      return;
    }

    navigate("/checkout");
  };

  return (
    <div className="bg-gray-100 py-10 relative">
      {loading && (
        <div className="fixed inset-0 z-[9999] bg-black/30 flex items-center justify-center">
          <Loader />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-8">
          Giỏ hàng của bạn
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 flex flex-col items-center">
            <FontAwesomeIcon icon={faCartShopping} size="4x" className="text-red-500" />
            <p className="mt-4 text-gray-500">Giỏ hàng của bạn trống</p>
            <Link to="/" className="mt-6">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg">
                Tiếp tục mua sắm
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.variant.color}`}
                  className="bg-white rounded-xl shadow p-4 flex gap-4 items-center"
                >
                  <img
                    alt={item.productName}
                    src={item.variant.image}
                    className="w-24 h-24 object-contain border rounded"
                  />

                  <div className="flex-1">
                    <h2 className="font-semibold">{item.productName}</h2>
                    <p className="text-sm text-gray-500">
                      Màu: {item.variant.color}
                    </p>
                    <p className="text-blue-600 font-medium">
                      {formatPrice(
                        (item.price * (100 - item.variant.sale)) / 100
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateCartQuantity(
                          item.productId,
                          item.variant.color,
                          item.quantity - 1
                        )
                      }
                      className="w-8 h-8 border rounded"
                    >
                      −
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateCartQuantity(
                          item.productId,
                          item.variant.color,
                          item.quantity + 1
                        )
                      }
                      className="w-8 h-8 border rounded"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatPrice(calcItemTotal(item))}
                    </p>
                    <button
                      onClick={() =>
                        removeFromCart(item.productId, item.variant.color)
                      }
                      className="text-red-500 text-sm flex items-center gap-1"
                    >
                      <MdDelete /> Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow p-6 mt-6 flex justify-between">
              <span className="text-lg font-semibold">Tổng thanh toán:</span>
              <span className="text-2xl font-bold text-green-600">
                {formatPrice(totalAmount)}
              </span>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <Link to="/">
                <button className="px-5 py-3 border rounded-lg">
                  Chọn thêm sản phẩm
                </button>
              </Link>

              <button
                onClick={handleCheckout}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg"
              >
                Thanh toán
              </button>
            </div>
          </>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
