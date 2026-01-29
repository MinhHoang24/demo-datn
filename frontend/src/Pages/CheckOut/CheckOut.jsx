import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useContext  } from "react";
import apiService from "../../Api/Api";
import Toast from "../../Components/Toast/Toast";
import { CartContext } from "../../Contexts/CartCountContext";
import Loader from "../../Components/Loader/Loader";

const formatPrice = (p) =>
  Number(p || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

const getProductImage = (item) => {
  const product = item.product || item.productId || {};
  if (item.color && product.variants?.length) {
    const variant = product.variants.find(
      (v) =>
        String(v.color).toLowerCase() === String(item.color).toLowerCase()
    );
    return variant?.image || product.image;
  }
  return product.image;
};

export default function CheckoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { fetchCartCount } = useContext(CartContext);

  const checkoutMode = state?.from === "buy-now" ? "buy-now" : "cart";

  const items = useMemo(() => state?.items ?? [], [state]);

  const [toast, setToast] = useState({ message: "", type: "success" });

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [receiver, setReceiver] = useState({
    name: "",
    phoneNumber: "",
    address: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (checkoutMode === "buy-now" && !items.length) {
      navigate("/");
    }
  }, [checkoutMode, items, navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiService.getUserProfile();
        setUser(res.data.user);
      } catch {
        setToast({
          message: "Vui lòng đăng nhập để thanh toán",
          type: "error",
        });
        navigate("/login");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      setReceiver({
        name: user.userName || "",
        phoneNumber: user.phoneNumber || "",
        address: user.diaChi || "",
      });
    }
  }, [user]);

  const totalPrice = useMemo(() => {
    return items.reduce((sum, it) => {
      const price =
        it.price ||
        Number(it.productId?.price || it.product?.price || 0);
      return sum + price * Number(it.quantity || 0);
    }, 0);
  }, [items]);

  const isReceiverValid = useMemo(() => {
    return (
      typeof receiver.name === "string" &&
      receiver.name.trim() &&
      typeof receiver.phoneNumber === "string" &&
      receiver.phoneNumber.trim() &&
      typeof receiver.address === "string" &&
      receiver.address.trim()
    );
  }, [receiver]);

  const handleCheckout = async () => {
    if (isSubmitting) return;

    if (!isReceiverValid) {
      setToast({
        message: "Vui lòng nhập đầy đủ thông tin người nhận",
        type: "error",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (paymentMethod === "cod") {
        if (checkoutMode === "buy-now") {
          await apiService.checkoutBuyNowCOD({
            items: items.map((it) => ({
              productId: it.product?._id || it.productId,
              color: it.color,
              quantity: it.quantity,
            })),
            receiver,
          });
        } else {
          await apiService.checkoutCOD({ receiver });
        }
        await fetchCartCount();
        setToast({ message: "🎉 Đặt hàng thành công!", type: "success" });
        setTimeout(() => navigate("/orders"), 800);
        return;
      }

      if (paymentMethod === "qr") {
        let res;

        if (checkoutMode === "buy-now") {
          res = await apiService.createVNPayBuyNowPayment({
            items: items.map((it) => ({
              productId: it.product?._id || it.productId,
              color: it.color,
              quantity: it.quantity,
            })),
            receiver,
            source: "buy-now",
          });
        } else {
          res = await apiService.createVNPayPayment({
            receiver,
            source: "cart",
          });
        }

        const paymentUrl = res?.data?.paymentUrl;
        if (!paymentUrl) {
          throw new Error("Không tạo được link thanh toán VNPay");
        }

        window.location.href = paymentUrl;
        return;
      }
    } catch (err) {
      setToast({
        message:
          err?.response?.data?.message ||
          "Thanh toán thất bại, vui lòng thử lại",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingUser || !user) {
    return (
      <Loader />
    );
  }

  return (
    <>
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "success" })}
        />
      )}

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Thanh toán</h1>

        {/* PRODUCTS */}
        <div className="bg-white border rounded-xl p-4 space-y-4">
          <h2 className="font-semibold">Sản phẩm đã chọn</h2>

          {items.map((it, idx) => {
            const product = it.product || it.productId || {};
            const price =
              it.price || Number(product.price || 0);
            const image = getProductImage(it);

            return (
              <div key={idx} className="flex gap-4 items-center border-b pb-4">
                <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden">
                  {image ? (
                    <img
                      src={image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    Màu: {it.color || "—"} | SL: {it.quantity}
                  </p>
                </div>

                <p className="font-semibold">
                  {formatPrice(price * it.quantity)}
                </p>
              </div>
            );
          })}

          <div className="flex justify-between font-bold pt-2">
            <span>Tổng tiền</span>
            <span className="text-blue-600">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>

        {/* RECEIVER */}
        <div className="bg-white border rounded-xl p-4 space-y-4">
          <h2 className="font-semibold">Thông tin người nhận</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Họ và tên</label>
              <input
                type="text"
                value={receiver.name}
                onChange={(e) =>
                  setReceiver({ ...receiver, name: e.target.value })
                }
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">Số điện thoại</label>
              <input
                type="text"
                value={receiver.phoneNumber}
                onChange={(e) =>
                  setReceiver({ ...receiver, phoneNumber: e.target.value })
                }
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm text-gray-500">Địa chỉ</label>
              <textarea
                rows={2}
                value={receiver.address}
                onChange={(e) =>
                  setReceiver({ ...receiver, address: e.target.value })
                }
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* PAYMENT */}
        <div className="bg-white border flex flex-col rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Phương thức thanh toán</h2>

          <button
            onClick={() => setPaymentMethod("cod")}
            className={`p-4 rounded-xl border text-left ${
              paymentMethod === "cod"
                ? "border-blue-600 bg-blue-50 text-blue-600"
                : ""
            }`}
          >
            Thanh toán khi nhận hàng (COD)
          </button>

          <button
            onClick={() => setPaymentMethod("qr")}
            className={`p-4 rounded-xl border text-left ${
              paymentMethod === "qr"
                ? "border-green-600 bg-green-50 text-green-600"
                : ""
            }`}
          >
            Thanh toán QR (VNPay)
          </button>
        </div>

        <button
          disabled={!isReceiverValid || isSubmitting}
          onClick={handleCheckout}
          className="w-full py-4 rounded-xl bg-blue-600 text-white font-semibold
                     hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Đang đặt hàng..." : "Thanh toán"}
        </button>
      </div>
    </>
  );
}