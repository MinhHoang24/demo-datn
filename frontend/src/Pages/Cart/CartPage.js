import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import apiInstance from "../../Api/Api"; // Adjust the path to your API service
import "./CartPage.css";
import { MdDelete } from "react-icons/md";
import { TiArrowBack } from "react-icons/ti";
 
export default function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const userId = localStorage.getItem("userID");
 
    const [isPaymentOptionsVisible, setIsPaymentOptionsVisible] = useState(false);
 
    const handlePaymentClick = () => {
        setIsPaymentOptionsVisible(true);
    };
 
    const formatPrice = (price) => {
        if (price === null || price === undefined) {
            return 'N/A';
        }
        return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };
 
 
    useEffect(() => {
        const fetchCartItemsWithNames = async () => {
            setLoading(true);
            try {
                const response = await apiInstance.getCart();
                const cartItems = response.data.cart.items || [];
 
                const itemsWithNames = await Promise.all(
                    cartItems.map(async (item) => {
                        const productResponse = await apiInstance.getProductById(item.productId);
                        return {
                            ...item,
                            productName: productResponse.data.product.name,
                            price: productResponse.data.product.price,
                            selected: true, // Khởi tạo thuộc tính selected mặc định là true
                        };
                    })
                );
 
                setCartItems(itemsWithNames);
            } catch (error) {
                console.error("Error fetching cart items:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCartItemsWithNames();
    }, []);
 
 
    const handleQuantityChange = async (id, variantColor, value) => {
        try {
            const updatedItem = cartItems.find(
                (item) => item.productId === id && item.variant.color === variantColor
            );
            const newQuantity = Math.max(1, updatedItem.quantity + value);
            await apiInstance.updateCartQuantity(id, variantColor, newQuantity);
 
            setCartItems((prevItems) =>
                prevItems.map((item) =>
                    item.productId === id && item.variant.color === variantColor
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            );
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };
 
    const calculateTotalPrice = (item) => {
        const newPriceNumeric = Number(item.price * (100 - item.variant.sale) / 100);
        return newPriceNumeric * item.quantity;
    };
 
    const handleRemoveItem = async (id, variantColor) => {
        try {
            await apiInstance.removeProductFromCart(id, variantColor);
            setCartItems((prevItems) =>
                prevItems.filter((item) => !(item.productId === id && item.variant.color === variantColor))
            );
        } catch (error) {
            console.error("Error removing item:", error);
        }
    };
 
    const handleToggleSelect = (id) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item._id === id ? { ...item, selected: !item.selected } : item
            )
        );
    };
 
    const handleRemoveAll = async () => {
        try {
            await apiInstance.clearCart();
            setCartItems([]);
        } catch (error) {
            console.error("Error clearing cart:", error);
        }
    };
 
    const handleAddComment = async (productId, commentText) => {
        try {
            await apiInstance.addComment({
                productId,
                userId,
                text: commentText,
            });
            alert("Comment added successfully!");
        } catch (error) {
            console.error("Error adding comment:", error);
            alert("Failed to add comment.");
        }
    };
 
    // Function to add a rating
    const handleAddRating = async (productId, ratingValue) => {
        try {
            await apiInstance.addRating({
                productId,
                userId,
                rating: ratingValue,
            });
            alert("Rating added successfully!");
        } catch (error) {
            console.error("Error adding rating:", error);
            alert("Failed to add rating.");
        }
    };
 
    const handleCheckout = async () => {
        const selectedItems = cartItems.filter((item) => item.selected); // Filter selected items
 
        if (selectedItems.length === 0) {
            alert("Vui lòng lựa chọn sản phẩm để thanh toán!");
            return;
        }
 
        const orderData = {
            userId,
            items: selectedItems.map(item => ({
                productId: item.productId,
                variant: item.variant,
                quantity: item.quantity,
                price: item.variant.sale, // Use sale price for the order
            })),
            totalAmount,
            paymentMethod: "Cash on Delivery", // Example payment method
        };
 
        try {
            const response = await apiInstance.createOrder(orderData);
            if (response.data) {
                alert("Order created successfully!");
                navigate("/checkout");
            }
        } catch (error) {
            console.error("Error creating order:", error);
            alert("Failed to create order.");
        }
    };
 
    const totalAmount = cartItems.reduce(
        (total, item) => total + (item.selected ? (item.price * (100 - item.variant.sale) / 100) * item.quantity : 0),
        0
    );
 
    if (loading) return <div>Loading cart...</div>;
 
    return (
        <div className="cart-page">
            <div style={{ display: 'flex', justifyContent: "center" }}>
                <h1>Giỏ hàng của bạn</h1>
            </div>
            <div className="total-product-cart">
                {cartItems.length === 0 ? (
                    <div className="Empty-cart" style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="icon-container">
                            <FontAwesomeIcon icon={faCartShopping} flip="horizontal" size="6x" color="red" />
                        </div>
                        <p style={{ margin: "20px" }}>Giỏ hàng của bạn trống</p>
                        <Link to="/">
                            <button className="btn-go-home">Tiếp tục mua sắm</button>
                        </Link>
                    </div>
                ) : (
                    <div className="cart-container">
                        {cartItems.map((item) => (
                            <div key={item._id} className="cart-item">
                                <div className="cart-item-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={item.selected}
                                        onChange={() => handleToggleSelect(item._id)}
                                    />
                                </div>
 
                                <div className="cart-item-info">
                                    <img src={item.variant?.image || "defaultImage.jpg"} alt={item.productName} />
                                    <div className="cart-item-details">
                                        <h2>{item.productName}</h2>
                                        <p>Màu sắc: {item.variant.color || 'N/A'}</p>
                                        <p>Giá: {(item.price * (100 - item.variant.sale) / 100).toLocaleString()} VNĐ</p>
                                    </div>
                                </div>
 
                                <div className="price-details">
                                    <div className="quantity-controls">
                                        <h3> Số lượng: </h3>
                                        <button onClick={() => handleQuantityChange(item.productId, item.variant.color, -1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => handleQuantityChange(item.productId, item.variant.color, 1)}>+</button>
                                    </div>
                                    <div className="product-actions">
                                        <button className="delete-product" onClick={() => handleRemoveItem(item.productId, item.variant.color)}>
                                            Xóa <MdDelete style={{ fontSize: '24px' }} />
                                        </button>
                                        <div style={{ fontSize: '20px', background: 'rgb(50, 132, 194)', color: "rgb(255, 255, 3)" }} className="delete-product">Đơn giá: {formatPrice(calculateTotalPrice(item))}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
 
                        <div className="total-selected-items">
                            <h3>Tổng tiền thanh toán: </h3>
                            <p style={{ fontSize: '24px', color: 'green', marginTop: "10px" }}>
                                {formatPrice(totalAmount)}
                            </p>
                        </div>
 
 
                        <div className="bottom-order">
                            <Link to="/">
                                <button>Chọn thêm sản phẩm</button>
                            </Link>
 
                            <div className='btn-complete-order-container' style={{ justifyContent: 'center' }}>
                                {!isPaymentOptionsVisible ? (
                                    <button type="button" className="btn-complete-payment" onClick={handlePaymentClick}>
                                        Thanh toán
                                    </button>
                                ) : (
                                    <div className='payment-choice'>
                                        <button type="button" className="btn-complete-order" onClick={handleCheckout}>
                                            Thanh toán khi nhận hàng
                                        </button>
                                        <button type="submit" className="btn-complete-order">
                                            Thanh toán online
                                        </button>
 
                                        <TiArrowBack
                                            style={{ fontSize: '25px', cursor: 'pointer', transition: 'transform 0.3s ease' }}
                                            type="button"
                                            className="btn-back"
                                            onClick={() => setIsPaymentOptionsVisible(false)}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}