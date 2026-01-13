import React, { useEffect, useState } from "react";
import ProductRating from "../ProductRating/ProductRating";
import apiService from "../../Api/Api";

export default function ProductReviews({ product, onOpenPopup }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);

  const [canReview, setCanReview] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);

  const isLoggedIn = !!localStorage.getItem("authToken");

  // ================= FETCH COMMENTS =================
  useEffect(() => {
    if (!product?._id) return;

    apiService
      .getComments(product._id)
      .then((res) => setComments(res.data?.comments || []))
      .catch(() => setComments([]));
  }, [product]);

  // ================= CHECK REVIEW PERMISSION =================
  useEffect(() => {
    const checkReviewPermission = async () => {
      if (!isLoggedIn || !product?._id) {
        setCheckingPermission(false);
        return;
      }

      try {
        const res = await apiService.getMyOrders();
        const orders = res.data?.orders || [];

        const hasDeliveredOrder = orders.some(
          (order) =>
            order.status === "DELIVERED" &&
            order.items?.some(
              (item) => String(item.productId) === String(product._id)
            )
        );

        setCanReview(hasDeliveredOrder);
      } catch (err) {
        console.error("Check review permission failed:", err);
        setCanReview(false);
      } finally {
        // 🔥 BẮT BUỘC PHẢI CÓ
        setCheckingPermission(false);
      }
    };

    checkReviewPermission();
  }, [product, isLoggedIn]);

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!isLoggedIn) {
      onOpenPopup?.();
      return;
    }

    if (!canReview) return;

    if (content.trim().length < 15) {
      alert("Nội dung đánh giá tối thiểu 15 ký tự");
      return;
    }

    try {
      await apiService.addComment({
        productId: product._id,
        text: content,
        rating,
      });

      setContent("");
      setRating(5);

      const res = await apiService.getComments(product._id);
      setComments(res.data?.comments || []);
    } catch (err) {
      alert(err?.response?.data?.message || "Gửi đánh giá thất bại");
    }
  };

  return (
    <section id="reviews-section" className="space-y-6">
      <h2 className="text-lg font-semibold">Đánh giá & nhận xét</h2>

      {/* ================= REVIEW FORM / MESSAGE ================= */}
      {checkingPermission ? (
        <p className="text-sm text-gray-500">Đang kiểm tra quyền đánh giá...</p>
      ) : !isLoggedIn ? (
        <p className="text-sm text-gray-500">
          Vui lòng đăng nhập để đánh giá sản phẩm
        </p>
      ) : !canReview ? (
        <p className="text-sm text-gray-500">
          Bạn cần mua và nhận sản phẩm trước khi đánh giá
        </p>
      ) : (
        <div className="space-y-4">
          <textarea
            className="w-full border rounded-lg p-3 text-sm focus:ring focus:ring-blue-200"
            placeholder="Nội dung đánh giá (tối thiểu 15 ký tự)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Đánh giá:</span>
            <ProductRating
              rating={rating}
              onChange={(value) => setRating(value)}
              size={22}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Gửi đánh giá
          </button>
        </div>
      )}

      {/* ================= LIST COMMENTS ================= */}
      <div className="space-y-4">
        {comments.length === 0 && (
          <p className="text-gray-500 text-sm">Chưa có đánh giá nào</p>
        )}

        {comments.map((c) => (
          <div key={c._id} className="border rounded-lg p-4">
            <ProductRating rating={c.rating || 0} />
            <p className="text-sm mt-2">{c.text}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(c.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}