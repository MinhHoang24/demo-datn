import React, { useEffect, useState } from "react";
import ProductRating from "../ProductRating/ProductRating";
import apiService from "../../Api/Api";

export default function ProductReviews({ product, onOpenPopup }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);

  const [canReview, setCanReview] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);

  const myUserId = localStorage.getItem("userID");

  const handleUpdateComment = async (commentId) => {
    if (editContent.trim().length < 15) {
      alert("Nội dung đánh giá tối thiểu 15 ký tự");
      return;
    }

    try {
      await apiService.updateMyComment(commentId, {
        text: editContent,
        rating: editRating,
      });

      setEditingId(null);
      setEditContent("");
      setEditRating(5);

      const res = await apiService.getComments(product._id);
      setComments(res.data?.comments || []);
    } catch (err) {
      alert(err?.response?.data?.message || "Cập nhật đánh giá thất bại");
    }
  };

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

  const myComment = comments.find(
    (c) => String(c.userId?._id) === String(myUserId)
  );

  return (
    <section id="reviews-section" className="space-y-6">
      <h2 className="text-lg font-semibold">Đánh giá & nhận xét</h2>

      {/* ================= REVIEW FORM / MESSAGE ================= */}
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
      ) : myComment ? (
        <div className="text-sm text-gray-600 bg-gray-50 border rounded-lg p-4">
          <p>Bạn đã đánh giá sản phẩm này.</p>
          <p className="mt-1 text-xs text-gray-500">
            Bạn có thể chỉnh sửa lại đánh giá của mình bên dưới.
          </p>
        </div>
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

        {comments.map((c) => {
          const isMine = String(c.userId?._id) === String(myUserId);
            console.log("myUserId:", myUserId);
            console.log("comment userId:", c.userId);
          const isEditing = editingId === c._id;

          return (
            <div key={c._id} className="border rounded-lg p-4 space-y-2">
              {/* HEADER */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  {c.userId?.userName || "Khách hàng"}
                  {isMine && (
                    <span className="ml-2 text-xs text-blue-600">(Bạn)</span>
                  )}
                </span>

                <ProductRating rating={c.rating || 0} />
              </div>

              {/* CONTENT */}
              {isEditing ? (
                <>
                  <textarea
                    className="w-full border rounded-lg p-2 text-sm"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />

                  <div className="flex items-center gap-2">
                    <ProductRating
                      rating={editRating}
                      onChange={(v) => setEditRating(v)}
                      size={20}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateComment(c._id)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-sm border rounded"
                    >
                      Hủy
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm">{c.text}</p>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                    </p>

                    {isMine && !isEditing && (
                      <button
                        onClick={() => {
                          setEditingId(c._id);
                          setEditContent(c.text);
                          setEditRating(c.rating);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        ✏️ Chỉnh sửa đánh giá của bạn
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}