import React, { useEffect, useContext, useState, useMemo } from 'react';
import { useCart } from '../../Contexts/CartContext';
import './CheckOut.css';
import apiService from '../../Api/Api';
import { MdDelete } from "react-icons/md";

const Checkout = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userOrders, setUserOrders] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await apiService.getUserProfile();
                if (response.data && response.data.user) {
                    setUser(response.data.user);
                }
            } catch (error) {
                console.error('Failed to fetch user info', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchUserOrders = async () => {
            if (user && user._id) {
                try {
                    const response = await apiService.getUserOrders(user._id);
                    if (response.data) {
                        setUserOrders(response.data.orders);
                    }
                } catch (error) {
                    console.error('Failed to fetch user orders', error);
                }
            }
        };

        fetchUserOrders();
    }, [user]);


    const { cart, selectedItems } = useCart();
    const [recipientName, setRecipientName] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isPaymentOptionsVisible, setIsPaymentOptionsVisible] = useState(false);
    const orderDate = new Date();

    const selectedProducts = useMemo(() => {
        const selectedSet = new Set(selectedItems);
        return cart ? cart.filter(item => selectedSet.has(item.id)) : [];
    }, [cart, selectedItems]);

    const formatPrice = (price) => {
        return price ? price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'N/A';
    };

    const handleCancelOrder = async (orderId) => {
        const confirmCancel = window.confirm('Bạn có muốn hủy đơn hàng này?');
        if (!confirmCancel) {
            return; // Exit if the user cancels the confirmation dialog.
        }
    
        try {
            // Call the API to cancel the order
            const response = await apiService.cancelOrder(orderId);

            const userId = localStorage.getItem('userID')
    
            // Check if the response indicates success
            if (response.data && response.data.success) {
                // Update the UI by removing the canceled order
                // setUserOrders((prevOrders) => prevOrders.filter(order => order._id !== orderId));
                alert('Hủy đơn hàng thành công!');
                const updatedOrdersResponse = await apiService.getUserOrders(userId);
                setUserOrders(updatedOrdersResponse.data.orders); 
            } else {
                alert('Hủy đơn hàng thất bại. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Lỗi khi hủy đơn hàng:', error);
            alert('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        try {
            // Call the API endpoint to delete the order
            const response = await apiService.deleteOrder(orderId);

            console.log(response)

            // Check if the response is as expected
            if (response.status === 200) {
                // Remove the deleted order from the state
                setUserOrders((prevOrders) => prevOrders.filter(order => order._id !== orderId));
                alert('Đã xóa đơn hàng thành công!');
            } else {
                alert('Xóa đơn hàng thất bại. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Lỗi khi xóa đơn hàng', error);
            alert('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        }
    };


    const calculateEstimatedDeliveryDate = (days) => {
        const deliveryDate = new Date(orderDate);
        deliveryDate.setDate(deliveryDate.getDate() + days);
        return deliveryDate.toLocaleDateString('vi-VN');
    };

    const handlePaymentClick = () => {
        setIsPaymentOptionsVisible(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        var ids = [];
        var numbers = [];

        selectedProducts.forEach((item) => {
            ids.push(item.selectedVariant.id);
            numbers.push(item.quantity);
        });

        // try {
        //     const orderInfo = await AllApi.addOrder(ids, numbers);
        //     const response = await AllApi.checkout(calculateTotalPrice, recipientName + " mua hang", orderInfo.data.maDonHang);
        //     window.location.href = response.data;
        // } catch (error) {
        //     console.log(error);
        // }
    };


    const handleCODPayment = async (e) => {
        e.preventDefault();
        var ids = [];
        var numbers = [];

        selectedProducts.forEach((item) => {
            ids.push(item.selectedVariant.id);
            numbers.push(item.quantity);
        });
        // try {
        //     await AllApi.addOrder(ids, numbers);
        // } catch (error) {
        //     console.log(error);
        // }
    };

    // Conditional rendering for loading and user data
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return (
            <div className="no-user-info">
                <p>Không có thông tin người dùng. Vui lòng đăng nhập.</p>
            </div>
        );        
    }

    const getStatusCardStyle = (status) => {
        switch (status) {
            case 'Processing':
                return { backgroundColor: '#f9c74f', color: '#fff', padding: '10px', borderRadius: '5px' };
            case 'Shipped':
                return { backgroundColor: '#4dabf7', color: '#fff', padding: '10px', borderRadius: '5px' };
            case 'Delivered':
                return { backgroundColor: '#43a047', color: '#fff', padding: '10px', borderRadius: '5px' };
            case 'Cancelled':
                return { backgroundColor: '#f44336', color: '#fff', padding: '10px', borderRadius: '5px' };
            default:
                return { backgroundColor: '#bdbdbd', color: '#fff', padding: '10px', borderRadius: '5px' };
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Processing':
                return 'Đang xử lý';
            case 'Shipped':
                return 'Đã giao hàng';
            case 'Delivered':
                return 'Đã nhận hàng';
            case 'Cancelled':
                return 'Đã hủy';
            default:
                return 'Trạng thái không xác định';
        }
    };

    return (
        <div className="checkout-container">
            <div style={{ display: "flex", justifyContent: 'center' }}>
                <h1>Thông tin đơn hàng</h1>
            </div>
            <div className="checkout-page">
                <form onSubmit={handleSubmit}>
                    <h3>Thông tin người nhận hàng:</h3>
                    {isLoggedIn ? (
                        <div className="receiver-inf">
                            <div className="form-group">
                                <div className='form-group-inf'>
                                    <label>Tên người nhận:</label>
                                    <div>{user.userName || recipientName}</div> {/* Display name as non-editable */}
                                </div>
                                <div className="form-group-inf">
                                    <label>Số điện thoại người nhận:</label>
                                    <div>{user.phoneNumber || phoneNumber}</div> {/* Display phone number as non-editable */}
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="form-group-inf-address">
                                    <label htmlFor="address">Địa chỉ nhận hàng:</label>
                                    <input
                                        type="text"
                                        id="address"
                                        value={user.diaChi || address} // Editable address field
                                        onChange={(e) => setAddress(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="receiver-inf">
                            <p>Vui lòng đăng nhập để tự động điền thông tin người nhận.</p>
                        </div>
                    )}

                    <h3>Đơn hàng của bạn:</h3>
                    <div className="checkout-items">
                        {userOrders.map((item) => (
                            <div key={item._id} className="checkout-item-wrapper">
                                <div className="checkout-item">
                                    <div className='checkout-item-infor'>
                                        <div className="checkout-item-details">
                                            {item.items.map((productItem, index) => (
                                                <div key={index} className="product-details">
                                                    <h2>{productItem.productId.name}</h2>
                                                    <p className="item-price">Giá: {formatPrice(productItem.productId.price)}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ marginTop: '10px' }}>
                                            <h4>Tổng tiền: {formatPrice(item.totalAmount)}</h4>
                                        </div>
                                    </div>
                                    <div className="date-form">
                                        <div className="date-inf" style={{ marginTop: '10px' }}>
                                            <p>Ngày đặt hàng: {new Date(item.updatedAt).toLocaleDateString('vi-VN')}</p>
                                        </div>
                                        <div className="date-inf">
                                            <p>Ngày nhận hàng dự kiến: {calculateEstimatedDeliveryDate(3)} đến {calculateEstimatedDeliveryDate(7)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Status Card */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <p style={{ marginRight: '10px' }}>Trạng thái :</p>
                                        <div className="order-status-card" style={getStatusCardStyle(item.orderStatus)}>
                                            <p>{getStatusText(item.orderStatus)}</p>
                                        </div>
                                    </div>
                                    {/* Cancel Order Button */}
                                    {item.orderStatus !== 'Cancelled' ? (
                                        <button
                                            className="cancel-order-button"
                                            onClick={() => handleCancelOrder(item._id)}
                                        >
                                            Hủy đơn hàng
                                            
                                        </button>
                                    ) : (
                                        <button
                                            className="cancel-order-button"
                                            onClick={() => handleDeleteOrder(item._id)}
                                        >
                                            Xóa đơn hàng
                                            <MdDelete style={{ fontSize: '20px', justifyContent: 'center', alignItems: 'center' }} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;