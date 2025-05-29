import React, { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import Item from '../../Components/Item/Item.jsx';
import './Category.css'
import Breadcrumbs from '../../Components/BreadCrumbs/BreadCrumbs.js';
import decreaseFilt from '../../Assets/arrow-down.svg';
import increaseFilt from '../../Assets/arrow-up.svg'
import saleFilt from '../../Assets/percentage.svg'
import money from '../../Assets/money.svg'
import rating from '../../Assets/rating.svg'
import apiService from '../../Api/Api.js';
 
 
function Category(props) {
  const [maxIndex, setMaxIndex] = useState(15);
  const { brandName } = useParams();
  const [brandList, setBrandList] = useState([]);
  const [productBrand, setProductBrand] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [products, setProducts] = useState([]);
  const { category } = props;
  const [priceRangeFilter, setPriceRangeFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [brandImages, setBrandImages] = useState({});
 
  useEffect(() => {
    const fetchBrandImages = async () => {
      const images = {};
      for (const brand of brandList) {
        const image = await getBrandImage(brand);
        images[brand] = image || '/path/to/default-image.png'; // Đặt hình mặc định nếu không có
      }
      setBrandImages(images);
    };
 
    fetchBrandImages();
  }, [brandList]);
 
 
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiService.getProducts();
        const products = response.data.products || [];
        setProducts(products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
 
    fetchProducts();
  }, []);
 
 
 
  useEffect(() => {
    // reset lại filters khi đổi category
    setProductBrand('');
    setActiveFilter(null);
    setPriceRangeFilter('');
    setRatingFilter('');
    setFilteredProducts([]);
  }, [category, brandName]);
 
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [category]);
 
  async function getBrandImage(brandName) {
    try {
      const response = await apiService.getProducts();
      const product = response.data.products.find(product => product.brand.name.toLowerCase().trim() === brandName.toLowerCase().trim());
      if (product) {
        return product.brand.image;
      }
    } catch (error) {
      console.error('Error fetching brand image:', error);
      return null;
    }
  }
 
  const handlePriceRangeFilter = (range) => {
    setPriceRangeFilter(range);
  };
 
  const handleRatingFilter = (rating) => {
    setRatingFilter(rating);
  };
 
  const handleBrandFilter = (brand) => {
    setProductBrand(brand);
  };
 
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };
 
  const filterByPriceRange = (minPrice, maxPrice) => {
    setActiveFilter({ type: 'price', min: minPrice, max: maxPrice });
  };
  
 
 
  useEffect(() => {
    let filteredByCategory = products.filter(
      (product) => product.category.toLowerCase().trim() === category.toLowerCase().trim()
    );
  
    // Lọc theo brand nếu có
    if (brandName) {
      filteredByCategory = filteredByCategory.filter(
        (item) => item.brand.name.toLowerCase() === brandName.toLowerCase()
      );
      setProductBrand(brandName); // Cập nhật brand hiện tại
    }
  
    setFilteredProducts(filteredByCategory);
  
    // Cập nhật danh sách brand
    const brands = Array.from(
      new Set(
        filteredByCategory.map((product) => product.brand.name.toLowerCase())
      )
    ).map((brand) => brand.charAt(0).toUpperCase() + brand.slice(1));
    setBrandList(brands);
  }, [products, category, brandName]);
  

  useEffect(() => {
    // Bước 1: Lọc sản phẩm theo danh mục
    let filteredProducts = products.filter(
      (product) => product.category.toLowerCase().trim() === category.toLowerCase().trim()
    );
  
    // Bước 2: Lọc sản phẩm theo thương hiệu nếu có
    if (productBrand) {
      filteredProducts = filteredProducts.filter(
        (product) => product.brand.name.toLowerCase() === productBrand.toLowerCase()
      );
    }
  
    // Bước 3: Lọc sản phẩm theo phạm vi giá nếu có
    if (activeFilter && activeFilter.type === 'price' && activeFilter.min !== undefined && activeFilter.max !== undefined) {
      filteredProducts = filteredProducts.filter((product) => {
        const discountedPrice = product.price * (1 - product.sale / 100);
        return discountedPrice >= activeFilter.min && discountedPrice <= activeFilter.max;
      });
    }
  
    // Bước 4: Áp dụng sắp xếp theo tiêu chí đã chọn
    if (activeFilter && activeFilter.type === 'sort') {
      switch (activeFilter.value) {
        case 'highToLow':
          filteredProducts.sort((a, b) => b.price * (1 - b.sale / 100) - a.price * (1 - a.sale / 100));
          break;
        case 'lowToHigh':
          filteredProducts.sort((a, b) => a.price * (1 - a.sale / 100) - b.price * (1 - b.sale / 100));
          break;
        case 'hotDeals':
          filteredProducts.sort((a, b) => b.sale - a.sale);
          break;
        case 'highRating':
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        default:
          break;
      }
    }
  
    // Cập nhật danh sách sản phẩm đã lọc vào state
    setFilteredProducts(filteredProducts);
  }, [products, productBrand, category, activeFilter]);
  
  
 
  const handleSortClick = (sortType) => {
    setActiveFilter({ type: 'sort', value: sortType });
  };
 
  return (
    <div className='category-container'>
      <Breadcrumbs category={props.category} brand={brandName} />
      <div className="clear"></div>
      <div className="block-filter-brand">
        <div className="filter-brands-title">Chọn theo thương hiệu</div>
        <div className="list-brand">
          {brandList.map((brand, index) => (
            <Link
              key={index}
              to={`/${props.category.toLowerCase()}/${brand.toLowerCase()}`}
              className={`list-brand-item ${brand.toLowerCase() === productBrand.toLowerCase() ? 'active' : ''}`}
              onClick={() => handleBrandFilter(brand)}
            >
              <div
                className={`brand-img-container ${brand.toLowerCase() === productBrand.toLowerCase() ? 'active-brand-container' : ''
                  }`}
              >
                <img
                  src={brandImages[brand] || '/path/to/default-image.png'}
                  alt={brand}
                  className="brand-img"
                />
              </div>
            </Link>
          ))}
        </div>
 
      </div>
      <div className="block-filter-sort">
        <div className="filter-sort__title">Sắp xếp theo</div>
        <div className="filter-sort__list-filter">
          <a
            className={`btn-filter button__sort ${activeFilter && activeFilter.value === 'highToLow' ? 'active' : ''}`}
            onClick={() => handleSortClick('highToLow')}
          >
            Giá Cao - Thấp
          </a>
          <a
            className={`btn-filter button__sort ${activeFilter && activeFilter.value === 'lowToHigh' ? 'active' : ''}`}
            onClick={() => handleSortClick('lowToHigh')}
          >
            Giá Thấp - Cao
          </a>
          <a
            className={`btn-filter button__sort ${activeFilter && activeFilter.value === 'hotDeals' ? 'active' : ''}`}
            onClick={() => handleSortClick('hotDeals')}
          >
 
            Khuyến mãi HOT
          </a>
          <a
            className={`btn-filter button__sort ${activeFilter && activeFilter.value === 'highRating' ? 'active' : ''}`}
            onClick={() => handleSortClick('highRating')}
          >
            Đánh giá cao
          </a>
        </div>
      </div>
      <div className="block-filter-sort">
        <div className="criteria-sort__title">Chọn theo tiêu chí</div>
        <div className="criteria-sort__list-filter">
          <a
            className={`btn-filter button__sort ${activeFilter && activeFilter.min === 1 && activeFilter.max === 5000000 ? 'active' : ''}`}
            onClick={() => filterByPriceRange(1, 5000000)}
          >
            Dưới 5 triệu
          </a>
          <a
            className={`btn-filter button__sort ${activeFilter && activeFilter.min === 5000000 && activeFilter.max === 10000000 ? 'active' : ''}`}
            onClick={() => filterByPriceRange(5000000, 10000000)}
          >
            5 - 10 triệu
          </a>
          <a
            className={`btn-filter button__sort ${activeFilter && activeFilter.min === 10000000 && activeFilter.max === 20000000 ? 'active' : ''}`}
            onClick={() => filterByPriceRange(10000000, 20000000)}
          >
 
            10 - 20 triệu
          </a>
          <a
            className={`btn-filter button__sort ${activeFilter && activeFilter.min === 20000000 && activeFilter.max === 30000000 ? 'active' : ''}`}
            onClick={() => filterByPriceRange(20000000, 30000000)}
          >
 
            20 - 30 triệu
          </a>
          <a
            className={`btn-filter button__sort ${activeFilter && activeFilter.min === 30000000 && activeFilter.max === 1000000000 ? 'active' : ''}`}
            onClick={() => filterByPriceRange(30000000, 1000000000)}
          >
            Trên 30 triệu
          </a>
 
        </div>
      </div>
 
 
      <div className="block-filter-indexSort">
        <div className="filter-indexSort-title">
          <p>
            {
              filteredProducts.length > 0 ? (
                <span>
                  Hiển thị 1-{(maxIndex < filteredProducts.length) ? maxIndex : filteredProducts.length} trên tổng số {filteredProducts.length} sản phẩm
                </span>
              ) : (
                <span>Không có sản phẩm nào phù hợp với lựa chọn của bạn</span>
              )
            }
          </p>
 
        </div>
        <div className="block-products-filter">
          {filteredProducts.slice(0, Math.min(maxIndex, filteredProducts.length)).map((product, index) => {
            return (
              <Item
                key={index}
                id={product._id}
                name={product.name}
                image={product.variants[0].image}
                sale={product.variants[0].sale}
                price={product.price}
                rating={product.rating}
              />
            )
          })}
        </div>
        {(maxIndex < filteredProducts.length) &&
          <div onClick={() => setMaxIndex(prev => prev + 10)} className="category-loadmore">
            Xem thêm {filteredProducts.length - maxIndex} sản phẩm
          </div>
        }
      </div>
    </div>
  )
}
 
export default Category;