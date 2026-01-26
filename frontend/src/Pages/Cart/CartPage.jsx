import { useContext, useEffect, useMemo, useState } from "react";
import apiService from "../../Api/Api";
import Loader from "../../Components/Loader/Loader";
import ConfirmModal from "../../Components/ConfirmModal/ConfirmModal";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../Contexts/CartCountContext";

const getVariantImage = (product, color) => {
  if (!product) return null;

  const defaultImg = product.image || null;
  if (!color) return defaultImg;

  const c = String(color).trim().toLowerCase();
  const v = (product.variants || []).find(
    (x) => String(x.color || "").trim().toLowerCase() === c
  );

  return v?.image || defaultImg;
};

const formatPrice = (p) =>
  Number(p || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

export default function CartPage() {
  const navigate = useNavigate();
  const { fetchCartCount } = useContext(CartContext);
  const [unauthorized, setUnauthorized] = useState(false);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState("");

  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Xác nhận",
    loading: false,
    onConfirm: null,
  });

  const openConfirm = ({ title, message, confirmText = "Xác nhận", onConfirm }) =>
    setConfirmState({
      open: true,
      title,
      message,
      confirmText,
      loading: false,
      onConfirm,
    });

  const closeConfirm = () =>
    setConfirmState((p) => ({ ...p, open: false, loading: false, onConfirm: null }));

  const setConfirmLoading = (val) =>
    setConfirmState((p) => ({ ...p, loading: val }));

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");
      setUnauthorized(false);
      const res = await apiService.getCart();
      setCart(res.data?.cart || { items: [] });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setUnauthorized(true);
        return;
      }
      setError(err?.response?.data?.message || "Không tải được giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const items = useMemo(() => cart?.items || [], [cart]);
  const allSelected = items.length > 0 && items.every((it) => it.isSelected);

  const summary = useMemo(() => {
    let totalQty = 0;
    let totalPrice = 0;

    items.forEach((it) => {
      if (!it.isSelected) return;
      const qty = Number(it.quantity || 0);
      const price = Number(it.productId?.price || 0);
      totalQty += qty;
      totalPrice += qty * price;
    });

    return { totalQty, totalPrice };
  }, [items]);

  const selectAll = async (isSelected) => {
    try {
      setBusyKey("select-all");
      const res = await apiService.selectAllCartItems(isSelected);
      setCart(res.data?.cart);
    } catch (err) {
      alert(err?.response?.data?.message || "Chọn tất cả thất bại");
    } finally {
      setBusyKey("");
    }
  };

  const toggleSelected = async (itemId, isSelected) => {
    try {
      setBusyKey(`sel-${itemId}`);
      const res = await apiService.toggleCartItemSelected(itemId, isSelected);
      setCart(res.data?.cart);
    } catch (err) {
      alert(err?.response?.data?.message || "Cập nhật chọn sản phẩm thất bại");
    } finally {
      setBusyKey("");
    }
  };

  const updateQty = async (itemId, nextQty) => {
    if (nextQty < 1) return;
    try {
      setBusyKey(`qty-${itemId}`);
      const res = await apiService.updateCartItemQuantity(itemId, nextQty);
      setCart(res.data?.cart);
    } catch (err) {
      alert(err?.response?.data?.message || "Cập nhật số lượng thất bại");
    } finally {
      setBusyKey("");
    }
  };

  const removeItem = (itemId) =>
    openConfirm({
      title: "Xóa sản phẩm",
      message: "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?",
      confirmText: "Xóa",
      onConfirm: async () => {
        try {
          setConfirmLoading(true);
          setBusyKey(`rm-${itemId}`);
          const res = await apiService.removeCartItem(itemId);
          setCart(res.data?.cart);
          await fetchCartCount();
          closeConfirm();
        } catch (err) {
          alert(err?.response?.data?.message || "Xóa thất bại");
          setConfirmLoading(false);
        } finally {
          setBusyKey("");
        }
      },
    });

  const clearCart = () =>
    openConfirm({
      title: "Xóa toàn bộ giỏ hàng",
      message: "Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?",
      confirmText: "Xóa hết",
      onConfirm: async () => {
        try {
          setConfirmLoading(true);
          setBusyKey("clear");
          const res = await apiService.clearCart();
          setCart(res.data?.cart);
          await fetchCartCount();
          closeConfirm();
        } catch (err) {
          alert(err?.response?.data?.message || "Clear thất bại");
          setConfirmLoading(false);
        } finally {
          setBusyKey("");
        }
      },
    });

  // =========================
  // RENDER STATES
  // =========================
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto min-h-[60vh] flex items-center justify-center">
        <Loader size={48} />
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Bạn chưa đăng nhập</h2>
          <p className="text-gray-600 mt-2">
            Vui lòng đăng nhập để xem và quản lý giỏ hàng của bạn.
          </p>

          <div className="flex justify-center gap-3 mt-6">
            <a
              href="/login"
              className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              Đăng nhập
            </a>
            <a
              href="/"
              className="px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-50"
            >
              Về trang chủ
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {error}
        </div>
        <button
          onClick={fetchCart}
          className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================
  return (
    <div className="max-w-6xl mx-auto p-6">
      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        loading={confirmState.loading}
        onCancel={confirmState.loading ? undefined : closeConfirm}
        onConfirm={confirmState.onConfirm || closeConfirm}
      />

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Giỏ hàng</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length ? `${items.length} sản phẩm` : "Chưa có sản phẩm trong giỏ"}
          </p>
        </div>
      </div>

      {/* Empty */}
      {!items.length ? (
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <p className="text-gray-600">Giỏ hàng đang trống.</p>
          <a
            href="/"
            className="inline-block mt-4 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Tiếp tục mua sắm
          </a>
        </div>
      ) : (
        <>
          {/* CART LIST – KHÔNG SCROLL RIÊNG */}
          <div className="mt-6 bg-white border border-gray-200 rounded-2xl">
            {/* Top bar */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => selectAll(e.target.checked)}
                  disabled={busyKey === "select-all"}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-800">
                  Chọn tất cả
                </span>
              </label>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  Đã chọn{" "}
                  <span className="font-semibold text-gray-900">
                    {summary.totalQty}
                  </span>
                </span>

                <button
                  onClick={clearCart}
                  disabled={busyKey === "clear"}
                  className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:scale-105 hover:bg-red-50 disabled:opacity-60"
                >
                  Xóa hết
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="p-4 space-y-3">
              {items.map((it) => {
                const product = it.productId || {};
                const image = getVariantImage(product, it.color);
                const itemId = it._id;

                const isBusy =
                  busyKey === `qty-${itemId}` ||
                  busyKey === `sel-${itemId}` ||
                  busyKey === `rm-${itemId}`;

                const unitPrice = Number(product.price || 0);
                const totalItemPrice = unitPrice * Number(it.quantity || 0);

                return (
                  <div
                    key={itemId}
                    className="border border-gray-200 rounded-2xl p-4 hover:bg-blue-50 cursor-pointer"
                  >
                    <div className="flex gap-4">
                      {/* Checkbox */}
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={!!it.isSelected}
                          disabled={isBusy}
                          onChange={(e) =>
                            toggleSelected(itemId, e.target.checked)
                          }
                          className="w-4 h-4"
                        />
                      </div>

                      {/* Image */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                        {image ? (
                          <img
                            src={image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-400 flex items-center justify-center h-full">
                            No image
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900 truncate">
                              <Link
                                to={`/product/${product._id}`}
                                className="hover:text-blue-600 hover:underline"
                              >
                                {product.name}
                              </Link>
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {it.color ? `Màu: ${it.color}` : "Không có màu"}
                            </p>
                          </div>

                          <button
                            onClick={() => removeItem(itemId)}
                            disabled={isBusy}
                            className="px-3 py-2 h-fit hover:scale-105 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60"
                          >
                            Xóa
                          </button>
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          {/* Qty */}
                          <div>
                            <div className="text-left">
                              <p className="text-xs text-gray-500">Số Lượng</p>
                            </div>
                            <div className="inline-flex items-center border border-gray-200 rounded-xl overflow-hidden">
                              <button
                                onClick={() =>
                                  updateQty(itemId, Number(it.quantity) - 1)
                                }
                                disabled={isBusy || Number(it.quantity) <= 1}
                                className="w-10 h-10 hover:bg-gray-50"
                              >
                                −
                              </button>
                              <div className="w-12 text-center font-semibold">
                                {it.quantity}
                              </div>
                              <button
                                onClick={() =>
                                  updateQty(itemId, Number(it.quantity) + 1)
                                }
                                disabled={isBusy}
                                className="w-10 h-10 hover:bg-gray-50"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Thành tiền</p>
                            <p className="font-bold text-blue-600">
                              {formatPrice(totalItemPrice)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spacer tránh bị footer che */}
          <div className="h-6" />

          {/* STICKY CHECKOUT FOOTER */}
          <div className="sticky bottom-0 z-20 bg-blue-500 border-t border-gray-200 rounded-2xl">
            <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-white">
                  Đã chọn <span className="font-semibold">{summary.totalQty}</span> sản phẩm
                </p>
                <p className="text-lg font-bold text-white">
                  {formatPrice(summary.totalPrice)}
                </p>
              </div>

              <button
                disabled={summary.totalQty === 0}
                onClick={() =>
                  navigate("/checkout", {
                    state: {
                      items: items.filter((it) => it.isSelected),
                      from: "cart",
                    },
                  })
                }
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white text-blue-600 font-semibold hover:scale-105 hover:opacity-80 disabled:cursor-not-allowed"
              >
                Thanh toán
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}