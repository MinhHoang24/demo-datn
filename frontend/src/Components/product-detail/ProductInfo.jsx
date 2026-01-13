import { useState, useEffect } from "react";
import ProductRating from "../ProductRating/ProductRating";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartArrowDown } from "@fortawesome/free-solid-svg-icons";
import Toast from "../Toast/Toast";
import apiService from "../../Api/Api";
import { useNavigate } from "react-router-dom";

export default function ProductInfo({ product, selectedVariantIndex, onChangeVariant }) {
  const navigate = useNavigate();
  const variant = product.variants[selectedVariantIndex];
  const [quantity, setQuantity] = useState(1);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // ✅ thêm type

  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariantIndex]);

  const formatPrice = (p) =>
    p.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const hasSale = Number(variant.sale) > 0;
  const originalPrice = product.price;
  const finalPrice = hasSale
    ? product.price * (1 - Number(variant.sale) / 100)
    : product.price;

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);

      await apiService.addToCart({
        productId: product._id || product.id,
        color: variant.color,
        quantity,
      });

      setToastType("success");
      setToastMessage("✅ Đã thêm vào giỏ hàng!");
    } catch (err) {
      const status = err?.response?.status;

      // ✅ Chưa đăng nhập
      if (status === 401) {
        setToastType("error");
        setToastMessage("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
        return;
      }

      // ✅ Lỗi khác
      setToastType("error");
      setToastMessage("❌ Thêm vào giỏ hàng thất bại! Vui lòng thử lại.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          duration={2500}
          onClose={() => setToastMessage("")}
        />
      )}

      <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

      <div className="flex items-center gap-2">
        <ProductRating rating={product.rating} />
        <span className="text-gray-500">({product.totalRatings} đánh giá)</span>
      </div>

      <div className="flex items-end gap-3">
        <span className="text-3xl font-bold text-blue-600">{formatPrice(finalPrice)}</span>

        {hasSale && (
          <>
            <span className="text-lg line-through text-gray-400">
              {formatPrice(originalPrice)}
            </span>
            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm font-medium">
              -{variant.sale}%
            </span>
          </>
        )}
      </div>

      <div>
        <p className="font-semibold mb-2">Chọn màu</p>
        <div className="grid grid-cols-2 gap-3">
          {product.variants.map((v, i) => {
            const vHasSale = Number(v.sale) > 0;
            const vFinalPrice = vHasSale
              ? product.price * (1 - Number(v.sale) / 100)
              : product.price;

            return (
              <div
                key={i}
                onClick={() => onChangeVariant(i)}
                className={`relative p-3 border rounded cursor-pointer transition ${
                  i === selectedVariantIndex
                    ? "border-blue-500 bg-blue-50"
                    : "hover:border-gray-400"
                }`}
              >
                {vHasSale && (
                  <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                    -{v.sale}%
                  </span>
                )}

                <p className="font-medium">{v.color}</p>
                <p className="text-sm text-gray-600">{formatPrice(vFinalPrice)}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="font-medium">Số lượng</span>

        <div className="flex items-center border rounded">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
          >
            −
          </button>

          <span className="w-12 text-center">{quantity}</span>

          <button
            onClick={() => setQuantity((q) => Math.min(q + 1, variant.quantity))}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
          >
            +
          </button>
        </div>

        <span className="text-sm text-gray-500">{variant.quantity} sản phẩm có sẵn</span>
      </div>

      <div className="flex gap-4 pt-2">
        <button
          onClick={() =>
            navigate("/checkout", {
              state: {
                items: [
                  {
                    product,
                    color: variant.color,
                    quantity,
                    price: finalPrice,
                  },
                ],
                from: "buy-now",
              },
            })
          }
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          MUA NGAY
        </button>

        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`flex items-center gap-2 border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition ${
            isAdding ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          <FontAwesomeIcon icon={faCartArrowDown} />
          {isAdding ? "Đang thêm..." : "Thêm vào giỏ hàng"}
        </button>
      </div>
    </div>
  );
}