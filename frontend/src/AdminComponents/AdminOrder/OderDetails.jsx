import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dropdown,
  Menu,
  Modal,
  Table,
  Tag,
  message,
} from "antd";
import { EditOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import apiService from "../../Api/Api";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
} from "../../Constants/orderStatus";
import Loader from "../../Components/Loader/Loader";

const formatCurrency = (v) =>
  Number(v || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

const formatDate = (iso) =>
  new Date(iso).toLocaleString("vi-VN");

export default function AdminOrderDetail({ orderId, onUpdated }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [nextStatus, setNextStatus] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  /* ================= FETCH DETAIL ================= */
  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAdminOrderDetail(orderId);
      setOrder(res.data.order);
    } catch {
      message.error("Không thể tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [orderId]);

  /* ================= STATUS FLOW ================= */
  const allowedNextStatus = useMemo(() => {
    if (!order) return [];

    switch (order.status) {
      case ORDER_STATUS.PENDING:
        return [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED];
      case ORDER_STATUS.CONFIRMED:
        return [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED];
      default:
        return [];
    }
  }, [order]);

  const menu = (
    <Menu>
      {allowedNextStatus.map((st) => (
        <Menu.Item
          key={st}
          onClick={() => {
            setNextStatus(st);
            setConfirmOpen(true);
          }}
        >
          {ORDER_STATUS_LABEL[st]}
        </Menu.Item>
      ))}
    </Menu>
  );

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async () => {
    try {
      await apiService.updateAdminOrderStatus({
        orderId: order._id,
        status: nextStatus,
      });

      message.success("Cập nhật trạng thái thành công");
      setConfirmOpen(false);
      fetchDetail();
      onUpdated?.();
    } catch (err) {
      message.error("Cập nhật trạng thái thất bại");
    }
  };

  if (loading || !order) return (
    <div className="max-w-6xl mx-auto min-h-[36vh] flex items-center justify-center">
      <Loader size={32} />
    </div>
  );

  const columns = [
    {
      title: "Sản phẩm",
      render: (_, r) => r.productId?.name,
    },
    {
      title: "Màu",
      render: (_, r) => r.variant?.color,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      render: formatCurrency,
    },
    {
      title: "Thành tiền",
      dataIndex: "lineTotal",
      render: formatCurrency,
    },
  ];

  return (
    <>
      <h2>Chi tiết đơn hàng</h2>

      <p><b>Mã đơn:</b> {order._id}</p>
      <p><b>Ngày đặt:</b> {formatDate(order.createdAt)}</p>
      <p>
        <b>Người mua:</b>{" "}
        {order.userId?.userName} – {order.userId?.phoneNumber}
      </p>
      <p><b>Địa chỉ:</b> {order.receiver?.address}</p>

      <p>
        <b>Trạng thái:</b>{" "}
        <Tag color={ORDER_STATUS_COLOR[order.status]}>
          {ORDER_STATUS_LABEL[order.status]}
        </Tag>
      </p>

      <Table
        rowKey="_id"
        dataSource={order.items}
        columns={columns}
        pagination={false}
      />

      <div style={{ marginTop: 20 }}>
        {allowedNextStatus.length > 0 && (
          <Dropdown overlay={menu}>
            <Button icon={<EditOutlined />}>
              Cập nhật trạng thái
            </Button>
          </Dropdown>
        )}
      </div>

      <Modal
        open={confirmOpen}
        onOk={updateStatus}
        onCancel={() => setConfirmOpen(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        icon={<ExclamationCircleFilled />}
      >
        Xác nhận chuyển trạng thái sang{" "}
        <b>{ORDER_STATUS_LABEL[nextStatus]}</b>?
      </Modal>
    </>
  );
}