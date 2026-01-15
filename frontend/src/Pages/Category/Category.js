import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Select, InputNumber, Checkbox } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import Item from "../../Components/Item/Item";
import Breadcrumbs from "../../Components/BreadCrumbs/BreadCrumbs";
import apiService from "../../Api/Api";

function Category({ category }) {
  const { brandName } = useParams();

  /* ================= STATE ================= */
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 8;
  const [total, setTotal] = useState(0);

  /* FILTER */
  const [brand, setBrand] = useState(brandName || "");
  const [minPrice, setMinPrice] = useState();
  const [maxPrice, setMaxPrice] = useState();
  const [hot, setHot] = useState(false);
  const [sort, setSort] = useState("newest");
  const [minRating, setMinRating] = useState();

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await apiService.getProducts({
        category,
        page,
        limit,
        brand,
        minPrice,
        maxPrice,
        hot,
        sort,
        minRating,
      });

      setProducts(res.data.products || []);
      setTotal(res.data.pagination?.total || 0);
    };

    fetchProducts();
  }, [
    category,
    page,
    brand,
    minPrice,
    maxPrice,
    hot,
    sort,
    minRating,
  ]);

  /* ================= PAGINATION LOGIC ================= */
  const totalPages = Math.ceil(total / limit);
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  /* BRAND OPTIONS (tạm từ page data) */
  const brandOptions = useMemo(
    () =>
      Array.from(
        new Set(products.map((p) => p.brand?.name).filter(Boolean))
      ).map((b) => ({ label: b, value: b })),
    [products]
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Breadcrumbs category={category} brand={brandName} />

      {/* ===== FILTER PANEL ===== */}
      <div className="bg-white border rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            placeholder="Thương hiệu"
            allowClear
            value={brand || undefined}
            onChange={(v) => {
              setBrand(v || "");
              setPage(1);
            }}
            options={brandOptions}
          />

          <InputNumber
            placeholder="Giá từ"
            min={0}
            className="w-full"
            onChange={(v) => {
              setMinPrice(v);
              setPage(1);
            }}
          />

          <InputNumber
            placeholder="Giá đến"
            min={0}
            className="w-full"
            onChange={(v) => {
              setMaxPrice(v);
              setPage(1);
            }}
          />

          <Checkbox
            checked={hot}
            onChange={(e) => {
              setHot(e.target.checked);
              setPage(1);
            }}
          >
            🔥 Khuyến mãi HOT
          </Checkbox>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm text-gray-600">Sắp xếp:</span>

          {[
            { label: "Mới nhất", value: "newest" },
            { label: "Giá ↑", value: "price_asc" },
            { label: "Giá ↓", value: "price_desc" },
            { label: "Đánh giá cao", value: "rating" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                if (opt.value === "rating") {
                  setSort("rating_desc");
                  setMinRating(4);
                } else {
                  setSort(opt.value);
                  setMinRating(undefined);
                }
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full border text-sm
                ${
                  sort === "rating_desc" && opt.value === "rating"
                    ? "bg-blue-600 text-white border-blue-600"
                    : sort === opt.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:border-blue-400"
                }`}
            >
              {opt.label}
            </button>
          ))}

          <Select
            placeholder="Đánh giá"
            allowClear
            style={{ width: 160 }}
            onChange={(v) => {
              setMinRating(v);
              setPage(1);
            }}
            options={[
              { label: "⭐ 4+", value: 4 },
              { label: "⭐ 3+", value: 3 },
            ]}
          />
        </div>
      </div>

      {/* ===== COUNTER ===== */}
      {total > 0 && (
        <div className="text-sm text-gray-500">
          Hiển thị {from}–{to} / {total} sản phẩm
        </div>
      )}

      {/* ===== SLIDE PRODUCTS ===== */}
      {products.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          Không có sản phẩm phù hợp
        </div>
      ) : (
        <div className="relative overflow-hidden">
          {/* PRODUCT GRID */}
          <div
            key={page}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-300"
          >
            {products.map((p) => (
              <Item key={p._id} {...p} />
            ))}
          </div>

          {/* PREV */}
          {page > 1 && (
            <button
              onClick={() => setPage((p) => p - 1)}
              className="absolute left-0 top-1/2 -translate-y-1/2
                         bg-white p-2 shadow rounded-full z-10"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          )}

          {/* NEXT */}
          {page < totalPages && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="absolute right-0 top-1/2 -translate-y-1/2
                         bg-white p-2 shadow rounded-full z-10"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Category;