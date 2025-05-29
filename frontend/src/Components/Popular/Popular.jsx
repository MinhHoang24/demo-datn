import React, { useEffect, useRef, useState } from 'react'
import './Popular.css'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Item from '../Item/Item.jsx'
import apiService from '../../Api/Api.js';

function Popular({ category }) {
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const elementRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const [title, setTitle] = useState("");
  const [data_product, setDataProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getProducts();
        const products = response.data.products
        const filteredProducts = products.filter((product) => product.category.toLowerCase().trim() === category.toLowerCase().trim());

        setDataProducts(filteredProducts);

        switch (category) {
          case 'Điện thoại':
            setTitle('ĐIỆN THOẠI');
            break;
          case 'Laptop':
            setTitle('LAPTOP');
            break;
          case 'Tai nghe':
            setTitle('TAI NGHE');
            break;
          case 'Bàn phím':
            setTitle('BÀN PHÍM');
            break;
          case 'Chuột':
            setTitle('CHUỘT');
            break;
          case 'Phụ kiện':
            setTitle('PHỤ KIỆN');
            break;
          case 'Ti vi':
            setTitle('TI VI');
            break;
          default:
            setTitle('');
            break;
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchData();
  }, [category]);
  
 
  useEffect(() => {
    const handleOffset = () => {
      const element = elementRef.current;
      let containerWidth;
      
      if (window.innerWidth > 1200) {
        setOffset(index * 234.8);
        setMaxIndex((data_product.length - 5));
      } 
      else if (window.innerWidth > 990) {
        setOffset(index * (width / 4 + 2.5));
        setMaxIndex((data_product.length - 4));
      }
      else if (window.innerWidth > 717) {
        setOffset(index * (width / 3 + 3.33333));
        setMaxIndex((data_product.length - 3));
      }
      else {
        setOffset(index * (width / 2 + 5));
        setMaxIndex((data_product.length - 2));
      }

      if (element) {
        containerWidth = element.offsetWidth;
        setWidth(containerWidth);
      }
    }  

    handleOffset();

    window.addEventListener('resize', handleOffset);

    return () => window.removeEventListener('resize', handleOffset);
  }, [index, width, data_product.length]);

  useEffect(() => {
    if (index < -maxIndex) {
      if (window.innerWidth > 1200) {
        setIndex((data_product.length > 5) ? (-(data_product.length - 5)) : 0);
      } 
      else if (window.innerWidth > 990) {
        setIndex((data_product.length > 4) ? (-(data_product.length - 4)) : 0);
      }
      else if (window.innerWidth > 717) {
        setIndex((data_product.length > 3) ? (-(data_product.length - 3)) : 0);
      }
      else {
        setIndex((data_product.length > 2) ? (-(data_product.length - 2)) : 0);
      }
    }
 
  }, [maxIndex, index])

  return (
    <>
      {(data_product.length > 0) && 
        <div className='popular'>
          <div className="product-list-title">
            <Link to={`/${category.toLowerCase()}`} className='title'>
                <h2>{title} - HOT DEAL</h2>
            </Link>
          </div>
          <div className="product-list">
            <div className="product-list-swiper">
              <div className="swiper-container">
                <div 
                  ref={elementRef}
                  className="swiper-wrapper"
                  style={{ 
                    transform: `translateX(${offset}px)`,
                    transitionDuration: '100ms'
                  }}
                >
                  {data_product.map((item, index) => {
                    return (
                      <div key={index} className="swiper-slide">
                        <Item 
                            key={index} 
                            id={item._id}
                            name={item.name} 
                            image={item.variants[0].image}
                            price={item.price} 
                            sale={item.variants[0].sale} 
                            rating={item.rating}
                        />
                      </div>
                    )
                  })}
                </div>
                <div 
                  onClick={() => setIndex(prev => prev + 1)} 
                  className="swiper-button-prev"
                  style={ (index === 0) ? {display: 'none'} : {} }
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </div>
                <div 
                  onClick={() => setIndex(prev => prev - 1)} 
                  className="swiper-button-next"
                  style={ (index <= -maxIndex) ? {display: 'none'} : {} }
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </>
  )
}

export default Popular;