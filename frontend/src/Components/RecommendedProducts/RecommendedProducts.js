import React, { useEffect, useRef, useState } from 'react';
import Item from '../Item/Item';
import './RecommendedProducts.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import apiService from '../../Api/Api';

function RecommendedProducts({ category, productId }) {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [width, setWidth] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const elementRef = useRef(null);

  // Fetch product details and related products when the component mounts
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const productData = (await apiService.getProductById(productId)).data;
        setProduct(productData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setLoading(false);
      }
    };

    const fetchRelatedProducts = async () => {
      try {
        
        const products = (await apiService.getRelatedProducts(productId)).data;
       
        setRelatedProducts(products);
      } catch (error) {
        console.error("Error fetching related products:", error);
      }
    };

    fetchProductDetails();
    fetchRelatedProducts();
  }, [productId]);

  // Update the width of the container and offset when the window resizes
  useEffect(() => {
    const handleResize = () => {
      const element = elementRef.current;
      let containerWidth;

      if (element) {
        containerWidth = element.offsetWidth;
        setWidth(containerWidth);

        if (window.innerWidth > 1200) {
          setOffset(index * 234.8);
          setMaxIndex(Math.max(relatedProducts.length - 5, 0));
        } else if (window.innerWidth > 990) {
          setOffset(index * (containerWidth / 4 + 2.5));
          setMaxIndex(Math.max(relatedProducts.length - 4, 0));
        } else if (window.innerWidth > 717) {
          setOffset(index * (containerWidth / 3 + 3.33333));
          setMaxIndex(Math.max(relatedProducts.length - 3, 0));
        } else {
          setOffset(index * (containerWidth / 2 + 5));
          setMaxIndex(Math.max(relatedProducts.length - 2, 0));
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [index, relatedProducts.length]);

  // Ensure the index stays within bounds
  useEffect(() => {
    if (index < -maxIndex) {
      setIndex(-maxIndex);
    }
  }, [maxIndex, index]);

  // Loading state handling
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className='related-products'>
      {relatedProducts.length > 0 && (
        <>
          <div className="product-list-title">
            <h2>SẢN PHẨM TƯƠNG TỰ</h2>
          </div>
          <div className="product-list">
            <div className="product-list-swiper">
              <div className="swiper-container">
                <div
                  ref={elementRef}
                  className="swiper-wrapper"
                  style={{
                    transform: `translateX(${offset}px)`,
                    transitionDuration: '300ms',
                  }}
                >
                  {relatedProducts.map((product, index) => (
                    <div key={index} className="swiper-slide">
                      <Item
                        id={product._id}
                        name={product.name}
                        image={product.variants[0]?.image}
                        sale={product.variants[0]?.sale}
                        price={product.price}
                        rating={product.rating}
                      />
                    </div>
                  ))}
                </div>
                <div
                  onClick={() => setIndex((prev) => prev + 1)}
                  className="swiper-button-prev"
                  style={index === 0 ? { display: 'none' } : {}}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </div>
                <div
                  onClick={() => setIndex((prev) => prev - 1)}
                  className="swiper-button-next"
                  style={index <= -maxIndex ? { display: 'none' } : {}}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default RecommendedProducts;