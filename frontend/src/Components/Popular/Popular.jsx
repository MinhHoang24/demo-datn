import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Item from "../Item/Item";
import apiService from "../../Api/Api";
import { CATEGORY_ROUTES, CATEGORY_TITLES } from "../../Constants/Category.ts";

export default function Popular({ category }) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);

  const [slidesPerView, setSlidesPerView] = useState(5);
  const wrapperRef = useRef(null);

  /* ================= FETCH (BE PAGINATION) ================= */
  useEffect(() => {
    const fetchData = async () => {
      const res = await apiService.getProducts({
        category,
        page,
        limit,
      });

      setProducts(res.data.products || []);
      setTotal(res.data.pagination?.total || 0);
    };

    fetchData();
  }, [category, page, limit]);

  /* ================= RESPONSIVE ================= */
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

  /* ================= PAGINATION LOGIC ================= */
  const totalPages = Math.ceil(total / limit);

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  /* ================= RENDER ================= */
  return (
    products.length > 0 && (
      <section className="mx-12 mb-12">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-2">
          <Link
            to={CATEGORY_ROUTES[category] || "/"}
            className="text-xl font-bold text-gray-800"
          >
            {CATEGORY_TITLES[category]} – HOT DEAL
          </Link>

          {/* COUNTER */}
          <span className="text-sm text-gray-500">
            Hiển thị {from}–{to} / {total} sản phẩm
          </span>
        </div>

        {/* SLIDER */}
        <div className="relative overflow-hidden">
          <div ref={wrapperRef} className="flex transition-transform duration-300">
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

          {/* PREV */}
          {page > 1 && (
            <button
              onClick={() => setPage((p) => p - 1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 shadow rounded-full"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          )}

          {/* NEXT */}
          {page < totalPages && (
            <button
              onClick={() => setPage((p) => p + 1)}
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