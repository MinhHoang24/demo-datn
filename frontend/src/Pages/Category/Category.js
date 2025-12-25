import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import Item from '../../Components/Item/Item.jsx';
import './Category.css'
import Breadcrumbs from '../../Components/BreadCrumbs/BreadCrumbs.js';
import apiService from '../../Api/Api.js';
import { Select } from 'antd';
 
 
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
        images[brand] = image || '/path/to/default-image.png';
      }
      setBrandImages(images);
    };
 
    fetchBrandImages();
  }, [brandList]);
 
 
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiService.getProducts();
        const products = response.data.formattedProducts || [];
        setProducts(products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
 
    fetchProducts();
  }, []);
 
 
 
  useEffect(() => {
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
  
  console.log('abc:', brandList);
 
  const handleSortClick = (sortType) => {
    setActiveFilter({ type: 'sort', value: sortType });
  };

  const SORT_OPTIONS = [
    { label: 'Giá Cao - Thấp', value: 'highToLow' },
    { label: 'Giá Thấp - Cao', value: 'lowToHigh' },
    { label: 'Khuyến mãi HOT', value: 'hotDeals' },
    { label: 'Đánh giá cao', value: 'highRating' },
  ];

  const PRICE_OPTIONS = [
    { label: 'Dưới 5 triệu', min: 1, max: 5_000_000 },
    { label: '5 - 10 triệu', min: 5_000_000, max: 10_000_000 },
    { label: '10 - 20 triệu', min: 10_000_000, max: 20_000_000 },
    { label: '20 - 30 triệu', min: 20_000_000, max: 30_000_000 },
    { label: 'Trên 30 triệu', min: 30_000_000, max: 1_000_000_000 },
  ];
 
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <Breadcrumbs category={category} brand={brandName} />

      {/* BRAND FILTER */}
      <div className="flex flex-wrap items-center gap-4">
        <span className="font-semibold">Thương hiệu:</span>
        <Select
          style={{ width: 260 }}
          placeholder="Chọn thương hiệu"
          allowClear
          value={productBrand || undefined}
          onChange={(value) => setProductBrand(value || "")}
          options={brandList.map((b) => ({ label: b, value: b }))}
        />
      </div>

      {/* SORT */}
      <div className="flex flex-wrap gap-3">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSortClick(opt.value)}
            className={`px-4 py-2 rounded border text-sm ${
              activeFilter?.value === opt.value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white hover:border-blue-500"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* PRICE FILTER */}
      <div className="flex flex-wrap gap-3">
        {PRICE_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => filterByPriceRange(opt.min, opt.max)}
            className={`px-4 py-2 rounded border text-sm ${
              activeFilter?.min === opt.min
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white hover:border-blue-500"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts
          .slice(0, maxIndex)
          .map((product) => (
            <Item
              key={product._id}
              id={product._id}
              name={product.name}
              image={product.variants[0]?.image}
              price={product.price}
              sale={product.sale}
              rating={product.rating}
            />
          ))}
      </div>

      {/* LOAD MORE */}
      {maxIndex < filteredProducts.length && (
        <div className="text-center">
          <button
            onClick={() => setMaxIndex((p) => p + 12)}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Xem thêm {filteredProducts.length - maxIndex} sản phẩm
          </button>
        </div>
      )}
    </div>
  );

}
 
export default Category;