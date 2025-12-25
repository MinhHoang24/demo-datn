import React, { useEffect, useState } from "react";
import ProductRating from "../ProductRating/ProductRating";
import apiService from "../../Api/Api";
import StarRatingInput from "./StarRatingInput";

export default function ProductReviews({ product, onOpenPopup }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userId = localStorage.getItem("userID");

  useEffect(() => {
    if (!product?._id) return;

    const fetchComments = async () => {
      try {
        const res = await apiService.getComments(product._id);
        setComments(res.data.comments || []);
      } catch (e) {
        console.error("Fetch comments failed", e);
      }
    };

    fetchComments();
  }, [product]);

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      onOpenPopup?.();
      return;
    }

    if (content.length < 15) {
      alert("Nội dung tối thiểu 15 ký tự");
      return;
    }

    try {
      await apiService.addComment(product._id, userId, content, rating);
      setContent("");
      setRating(5);

      const res = await apiService.getComments(product._id);
      setComments(res.data.comments || []);
    } catch (e) {
      alert("Gửi đánh giá thất bại");
    }
  };

  return (
    <section id="reviews-section" className="space-y-6">
      <h2 className="text-lg font-semibold">Đánh giá & nhận xét</h2>

        {/* FORM */}
        <div className="space-y-4">
        <textarea
            className="w-full border rounded-lg p-3 text-sm focus:ring focus:ring-blue-200"
            placeholder="Nội dung đánh giá (tối thiểu 15 ký tự)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Đánh giá:</span>
            <StarRatingInput
                value={rating}
                onChange={(value) => setRating(value)}
            />
        </div>

        <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
            Gửi đánh giá
        </button>
        </div>

      {/* LIST */}
      <div className="space-y-4">
        {comments.length === 0 && (
          <p className="text-gray-500 text-sm">
            Chưa có đánh giá nào
          </p>
        )}

        {comments.map((c, i) => (
          <div key={i} className="border rounded-lg p-4">
            <ProductRating rating={c.rating || 0} />
            <p className="text-sm mt-2">{c.text}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(c.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}