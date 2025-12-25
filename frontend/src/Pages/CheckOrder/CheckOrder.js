import React, { useState, useEffect } from 'react';
import './CheckOrder.css';
import { Link } from 'react-router-dom';
import apiService from '../../Api/Api';

const CheckOrder = ({ id }) => {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatPrice = (price) =>
    price.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).replace(/\s/g, '');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiService.getUserOrders(id);
        setOrders(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [id]);

  if (loading) return <div className="pt-[200px]">Loading...</div>;
  if (error) return <div className="pt-[200px]">Error</div>;
  if (!orders?.length)
    return <div className="pt-[200px]">Bạn chưa mua đơn hàng nào.</div>;

  const handleReview = (productId) => {
    window.location.href = `/product/${productId}#reviews-section`;
  };

  return (
    <div className="list-order-container">
      <h1>ĐƠN HÀNG CỦA TÔI</h1>

      {orders.map((order) => {
        const totalAmount = order.chiTietDonHangs.reduce(
          (sum, item) => sum + item.total,
          0
        );

        return (
          <div key={order.id} className="order">
            <h3>Ngày đặt hàng: {new Date(order.ngayDat).toLocaleString()}</h3>

            <ul>
              {order.chiTietDonHangs.map((item) => (
                <li key={item.id} className="order-item">
                  <img src={item.variant.image} alt="" />
                  <div>
                    <Link to={`/product/${item.variant.hangHoa.maHangHoa}`}>
                      {item.variant.hangHoa.tenHangHoa}
                    </Link>

                    <p>Màu: {item.variant.color}</p>
                    <p>Số lượng: {item.soLuong}</p>
                    <p>Giá: {formatPrice(item.total)}</p>

                    {order.tinhTrangDonHang === 2 && (
                      <button
                        className="btn-y"
                        onClick={() =>
                          handleReview(item.variant.hangHoa.maHangHoa)
                        }
                      >
                        Đánh giá sản phẩm
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <p>Tổng tiền: {formatPrice(totalAmount)}</p>
          </div>
        );
      })}
    </div>
  );
};

export default CheckOrder;