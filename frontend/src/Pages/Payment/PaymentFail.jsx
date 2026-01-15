import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentFail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white border rounded-2xl p-8 text-center space-y-6">
        <div className="text-6xl">❌</div>

        <h1 className="text-2xl font-bold text-red-600">
          Thanh toán thất bại
        </h1>

        <p className="text-gray-600">
          Giao dịch chưa được hoàn tất hoặc đã bị hủy.
        </p>

        <div className="flex justify-center gap-4 pt-4">
          {orderId && (
            <button
              onClick={() => navigate(`/orders`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              Xem đơn hàng
            </button>
          )}

          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 border rounded-xl font-medium"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}