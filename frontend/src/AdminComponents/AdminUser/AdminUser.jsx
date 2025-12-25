import React, { useEffect, useRef, useState } from "react";
import { Button, Modal, Space, Table, message, Input } from "antd";
import {
  DeleteFilled,
  ExclamationCircleFilled,
  SearchOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import apiService from "../../Api/Api";

const { confirm } = Modal;

const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  // Helper check token
  const ensureAuth = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      message.error("Bạn cần phải đăng nhập!");
      return null;
    }
    return token;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = ensureAuth();
        if (!token) return;

        const response = await apiService.getAllUsers();
        setUsers(response.data.users || []);
      } catch (error) {
        console.error(error);
        const errorMsg =
          error.response?.data?.message || "Không thể lấy dữ liệu người dùng";
        message.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => {
              clearFilters?.();
              confirm();
              setSearchText("");
              setSearchedColumn(dataIndex);
            }}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button type="link" size="small" onClick={close}>
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) => {
      const field = record[dataIndex];
      if (!field) return false;
      return field.toString().toLowerCase().includes(value.toLowerCase());
    },
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const deleteUser = async (record) => {
    try {
      const token = ensureAuth();
      if (!token) return;

      await apiService.deleteUser(record._id);
      setUsers((prev) => prev.filter((user) => user._id !== record._id));
      message.success(`Đã xóa user: ${record._id}`);
    } catch (error) {
      console.error(error);
      const errorMsg =
        error.response?.data?.message ||
        `Xóa user thất bại: ${record._id}`;
      message.error(errorMsg);
    }
  };

  const showDeleteConfirm = (user) => {
    confirm({
      title: `Xác nhận xóa người dùng ${user._id}!`,
      icon: <ExclamationCircleFilled />,
      content: `User name: ${user.userName}`,
      onOk() {
        deleteUser(user);
      },
    });
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: "5%",
    },
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      ellipsis: true,
      sorter: (a, b) => a._id.localeCompare(b._id),
      sortDirections: ["descend", "ascend"],
      width: "15%",
      ...getColumnSearchProps("_id"),
    },
    {
      title: "User name",
      dataIndex: "userName",
      key: "userName",
      ellipsis: true,
      width: "20%",
      ...getColumnSearchProps("userName"),
    },
    {
      title: "Phone number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      ellipsis: true,
      width: "15%",
      ...getColumnSearchProps("phoneNumber"),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      width: "20%",
      ...getColumnSearchProps("email"),
    },
    {
      title: "Địa chỉ",
      dataIndex: "diaChi",
      key: "diaChi",
      ellipsis: true,
      width: "30%",
      ...getColumnSearchProps("diaChi"),
    },
    {
      title: "Actions",
      key: "actions",
      width: "10%",
      render: (_, record) => (
        <Button
          style={{ transform: "scale(1.5,1.5)" }}
          type="text"
          size="small"
          shape="circle"
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

  const dataSource = users.map((user, index) => ({
    ...user,
    key: user._id,
    stt: index + 1,
  }));

  return (
    <div>
      <Table
        columns={columns}
        loading={loading}
        dataSource={dataSource}
        pagination={{
          pageSizeOptions: ["10", "15"],
          showSizeChanger: true,
          defaultPageSize: 10,
          style: { marginBottom: "20px" },
        }}
      />
    </div>
  );
};

export default AdminUser;