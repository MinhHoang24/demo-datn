import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiService from "../../Api/Api";
import Loader from "../../Components/Loader/Loader";
import Toast from "../../Components/Toast/Toast";

const formatPrice = (p) =>
  Number(p || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await apiService.getMyOrderDetail(orderId);
        setOrder(res.data.order);
      } catch (err) {
        setToast({
          type: "error",
          message: "Không thể tải thông tin đơn hàng",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size={48} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        Không tìm thấy đơn hàng
      </div>
    );
  }

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white border rounded-2xl p-8 text-center space-y-6">
          <div className="text-6xl">🎉</div>

          <h1 className="text-2xl font-bold text-green-600">
            Thanh toán thành công!
          </h1>

          <p className="text-gray-600">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được thanh toán thành công.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
            <p>
              <span className="font-medium">Mã đơn:</span> #{order._id}
            </p>
            <p>
              <span className="font-medium">Tổng tiền:</span>{" "}
              <span className="text-blue-600 font-semibold">
                {formatPrice(order.total)}
              </span>
            </p>
            <p>
              <span className="font-medium">Phương thức:</span>{" "}
              {order.paymentMethod === "QR" ? "VNPay" : "COD"}
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => navigate(`/orders`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              Xem đơn hàng
            </button>

            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 border rounded-xl font-medium"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </>
  );
}