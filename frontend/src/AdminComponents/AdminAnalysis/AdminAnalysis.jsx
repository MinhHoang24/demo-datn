import React, { useEffect, useState } from "react";
import { message, Statistic, Row, Col, Card, Spin } from "antd";
import apiService from '../../Api/Api.js'; // Giả sử apiService chứa các phương thức gọi API

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const AdminOrder = () => {
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          message.error('Bạn cần đăng nhập để truy cập dữ liệu!');
          return;
        }

        // Fetch thống kê đơn hàng (tổng đơn, doanh thu, số đơn đã hoàn thành)
        const statsResponse = await apiService.getOrderStatistics();
        setStatistics(statsResponse.data);

      } catch (error) {
        console.error(error);
        message.error('Không thể lấy dữ liệu đơn hàng!');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refresh]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Card
          title={
            <div style={{ fontWeight: "bold", fontSize: "24px" }}>
              Thong ke
            </div>
          }
          style={{ width: "70%", margin: "auto", height: "90%" }}
        >
          <p>
            <strong>Tổng đơn hàng:</strong> {statistics.totalOrders}
          </p>
          <p>
            <strong>Doanh thu:</strong> {statistics.totalRevenue} VND
          </p>
          <p>
            <strong>Đơn hàng đã hoàn thành:</strong> {statistics.completedOrders}
          </p>
        </Card>
      )}
    </div>
    
  );
};

export default AdminOrder;
