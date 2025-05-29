import React, { useContext, useState } from 'react'
import './ProductDisplay.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartArrowDown, faCartPlus, faChevronLeft, faChevronRight, faStar } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import ProductRating from '../ProductRating/ProductRating';
import { useCart } from '../../Contexts/CartContext';
import apiInstance from "../../Api/Api"; 

function ProductDisplay(props) {
    const {product} = props;
    const [index, setIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);

    const handleIncrease = () => {
        setQuantity(prevQuantity => Math.min(prevQuantity + 1,product.variants[selectedVariantIndex].quantity ));
    };

    const handleDecrease = () => {
        setQuantity(prevQuantity => Math.max(prevQuantity - 1, 1));
    };

    //const { addToCart } = useCart();

    const formatPrice = (price) => {
        let priceString = price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
        return priceString.replace(/\s/g, '');
    }
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0); 
  
    const handleVariantClick = (index) => {
      setSelectedVariantIndex(index); 
      setIndex(index); 
    };
  
    const handleAddToCart = async () => {
        
        if (selectedVariantIndex !== null) {
            const selectedVariantColor = product.variants[selectedVariantIndex].color;
            
            //addToCart({ ...product, selectedVariant });
            try {
                const response = await apiInstance.addProductToCart( product._id, selectedVariantColor, quantity);
                if (response.data.message === "Product added to cart") {
                    alert("Sản phẩm đã được thêm vào giỏ hàng.");
                } else {
                    alert("Không thể thêm sản phẩm vào giỏ hàng, vui lòng thử lại.");
                }
            } catch (error) {
                console.error("Lỗi khi thêm vào giỏ hàng:", error);
                alert("Có lỗi xảy ra, vui lòng thử lại.");
            }
        } else {
            alert("Vui lòng chọn phân loại trước khi thêm vào giỏ hàng!");
        }
    };
    const totalRatings = product.totalRatings;

  return (
    <div className='productdisplay'>
        <div className="box-product-detail">
            <div className="box-product-detail__left">
                <div className="box-header">
                    <div className="box-product-name">
                        <h1>{product.name}</h1>
                    </div>
                    <div className="box-rating">
                        <a href="#reviews-section" className="a-review">
                        <ProductRating rating={product.rating} />&nbsp;{totalRatings} đánh giá
                        </a>
                    </div>
            </div>
                <div className="box-gallery">
                    <div className="gallery-slide swiper-container">
                        <div 
                            className="swiper-wrapper"
                            style={{
                                transform: `translateX(${-index * 100}%)`,
                                transitionDuration: '300ms'
                            }}
                        >
                            {product.variants.map((v, index) => {
                                return (
                                    <div key={index} className="swiper-slide gallery-img">
                                        <img src={v.image} alt="" />
                                    </div>
                                )
                            })}
                        </div>
                        <div 
                            className="swiper-button-prev"
                            onClick={() => setIndex(prev => prev - 1)}
                            style={ (index === 0) ? {display: 'none'} : {} }
                        >
                            <div className="icon">
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </div>
                        </div>
                        <div 
                            className="swiper-button-next"
                            onClick={() => setIndex(prev => prev + 1)}
                            style={ (index === product.variants.length - 1) ? {display: 'none'} : {} }
                        >
                            <div className="icon">
                                <FontAwesomeIcon icon={faChevronRight} />
                            </div>
                        </div>
                    </div>
                    <div className="thumbnail-slide swiper-container">
                        <div className="swiper-wrapper">
                            {product.variants.map((v, i) => {
                                return (
                                    <div 
                                        key={i} 
                                        className={`swiper-slide thumb-img ${index === i ? 'swiper-slide-thumb-active' : ''}`}
                                        onClick={() => setIndex(i)}
                                    >
                                        <img src={v.image} width={'58'} height={'58'} alt="" />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div className="box-product-detail__right">
                <div className="box-price1">
                   <p className="item-price-new">{formatPrice(product.price * (1 - product.variants[selectedVariantIndex].sale/100))}</p>
                   <p className="item-price-old">{formatPrice(product.price)}</p>
                   <div className="item-price-percent">
                     <p className="item-rice-percent-detail" style={{color:'red'}}>
                       Giảm &nbsp;
                       {product.variants[selectedVariantIndex].sale}%
                     </p>
                   </div>
                </div>
                <div className="box-product-variants">
                    <div className="box-title">
                        <p className = "p-20px"> Chọn màu sắc để xem giá chi tiết</p>
                    </div>
                    <div className="box-content">
                     <ul className="list-variants">
                       {product.variants.map((variant, index) => (
                         <li key={index} className={`item-variant ${index === selectedVariantIndex ? 'selected' : ''}`}>
                           <a
                             title={variant.color}
                             className="change-color-btn"
                             onClick={() => handleVariantClick(index)}
                           >
                             <img src={variant.image} alt={`${product.name}`} />
                             <div>
                               <strong className="item-variant-name">{variant.color}</strong>
                               <span>{formatPrice(product.price * (1 - variant.sale/100))}</span>
                             </div>
                           </a>
                         </li>
                     ))}
                   </ul>
                    </div>
                </div>
                <div className="add-quantity">
                    <p className = "p-20px"> Số Lượng: </p>
                    <div className="button-quantity">
                        <button className = "button-minus" onClick={handleDecrease}>-</button>
                        <span className = "span-product">{quantity}</span>
                        <button className = "button-plus" onClick={handleIncrease}>+</button>
                    </div>
                    <p className="p-14px">{product.variants[selectedVariantIndex].quantity} sản phẩm có sẵn</p>
                </div>
                <div className="box-order-btn">
                    <button onClick={handleAddToCart} className="order-btn">
                        <Link to='/order'>
                            <strong>MUA NGAY</strong>
                            <span>(Thanh toán khi nhận hàng hoặc nhận tại cửa hàng)</span>
                        </Link>
                    </button>
                    <button onClick={handleAddToCart} className="add-to-cart-btn">
                        <FontAwesomeIcon icon={faCartArrowDown} />
                        <span>Thêm vào giỏ</span>
                    </button>
                    
                </div>
                
            </div>
        </div>
    </div>
  )
}

export default ProductDisplay