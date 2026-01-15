import React, { useEffect, useState, useCallback } from "react";
import { Table, Tag, Modal, message, Select, Space, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import apiService from "../../Api/Api";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
} from "../../Constants/orderStatus";
import AdminOrderDetail from "./OderDetails";
import { DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

/* ================= UTILS ================= */
const formatDate = (iso) =>
  new Date(iso).toLocaleString("vi-VN");

const formatCurrency = (v) =>
  Number(v || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

export default function AdminOrder() {
  /* ================= STATE ================= */
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [status, setStatus] = useState(undefined);
  const [search, setSearch] = useState("");

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const handleDeleteOrder = (order) => {
    Modal.confirm({
      title: "Xác nhận xóa đơn hàng",
      content: (
        <>
          <p>
            Bạn có chắc chắn muốn xóa đơn hàng{" "}
            <b>{order._id}</b> không?
          </p>
          <p style={{ color: "red" }}>
            Hành động này không thể hoàn tác.
          </p>
        </>
      ),
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          await apiService.deleteAdminOrder(order._id);
          message.success("Đã xóa đơn hàng đã hủy");
          fetchOrders(); // reload
        } catch (err) {
          message.error(
            err?.response?.data?.message || "Không thể xóa đơn hàng"
          );
        }
      },
    });
  };

  /* ================= FETCH (BE) ================= */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getAdminOrders({
        page,
        limit,
        status,
        q: search || undefined,
      });

      setOrders(res.data.orders || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
      sorter: true,
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      render: formatCurrency,
      sorter: true,
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
    {
      title: "Thanh toán",
      render: (_, r) => {
        if (r.paymentMethod === "COD") return "COD";
        if (r.paymentGateway === "VNPAY") return "VNPay (QR)";
        return "—";
      },
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => {
        const canDelete = record.status === "CANCELLED";

        return (
          <DeleteOutlined
            style={{
              fontSize: 18,
              color: canDelete ? "#ff4d4f" : "#ccc",
              cursor: canDelete ? "pointer" : "not-allowed",
            }}
            onClick={(e) => {
              e.stopPropagation(); // ❗ không mở detail modal
              if (!canDelete) return;
              handleDeleteOrder(record);
            }}
          />
        );
      },
    }
  ];

  /* ================= TABLE CHANGE ================= */
  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  return (
    <>
      {/* ===== FILTER BAR ===== */}
      <Space style={{ marginBottom: 16 }} wrap>
        <span>Lọc trạng thái:</span>
        <Select
          allowClear
          placeholder="Tất cả"
          style={{ width: 220 }}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          {Object.keys(ORDER_STATUS_LABEL).map((key) => (
            <Option key={key} value={key}>
              {ORDER_STATUS_LABEL[key]}
            </Option>
          ))}
        </Select>

        {/* 🔍 SEARCH BUYER */}
        <Input
          placeholder="Tìm người mua (tên / sđt / email)"
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 300 }}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </Space>

      {/* ===== TABLE ===== */}
      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={orders}
        onChange={handleTableChange}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
        }}
        onRow={(record) => ({
          onClick: () => {
            setSelectedOrderId(record._id);
            setOpenDetail(true);
          },
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