import { Link } from "react-router-dom";
import ProductRating from "../ProductRating/ProductRating";

export default function Item({
  id,
  name,
  image,
  price,
  sale = 0,
  rating,
}) {
  const formatPrice = (p) =>
    p
      .toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      })
      .replace(/\s/g, "");

  const finalPrice = sale > 0 ? price * (1 - sale / 100) : price;

  return (
    <div className="w-full h-full">
      <Link
        to={`/product/${id}`}
        className="
          block
          h-full
          bg-white
          rounded-xl
          border
          hover:border-blue-500
          hover:shadow-lg
          transition
          p-4
        "
      >
        {/* IMAGE */}
        <div className="relative w-full h-[200px] flex items-center justify-center mb-3">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain"
          />

          {sale > 0 && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              -{sale}%
            </span>
          )}
        </div>

        {/* NAME */}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px]">
          {name}
        </h3>

        {/* PRICE */}
        <div className="mt-2 flex items-end gap-2">
          <span className="text-blue-600 font-bold text-base">
            {formatPrice(finalPrice)}
          </span>

          {sale > 0 && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(price)}
            </span>
          )}
        </div>

        {/* PROMOTION */}
        <div className="mt-2 bg-blue-50 border border-blue-100 rounded px-2 py-1">
          <p className="text-xs text-blue-700 line-clamp-2">
            Hỗ trợ thanh toán online nhanh chóng - thuận tiện
          </p>
        </div>

        {/* RATING */}
        <div className="mt-3">
          <ProductRating rating={rating} />
        </div>
      </Link>
    </div>
  );
}