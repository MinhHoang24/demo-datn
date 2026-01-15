import React, { useEffect, useState, useCallback } from "react";
import { Button, Modal, Table, message, Input } from "antd";
import {
  DeleteFilled,
  ExclamationCircleFilled,
  SearchOutlined,
} from "@ant-design/icons";
import apiService from "../../Api/Api";

const { confirm } = Modal;

const AdminUser = () => {
  /* ================= TABLE STATE ================= */
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(undefined);

  /* ================= FETCH DATA (BE) ================= */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getAllUsers({
        page,
        limit,
        q: search || undefined,
        sort,
      });

      setUsers(res.data.users || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (error) {
      console.error(error);
      message.error(
        error.response?.data?.message || "Không thể lấy dữ liệu người dùng"
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= DELETE ================= */
  const deleteUser = async (record) => {
    try {
      await apiService.deleteUser(record._id);
      message.success(`Đã xóa user: ${record._id}`);
      fetchData();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Xóa user thất bại"
      );
    }
  };

  const showDeleteConfirm = (user) => {
    confirm({
      title: `Xác nhận xóa người dùng`,
      icon: <ExclamationCircleFilled />,
      content: `Email: ${user.email}`,
      onOk() {
        deleteUser(user);
      },
    });
  };

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      title: "STT",
      render: (_, __, index) => (page - 1) * limit + index + 1,
      width: 70,
    },
    {
      title: "ID",
      dataIndex: "_id",
      ellipsis: true,
    },
    {
      title: "User name",
      dataIndex: "userName",
      sorter: true,
    },
    {
      title: "Phone number",
      dataIndex: "phoneNumber",
    },
    {
      title: "Email",
      dataIndex: "email",
      sorter: true,
    },
    {
      title: "Địa chỉ",
      dataIndex: "diaChi",
    },
    {
      title: "Actions",
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteFilled />}
          onClick={(e) => {
            e.stopPropagation();
            showDeleteConfirm(record);
          }}
        />
      ),
    },
  ];

  /* ================= TABLE CHANGE ================= */
  const handleTableChange = (pagination, filters, sorter) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);

    if (sorter?.order) {
      const field = sorter.field;
      const order = sorter.order === "ascend" ? "asc" : "desc";
      setSort(`${field}_${order}`);
    } else {
      setSort(undefined);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên hoặc email"
          style={{ width: 320 }}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={users}
        loading={loading}
        onChange={handleTableChange}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "15", "20"],
        }}
      />
    </div>
  );
};

export default AdminUser;