import React from "react";
import { Link } from "react-router-dom";

function ItemSearch(props) {
  const formatPrice = (price) => {
    let priceString = price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
    return priceString.replace(/\s/g, "");
  };

  const sale = props.sale || 0;
  const discountPrice = props.price * (1 - sale / 100);

  return (
    <div
      className="
        group relative mb-[2px]
        h-[100px] w-[330px] max-xl:w-[280px]
        bg-white px-3 py-2
        border-b border-gray-100
        hover:bg-gray-50
        transition-colors
      "
    >
      <Link
        to={`/Product/${props.id}`}
        className="flex h-full items-center gap-3 text-gray-800"
      >
        {/* IMAGE (GIỮ NGUYÊN SIZE) */}
        <div
          className="
            flex h-[40px] w-[40px]
            items-center justify-center
            rounded-md bg-gray-100
            shrink-0
          "
        >
          <img
            src={props.image}
            alt={props.name}
            className="h-[40px] w-[40px] object-contain"
          />
        </div>

        {/* INFO */}
        <div className="flex flex-1 flex-col justify-between py-1">
          {/* NAME */}
          <p
            className="
              text-[13px] font-medium leading-snug
              text-gray-900
              line-clamp-2
            "
          >
            {props.name}
          </p>

          {/* PRICE */}
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-red-600">
              {formatPrice(discountPrice)}
            </span>

            {sale > 0 && (
              <span className="text-[12px] text-gray-400 line-through">
                {formatPrice(props.price)}
              </span>
            )}

            {sale > 0 && (
              <span
                className="
                  ml-auto rounded-sm
                  bg-red-50 px-1.5 py-[1px]
                  text-[11px] font-medium
                  text-red-600
                "
              >
                -{sale}%
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default ItemSearch;
