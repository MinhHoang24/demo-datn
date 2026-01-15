import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Modal,
  Space,
  Table,
  message,
  Input,
  Select,
} from "antd";
import {
  PlusCircleFilled,
  DeleteFilled,
  ExclamationCircleFilled,
  SearchOutlined,
} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

import AddProduct from "./AddProduct";
import ProductDetails from "./ProductDetails";
import apiService from "../../Api/Api";
import { CATEGORY_TITLES } from "../../Constants/Category.ts";

const AdminProduct = () => {
  /* ================= TABLE STATE ================= */
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(undefined);
  const [sort, setSort] = useState(undefined);

  const [modalChild, setModalChild] = useState(null);

  /* ================= FETCH DATA (BE) ================= */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getAllProducts({
        page,
        limit,
        q: search || undefined,
        category,
        sort,
      });

      setProducts(res.data.products || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, category, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ================= DELETE ================= */
  const deleteProduct = async (record) => {
    try {
      await apiService.deleteProduct(record._id);
      message.success(`Đã xóa sản phẩm: ${record.name}`);
      fetchData();
    } catch {
      message.error("Xóa sản phẩm thất bại");
    }
  };

  const { confirm } = Modal;
  const showDeleteConfirm = (product) => {
    confirm({
      title: `Xác nhận xóa sản phẩm ${product.name}`,
      icon: <ExclamationCircleFilled />,
      onOk() {
        deleteProduct(product);
      },
    });
  };

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      title: "Mã",
      dataIndex: "_id",
      ellipsis: true,
    },
    {
      title: "Loại",
      dataIndex: "category",
      render: (c) => CATEGORY_TITLES[c] || c,
      sorter: true,
    },
    {
      title: "Tên",
      dataIndex: "name",
      sorter: true,
      ellipsis: true,
    },
    {
      title: "Giá",
      dataIndex: "price",
      sorter: true,
      render: (p) =>
        p.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        }),
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      sorter: true,
      render: (r) => (
        <span>
          {r} <FontAwesomeIcon icon={faStar} color="gold" />
        </span>
      ),
    },
    {
      title: "Action",
      width: 80,
      render: (_, record) => (
        <Button
          danger
          type="text"
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

      if (field === "rating") setSort("rating_desc");
      else setSort(`${field}_${order}`);
    } else {
      setSort(undefined);
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={() =>
            setModalChild(
              <AddProduct
                setModalChild={setModalChild}
                handleRefresh={fetchData}
              />
            )
          }
        >
          <PlusCircleFilled />
          Thêm sản phẩm
        </Button>

        <Select
          allowClear
          placeholder="Loại sản phẩm"
          style={{ width: 200 }}
          onChange={(v) => {
            setCategory(v);
            setPage(1);
          }}
        >
          {Object.entries(CATEGORY_TITLES).map(([k, v]) => (
            <Select.Option key={k} value={k}>
              {v}
            </Select.Option>
          ))}
        </Select>

        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên"
          style={{ width: 300 }}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </Space>

      <Modal
        open={!!modalChild}
        footer={null}
        onCancel={() => setModalChild(null)}
        width="auto"
        destroyOnClose
      >
        {modalChild}
      </Modal>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={products}
        loading={loading}
        onChange={handleTableChange}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: true,
        }}
        onRow={(record) => ({
          onClick: () =>
            setModalChild(
              <ProductDetails
                products={record}
                setModalChild={setModalChild}
                handleRefresh={fetchData}
              />
            ),
        })}
      />
    </div>
  );
};

export default AdminProduct;