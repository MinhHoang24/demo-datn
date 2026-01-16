import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import apiService from "../../Api/Api";
import Toast from "../../Components/Toast/Toast";

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

  /* =========================
     MODE
  ========================= */
  const checkoutMode = state?.from === "buy-now" ? "buy-now" : "cart";

  /* =========================
     ITEMS
  ========================= */
  const items = useMemo(() => state?.items ?? [], [state]);

  /* =========================
     TOAST
  ========================= */
  const [toast, setToast] = useState({ message: "", type: "success" });

  /* =========================
     USER
  ========================= */
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  /* =========================
     PAYMENT
  ========================= */
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* =========================
     GUARD: BUY NOW cần items
  ========================= */
  useEffect(() => {
    if (checkoutMode === "buy-now" && !items.length) {
      navigate("/");
    }
  }, [checkoutMode, items, navigate]);

  /* =========================
     FETCH USER
  ========================= */
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

  /* =========================
     TOTAL
  ========================= */
  const totalPrice = useMemo(() => {
    return items.reduce((sum, it) => {
      const price =
        it.price ||
        Number(it.productId?.price || it.product?.price || 0);
      return sum + price * Number(it.quantity || 0);
    }, 0);
  }, [items]);

  /* =========================
     VALIDATION
  ========================= */
  const isUserInfoValid = useMemo(() => {
    if (!user) return false;

    return (
      typeof user.userName === "string" &&
      user.userName.trim() &&
      typeof user.phoneNumber === "string" &&
      user.phoneNumber.trim() &&
      typeof user.diaChi === "string" &&
      user.diaChi.trim()
    );
  }, [user]);

  /* =========================
     SUBMIT
  ========================= */
  const handleCheckout = async () => {
    if (isSubmitting || !user) return;

    if (!isUserInfoValid) {
      setToast({
        message:
          "Vui lòng cập nhật đầy đủ thông tin nhận hàng trong Hồ sơ cá nhân",
        type: "error",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const receiver = {
        name: user.userName,
        phoneNumber: user.phoneNumber,
        address: user.diaChi,
      };

      /* =========================
        COD (GIỮ NGUYÊN)
      ========================= */
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

        setToast({ message: "🎉 Đặt hàng thành công!", type: "success" });
        setTimeout(() => navigate("/orders"), 800);
        return;
      }

      /* =========================
        QR - VNPAY
      ========================= */
      if (paymentMethod === "qr") {
        let res;

        if (checkoutMode === "buy-now") {
          // 👉 BUY NOW + QR: bắt buộc gửi items
          res = await apiService.createVNPayPayment({
            receiver,
            source: "buy-now",
            items: items.map((it) => ({
              productId: it.product?._id || it.productId,
              color: it.color,
              quantity: it.quantity,
            })),
          });
        } else {
          // 👉 CART + QR: BE tự lấy cart.items isSelected
          res = await apiService.createVNPayPayment({
            receiver,
            source: "cart",
          });
        }

        const paymentUrl = res?.data?.paymentUrl;
        if (!paymentUrl) {
          throw new Error("Không tạo được link thanh toán VNPay");
        }

        // 🚀 Redirect sang VNPay
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

  /* =========================
     GUARD RENDER
  ========================= */
  if (loadingUser || !user) {
    return (
      <div className="max-w-5xl mx-auto p-10 text-center">
        Đang tải thông tin người dùng...
      </div>
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
              <div
                key={idx}
                className="flex gap-4 items-center border-b pb-4"
              >
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

        {/* USER INFO */}
        <div className="bg-white border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Thông tin người nhận</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Họ và tên</p>
              <p className="font-medium">{user.userName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Số điện thoại</p>
              <p className="font-medium">{user.phoneNumber}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-gray-500">Địa chỉ</p>
              <p className="font-medium">{user.diaChi}</p>
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
            className={`p-4 rounded-xl border text-left mt-3 ${
              paymentMethod === "qr"
                ? "border-green-600 bg-green-50 text-green-600"
                : ""
            }`}
          >
            Thanh toán QR (VNPay)
          </button>
        </div>

        <button
          disabled={!isUserInfoValid || isSubmitting}
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