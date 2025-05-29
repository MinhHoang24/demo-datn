import React, { useState, useEffect } from 'react';
import './CheckOrder.css';
import { Link } from 'react-router-dom';
import CommentAndRating from '../../Components/CommentAndRating/CommentAndRating';
import apiService from '../../Api/Api';

const CheckOrder = ({ id }) => {
    const [orders, setOrders] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancelState, setCancelState] = useState("Hủy đơn hàng");

    const formatDateTime = (isoDate) => {
        const date = new Date(isoDate);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${hours}:${minutes}:${seconds} ngày ${day}-${month}-${year}`;
    };

    const formatPrice = (price) => {
        let priceString = price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
        return priceString.replace(/\s/g, '');
    };

    const handleCancelOrder = async (order) => {
        try {
            const response = await apiService.deleteOrder(order.maDonHang);
            if (response.redirected) {
                window.location.href = response.url.replace('http://', 'https://');
            }
            return response.json();
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await apiService.getUserOrders(id); 
                console.log('Fetched order data:', response.data);
                setOrders(response.data);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [id]);

    if (loading) {
        return <div style={{ paddingTop: "200px" }}>Loading...</div>;
    }

    if (error) {
        return <div style={{ paddingTop: "200px" }}>Error: {error.message}</div>;
    }

    if (!orders || orders.length === 0) {
        return <div style={{ paddingTop: "200px" }}>Bạn chưa mua đơn hàng nào.</div>;
    }

    const handleReview = (productId) => {
        const reviewUrl = `/product/${productId}#reviews-section`;
        window.location.href = reviewUrl;
    };

    const getOrderStatus = (status) => {
        switch (status) {
            case 0:
                return "Đơn hàng đã được đặt";
            case 1:
                return "Đơn hàng đang vận chuyển";
            case 2:
                return "Đơn hàng đã được giao";
            default:
                return "Đơn hàng đã bị hủy";
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 0:
                return 'status-placed';
            case 1:
                return 'status-shipping';
            case 2:
                return 'status-delivered';
            default:
                return 'status-unknown';
        }
    };

    return (
        <div className='list-order-container'>
            <h1>ĐƠN HÀNG CỦA TÔI</h1>
            {orders.map((order) => {
                const totalAmount = order.chiTietDonHangs.reduce((sum, item) => sum + item.total, 0);
                return (
                    <div key={order.id} className={`order ${getStatusClass(order.tinhTrangDonHang)}`}>
                        <h3><strong>Ngày đặt hàng:</strong> {formatDateTime(order.ngayDat)}</h3>
                        <h4>Sản phẩm:</h4>
                        <ul>
                            {order.chiTietDonHangs.map((item) => (
                                <li key={item.id} className="order-item">
                                    <img src={item.variant.image} alt={item.variant.hangHoa.tenHangHoa} className="product-image" />
                                    <div className="product-details">
                                        <Link className='link-to' to={`/product/${item.variant.hangHoa.maHangHoa}`}>
                                            <p><strong>Tên sản phẩm: </strong>{item.variant.hangHoa.tenHangHoa}</p>
                                        </Link>
                                        <p><strong>Màu sắc:</strong> {item.variant.color}</p>
                                        <p><strong>Số lượng:</strong> {item.soLuong}</p>
                                        <p><strong>Giá:</strong> {formatPrice(item.total)}</p>
                                        {order.tinhTrangDonHang === 2 && (
                                            <button onClick={() => handleReview(item.variant.hangHoa.maHangHoa)} className='btn-y'>Bấm vào sản phẩm để đánh giá ngay</button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <p><strong>Tổng số tiền:</strong> {formatPrice(totalAmount)} ({order.daThanhToan ? "Đã Thanh toán" : "Chưa thanh toán"})</p>
                        <p className='link-to'><strong>Trạng thái:</strong> {getOrderStatus(order.tinhTrangDonHang)}</p>
                        {order.tinhTrangDonHang === 0 && (
                            <button className='btn-cancel' onClick={() => handleCancelOrder(order)}>Hủy đơn hàng</button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default CheckOrder;