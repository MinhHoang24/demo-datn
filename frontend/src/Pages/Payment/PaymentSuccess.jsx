import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Toast from "../../Components/Toast/Toast";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const txnRef = searchParams.get("txnRef");

  useEffect(() => {
    // Không có txnRef thì không phải đi từ VNPay → quay về home
    if (!txnRef) {
      navigate("/");
    }
  }, [txnRef, navigate]);

  return (
    <>
      <Toast
        type="success"
        message="🎉 Thanh toán và đặt hàng thành công!"
        onClose={() => {}}
      />

      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white border rounded-2xl p-8 text-center space-y-6">
          <div className="text-6xl">🎉</div>

          <h1 className="text-2xl font-bold text-green-600">
            Thanh toán thành công!
          </h1>

          <p className="text-gray-600">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được ghi nhận thành công.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
            <p>
              <span className="font-medium">Mã giao dịch:</span>{" "}
              <span className="font-mono text-blue-600">{txnRef}</span>
            </p>
            <p className="text-sm text-gray-500">
              Bạn có thể xem chi tiết đơn hàng trong mục <b>Đơn hàng của tôi</b>.
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => navigate("/orders")}
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