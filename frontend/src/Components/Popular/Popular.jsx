import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Item from "../Item/Item";
import apiService from "../../Api/Api";
import { CATEGORY_ROUTES, CATEGORY_TITLES } from "../../Constants/Category.ts";

export default function Popular({ category }) {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(5);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await apiService.getProducts();
      const filtered = res.data.formattedProducts.filter(
        (p) =>
          p.category.toLowerCase().trim() ===
          category.toLowerCase().trim()
      );
      setProducts(filtered);
      setCurrentIndex(0);
    };
    fetchData();
  }, [category]);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 720) setSlidesPerView(2);
      else if (window.innerWidth < 990) setSlidesPerView(3);
      else if (window.innerWidth < 1200) setSlidesPerView(4);
      else setSlidesPerView(5);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(products.length - slidesPerView, 0);

  return (
    products.length > 0 && (
      <section className="mx-12 mb-12">
        <div className="flex items-center justify-between mb-4">
          <Link
            to={CATEGORY_ROUTES[category] || "/"}
            className="text-xl font-bold text-gray-800"
          >
            {CATEGORY_TITLES[category]} – HOT DEAL
          </Link>
        </div>

        <div className="relative overflow-hidden">
          <div
            ref={wrapperRef}
            className="flex transition-transform duration-300"
            style={{
              transform: `translateX(-${
                (100 / slidesPerView) * currentIndex
              }%)`,
            }}
          >
            {products.map((item) => (
              <div
                key={item._id}
                className="flex-shrink-0 px-2"
                style={{ width: `${100 / slidesPerView}%` }}
              >
                <Item
                  id={item._id}
                  name={item.name}
                  image={item.variants[0]?.image}
                  price={item.price}
                  sale={item.sale}
                  rating={item.rating}
                />
              </div>
            ))}
          </div>

          {currentIndex > 0 && (
            <button
              onClick={() => setCurrentIndex((i) => i - 1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 shadow rounded-full"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          )}

          {currentIndex < maxIndex && (
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 shadow rounded-full"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          )}
        </div>
      </section>
    )
  );
}