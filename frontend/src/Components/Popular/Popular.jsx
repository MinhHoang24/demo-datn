import { useEffect, useRef, useState } from 'react'
import './Popular.css'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Item from '../Item/Item.jsx'
import apiService from '../../Api/Api.js';
import { CATEGORY_ROUTES, CATEGORY_TITLES } from '../../Constants/Category.ts';

function Popular({ category }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [width, setWidth] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const [title, setTitle] = useState("");
  const [dataProduct, setDataProduct] = useState([]);
  const [slidesPerView, setSlidesPerView] = useState(5);

  const elementRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getProducts();
        const products = response.data.products;

        const filteredProducts = products.filter((product) =>
          product.category.toLowerCase().trim() === category.toLowerCase().trim()
        );

        setDataProduct(filteredProducts);
        setTitle(CATEGORY_TITLES[category] ?? '');
        setCurrentIndex(0);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchData();
  }, [category]);

  useEffect(() => {
    const updateLayout = () => {
      const element = elementRef.current;

      if (!element) return;

      const containerWidth = element.offsetWidth;
      setWidth(containerWidth);

      let perView = 5;

      if (window.innerWidth <= 717) perView = 2;
      else if (window.innerWidth <= 990) perView = 3;
      else if (window.innerWidth <= 1200) perView = 4;
      else perView = 5;

      setSlidesPerView(perView);
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);

    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  useEffect(() => {
    const total = dataProduct.length;
    if (!width || total === 0) {
      setOffset(0);
      setMaxIndex(0);
      return;
    }

    const maxIdx = Math.max(total - slidesPerView, 0);
    const clampedIndex = Math.min(Math.max(currentIndex, 0), maxIdx);

    if (clampedIndex !== currentIndex) {
      setCurrentIndex(clampedIndex);
      return;
    }

    const itemWidth = width / slidesPerView;
    setMaxIndex(maxIdx);
    setOffset(-clampedIndex * itemWidth);
  }, [currentIndex, width, slidesPerView, dataProduct.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const categoryRoute = CATEGORY_ROUTES[category] ?? '/';

  return (
    <>
      {dataProduct.length > 0 && (
        <div className="popular">
          <div className="product-list-title">
            <Link to={categoryRoute} className="title">
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
                    transitionDuration: '100ms',
                  }}
                >
                  {dataProduct.map((item) => (
                    <div key={item._id} className="swiper-slide">
                      <Item
                        id={item._id}
                        name={item.name}
                        image={item.variants[0]?.image}
                        price={item.price}
                        sale={item.variants[0]?.sale}
                        rating={item.rating}
                      />
                    </div>
                  ))}
                </div>

                <div
                  onClick={handlePrev}
                  className="swiper-button-prev"
                  style={currentIndex === 0 ? { display: 'none' } : {}}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </div>

                <div
                  onClick={handleNext}
                  className="swiper-button-next"
                  style={currentIndex >= maxIndex ? { display: 'none' } : {}}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Popular;