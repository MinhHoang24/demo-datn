import React from 'react'
import { Link } from 'react-router-dom'
import './Item.css'
import ProductRating from '../ProductRating/ProductRating.js';

function Item(props) {
  const formatPrice = (price) => {
    let priceString = price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    return priceString.replace(/\s/g, '');
  }
  const discountPrice = props.price * (1 - props.sale/100);

  return (
    <div className='item'>
      <div className="item-info">
        <Link to={`/product/${props.id}`}>
          <div className="item-image">
            <img src={props.image} alt={props.name} />
          </div>
          <div className="item-name">
            <h3>{props.name}</h3>
          </div>
          <div className="box-price">
            <p className="item-price-new">{formatPrice(discountPrice)}</p>
            <p className="item-price-old">{formatPrice(props.price)}</p>
            <div className="item-price-percent">
              <p className="item-price-percent-detail">Giảm {' '}
               {props.sale}
                %
              </p>
              <div className="cover-item">
                <span>TRẢ GÓP 0%</span>
              </div>
            </div>
          </div>
          <div className="item-promotions">
            <div className="promotion">
              <p className="coupon-price">
                 Ưu đãi trả góp 0% lãi suất 
                 - 0% phí chuyển đổi
              </p>
            </div>
          </div>
          
        </Link>
      </div>
      <div className="bottom-div">
          <ProductRating rating = {props.rating}/>
      </div>
    </div>
  )
}

export default Item