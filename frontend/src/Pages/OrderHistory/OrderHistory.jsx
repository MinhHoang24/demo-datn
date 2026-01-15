import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../Api/Api";
import Toast from "../../Components/Toast/Toast";
import OrderDetailModal from "./OrderDetailModal";
import Loader from "../../Components/Loader/Loader";
import ConfirmModal from "../../Components/ConfirmModal/ConfirmModal";

const formatPrice = (p) =>
  Number(p || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

const ORDER_STATUS_UI = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "bg-yellow-100 text-yellow-700",
  },
  CONFIRMED: {
    label: "Đang giao",
    color: "bg-blue-100 text-blue-700",
  },
  DELIVERED: {
    label: "Đã giao",
    color: "bg-green-100 text-green-700",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-700",
  },
};

export default function OrderHistory() {
  const navigate = useNavigate();

  const [unauthorized, setUnauthorized] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= PAGINATION STATE ================= */
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  /* ================= UI STATE ================= */
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [confirmCancel, setConfirmCancel] = useState({
    open: false,
    orderId: null,
  });
  const [cancelingId, setCancelingId] = useState(null);

  const [toast, setToast] = useState({
    message: "",
    type: "success",
  });

  /* ================= FETCH ORDERS (BE PAGINATION) ================= */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getMyOrders({
        page,
        limit,
      });

      setOrders(res.data.orders || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      if (err?.response?.status === 401) {
        setUnauthorized(true);
        return;
      }

      setToast({
        message: "Không thể tải danh sách đơn hàng",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /* ================= CANCEL ORDER ================= */
  const handleCancelOrder = async () => {
    const orderId = confirmCancel.orderId;
    if (!orderId) return;

    try {
      setCancelingId(orderId);

      await apiService.cancelMyOrder(orderId);

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: "CANCELLED" } : o
        )
      );

      setToast({
        message: "Đã hủy đơn hàng thành công",
        type: "success",
      });
    } catch (err) {
      setToast({
        message:
          err?.response?.data?.message || "Không thể hủy đơn hàng",
        type: "error",
      });
    } finally {
      setCancelingId(null);
      setConfirmCancel({ open: false, orderId: null });
    }
  };

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto min-h-[60vh] flex items-center justify-center">
        <Loader size={48} />
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white border rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-semibold">Bạn chưa đăng nhập</h2>
          <p className="text-gray-600 mt-2">
            Vui lòng đăng nhập để xem đơn hàng của bạn.
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <a href="/login" className="px-5 py-3 bg-blue-600 text-white rounded-xl">
              Đăng nhập
            </a>
            <a href="/" className="px-5 py-3 border rounded-xl">
              Về trang chủ
            </a>
          </div>
        </div>
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
        <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>

        {orders.length === 0 ? (
          <div className="bg-white border rounded-xl p-8 text-center">
            <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 text-blue-600 font-medium"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => {
                const statusUI =
                  ORDER_STATUS_UI[order.status] ||
                  ORDER_STATUS_UI.PENDING;

                const canCancel =
                  order.status === "PENDING" &&
                  order.paymentMethod === "COD";

                return (
                  <div
                    key={order._id}
                    onClick={() => {
                      setSelectedOrderId(order._id);
                      setOpenDetail(true);
                    }}
                    className="bg-white border rounded-xl p-4 space-y-3 hover:bg-blue-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">Đơn hàng #{order._id}</p>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${statusUI.color}`}
                      >
                        {statusUI.label}
                      </span>
                    </div>

                    <div className="text-sm text-gray-500">
                      Ngày đặt: {new Date(order.createdAt).toLocaleString()}
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="font-medium">Tổng tiền:</p>
                      <p className="font-bold text-blue-600">
                        {formatPrice(order.total)}
                      </p>
                    </div>

                    <div className="text-sm text-gray-500">
                      Thanh toán:{" "}
                      {order.paymentMethod === "COD"
                        ? "Thanh toán khi nhận hàng"
                        : "Online"}
                    </div>

                    {canCancel && (
                      <button
                        disabled={cancelingId === order._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmCancel({
                            open: true,
                            orderId: order._id,
                          });
                        }}
                        className="px-3 py-2 bg-white rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        Hủy đơn hàng
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ===== PAGINATION ===== */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  ← Trước
                </button>
                <span className="px-3 py-2 text-sm text-gray-600">
                  Trang {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <OrderDetailModal
        open={openDetail}
        orderId={selectedOrderId}
        onClose={() => setOpenDetail(false)}
      />

      <ConfirmModal
        open={confirmCancel.open}
        title="Xác nhận hủy đơn hàng"
        message="Bạn có chắc chắn muốn hủy đơn hàng này không?"
        confirmText="Hủy đơn"
        cancelText="Quay lại"
        loading={cancelingId === confirmCancel.orderId}
        onCancel={() =>
          setConfirmCancel({ open: false, orderId: null })
        }
        onConfirm={handleCancelOrder}
      />
    </>
  );
}