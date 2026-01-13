import { useEffect, useState } from "react";
import { Modal } from "antd";
import apiService from "../../Api/Api";
import { Link } from "react-router-dom";
import Loader from "../../Components/Loader/Loader";

const formatPrice = (p) =>
  Number(p || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

export default function OrderDetailModal({
  orderId,
  open,
  onClose,
}) {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!open || !orderId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await apiService.getMyOrderDetail(orderId);
        setOrder(res.data.order);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [orderId, open]);

  if (loading || !order) {
    return (
      <Modal
        open={open}
        footer={null}
        onCancel={onClose}
        destroyOnClose
      >
        <div className="py-10 text-center">
          <Loader size={48} />
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
      title={`Chi tiết đơn hàng #${order._id}`}
    >
      <div className="space-y-4">
        {order.items.map((it, idx) => (
          <div
            key={idx}
            className="flex gap-4 border-b pb-3 hover:cursor-pointer"
          >
            <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
              <img
                src={it.variant?.image || it.image}
                alt={it.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <p className="font-medium">
                {it.name}
              </p>
              <p className="text-sm text-gray-500">
                Màu: {it.variant?.color || "—"} | SL:{" "}
                {it.quantity}
              </p>
            </div>

            <div className="font-semibold">
              {formatPrice(it.lineTotal)}
            </div>
          </div>
        ))}

        <div className="flex justify-between font-bold text-lg pt-2">
          <span>Tổng cộng</span>
          <span className="text-blue-600">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>
    </Modal>
  );
}