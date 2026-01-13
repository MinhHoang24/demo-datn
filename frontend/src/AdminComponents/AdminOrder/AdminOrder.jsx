import React, { useEffect, useMemo, useState } from "react";
import { Table, Tag, Modal, message, Select, Space } from "antd";
import apiService from "../../Api/Api";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
} from "../../Constants/orderStatus";
import AdminOrderDetail from "./OderDetails";

const { Option } = Select;

const formatDate = (iso) =>
  new Date(iso).toLocaleString("vi-VN");

const formatCurrency = (v) =>
  Number(v || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

export default function AdminOrder() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // 🔹 FILTER STATE
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* ================= FETCH ================= */
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAdminOrders({});
      setOrders(res.data.orders || []);
    } catch {
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openModal = (orderId) => {
    setSelectedOrderId(orderId);
    setOpenDetail(true);
  };

  /* ================= FILTER LOGIC ================= */
  const filteredOrders = useMemo(() => {
    if (statusFilter === "ALL") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  /* ================= TABLE ================= */
  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      ellipsis: true,
    },
    {
      title: "Người mua",
      render: (_, r) => r.userId?.userName || "—",
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      render: formatDate,
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      render: formatCurrency,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (st) => (
        <Tag color={ORDER_STATUS_COLOR[st]}>
          {ORDER_STATUS_LABEL[st]}
        </Tag>
      ),
    },
  ];

  return (
    <>
      {/* ===== FILTER BAR ===== */}
      <Space style={{ marginBottom: 16 }}>
        <span>Lọc trạng thái:</span>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 220 }}
        >
          <Option value="ALL">Tất cả</Option>
          {Object.keys(ORDER_STATUS_LABEL).map((key) => (
            <Option key={key} value={key}>
              {ORDER_STATUS_LABEL[key]}
            </Option>
          ))}
        </Select>
      </Space>

      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={filteredOrders}
        onRow={(record) => ({
          onClick: () => openModal(record._id),
          style: { cursor: "pointer" },
        })}
      />

      {/* ===== MODAL ===== */}
      <Modal
        open={openDetail}
        onCancel={() => setOpenDetail(false)}
        footer={null}
        width="80vw"
        destroyOnClose
      >
        {selectedOrderId && (
          <AdminOrderDetail
            orderId={selectedOrderId}
            onUpdated={fetchOrders}
          />
        )}
      </Modal>
    </>
  );
}