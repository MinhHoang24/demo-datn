import React, { useEffect, useRef, useState } from "react";
import { Button, Modal, Space, Table, message, Input, Select } from "antd";
import {
  PlusCircleFilled,
  DeleteFilled,
  ExclamationCircleFilled,
  SearchOutlined,
} from "@ant-design/icons";
import Highlighter from 'react-highlight-words';
import AddProduct from "./AddProduct";
import ProductDetails from "./ProductDetails";
import apiService from "../../Api/Api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from '@fortawesome/free-solid-svg-icons';

const AdminProduct = () => {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [nameSearch, setNameSearch] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [products, setProducts] = useState([]);
  const [modalChild, setModalChild] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiService.getAllProducts();
        const rawData = response.data.products || []; 
        if (Array.isArray(rawData)) {
          setProducts(rawData); // Cập nhật state sản phẩm
        } else {
          console.error("Dữ liệu không phải mảng:", rawData);
          setProducts([]);  // Trả về mảng rỗng nếu dữ liệu không hợp lệ
        }
      
      } catch (error) {
        console.error("Error fetching products:", error);
        message.error('Không thể lấy dữ liệu sản phẩm');
        setProducts([]); 
      } finally {
         setLoading(false);
      }
    };
    fetchData();
  }, [refresh]);
  const onRefresh = () => {
    setRefresh(prev => !prev);
  };

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => {
              clearFilters && clearFilters();
              confirm();
              setSearchText('');
              setSearchedColumn(dataIndex);
            }}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
      filterDropdownProps: {
        onOpenChange: (visible) => {
          if (visible) {
            setTimeout(() => searchInput.current?.select(), 100);
          }
        }
      },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const deleteProduct = async (record) => {
    try {
      console.log('Record:', record);
      await apiService.deleteProduct(record._id); 
      const updatedProducts = products.filter(
        (product) => product._id !== record._id
      );
      setProducts(updatedProducts);
      message.success(`Đã xóa sản phẩm: ${record.name}`);
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
      message.error(`Xóa sản phẩm thất bại: ${record.name}`);
    }
  };
  
  const { confirm } = Modal;
  const showDeleteConfirm = (product) => {
    confirm({
      title: `Xác nhận xóa sản phẩm ${product.name}!`,
      icon: <ExclamationCircleFilled />,
      content: `Mã sản phẩm: ${product._id}`,
      onOk() {
        deleteProduct(product);
      },
      onCancel() {},
    });
  };
 
  const columns = [
    {
      title: "Mã",
      dataIndex: "_id",
      key: "MaHangHoa",
      ellipsis: true,
      sorter: (a, b) => a._id.localeCompare(b._id),
      sortDirections: ['descend', 'ascend'],
      ...getColumnSearchProps('_id'),
    },
    {
      title: "Loại",
      dataIndex: "category",
      key: "LoaiHangHoa",
      ellipsis: true,
      sorter: (a, b) => a.category.localeCompare(b.category),
      sortDirections: ['descend', 'ascend'],
      ...getColumnSearchProps('category'),
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "TenHangHoa",
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ['descend', 'ascend'],
      ...getColumnSearchProps('name'),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "Gia",
      render: (text) => text.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
      ellipsis: true,
      sorter: (a, b) => a.price - b.price,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: "Số lượng",
      key: "quantity",
      render: (_, record) => {
        const totalQuantity = (record.variants || []).reduce(
          (sum, v) => sum + (v.quantity || 0),
          0
        );
        return totalQuantity;
      },
      sorter: (a, b) => {
        const qa = (a.variants || []).reduce((s, v) => s + (v.quantity || 0), 0);
        const qb = (b.variants || []).reduce((s, v) => s + (v.quantity || 0), 0);
        return qa - qb;
      },
      ellipsis: true,
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      render: (star) =>
        <span>{star} <FontAwesomeIcon icon={faStar} color={"gold"} /></span>,
      key: "rating",
      sorter: (a, b) => a.rating - b.rating,
      sortDirections: ['descend', 'ascend'],
      ellipsis: true,
    },
    {
      title: "Action",
      width: 76,
      render: (_, record) => (
        <Button
          style={{transform: "scale(1.5,1.5)"}}
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

  const categories = React.useMemo(() => {
    const set = new Set(products.map(p => p.category));
    return ["ALL", ...Array.from(set)];
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      const matchCategory =
        selectedCategory === "ALL" || p.category === selectedCategory;

      const matchName =
        p.name.toLowerCase().includes(nameSearch.toLowerCase());

      return matchCategory && matchName;
    });
  }, [products, selectedCategory, nameSearch]);

  return (
    <div>
      <Space
        style={{
          marginBottom: 16,
        }}
      >
        <Button type="primary" onClick={()=>setModalChild(<AddProduct setModalChild={setModalChild} handleRefresh={onRefresh}/>)}>
          <PlusCircleFilled />
          Thêm sản phẩm
        </Button>
        <Select
          style={{ width: 180 }}
          listHeight={400}
          value={selectedCategory}
          onChange={setSelectedCategory}
        >
          {categories.map(c => (
            <Select.Option key={c} value={c}>
              {c === "ALL" ? "Tất cả" : c}
            </Select.Option>
          ))}
        </Select>
        <Input
          allowClear
          placeholder="Tìm theo tên sản phẩm"
          prefix={<SearchOutlined />}
          style={{ width: 360 }}
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
        />
      </Space>

      <Modal
        title={false}
        centered
        open={modalChild !== null}
        onCancel={() => setModalChild(null)}
        maskClosable={false}
        footer={null}
        destroyOnHidden={true}
        width="auto"
      >
        {modalChild}
      </Modal>
      <Table
        onRow={(record, rowIndex) => {
          return {
            onClick: () => {
              setModalChild(<ProductDetails products={record} setModalChild={setModalChild} handleRefresh={onRefresh} />);
            },
            onMouseEnter: (event) => {
              event.currentTarget.style.cursor = "pointer";
            },
            onMouseLeave: (event) => {
              event.currentTarget.style.cursor = "default";
            },
          };
        }}
        columns={columns}
        dataSource={filteredProducts}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSizeOptions: ['5', '10', '15'], 
          showSizeChanger: true, 
          defaultPageSize: 5, 
          style: { marginBottom: "20px" }, 
        }}
        
      />
    </div>
  );
};
export default AdminProduct;