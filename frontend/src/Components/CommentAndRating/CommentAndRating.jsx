import React, { useState, useEffect, useId} from 'react';
import './CommentAndRating.css';
import axios from 'axios'; 
import ReactStars from 'react-rating-stars-component';
//import product_comments from '../Assets/comments.js';
import no_avt from '../../Assets/no-avt.png'
import ProductRating from '../ProductRating/ProductRating.js';
import LoginPopup from '../LoginPopUp/LoginPopUp.js';
import AllApi from '../../Api/Api';

const CommentAndRating = ({ product, onOpenPopup }) => {
  const [content, setContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 5;
  const [comments, setComments] = useState([]);
  const [rating, setRating] = useState(1);
  const userId = localStorage.getItem("userID");
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const [currentComments, setCurrentComments] = useState([]);
  const [hasFetchedComments, setHasFetchedComments] = useState(false);

  // Hàm để lấy bình luận từ server
const fetchComments = async () => {
  if (hasFetchedComments) return; // Chỉ gọi lần đầu tiên
  try {
    const response = await AllApi.getComments(product._id);
    if (Array.isArray(response.data.comments)) {
      setComments(response.data.comments);
      setHasFetchedComments(true);
    } else {
      setComments([]);
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    setComments([]);
  }
};

  // Gọi fetchComments khi product._id thay đổi và chưa gọi trước đó
useEffect(() => {
  if (product?._id && !hasFetchedComments) {
    fetchComments();
  }
}, [product._id, hasFetchedComments]);


  // Cập nhật comments hiện tại khi trang hoặc bình luận thay đổi
  // Hàm để lấy các bình luận theo trang hiện tại
  const getCurrentComments = (page, commentsPerPage, comments) => {
    const indexOfLastComment = page * commentsPerPage;
    const indexOfFirstComment = indexOfLastComment - commentsPerPage;
    return comments.slice(indexOfFirstComment, indexOfLastComment);
  };

  // Cập nhật khi `currentPage` hoặc `comments` thay đổi
  useEffect(() => {
    setCurrentComments(getCurrentComments(currentPage, commentsPerPage, comments));
  }, [currentPage, comments]);


  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleContentChange = (event) => {
    setContent(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isLoggedIn) {
      onOpenPopup(); // Hiển thị popup đăng nhập
      return;
    }

    if (content.length < 15) {
      alert("Nội dung bình luận tối thiểu 15 ký tự.");
      return;
    }

    if (rating === 0) {
      alert("Vui lòng chọn đánh giá sao.");
      return;
    }

    try {
      // Gửi đánh giá và bình luận lên server
      await AllApi.addReview(product._id, userId, rating, content);
      await AllApi.addComment(product._id, userId, content, rating);

      alert("Bình luận và đánh giá đã được thêm.");
      setContent(''); // Xóa nội dung sau khi gửi
      setRating(0); // Reset rating về 0
      fetchComments(); // Tải lại bình luận sau khi gửi thành công
    } catch (error) {
      console.error("Error submitting comment or rating:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Tính toán tổng số trang
  const totalPages = Math.ceil(comments.length / commentsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div id="reviews-section">
      <div className="rating-form">
        <div className="name-product">
          <h3>Đánh giá và nhận xét về sản phẩm {product.name}</h3>
          <div className="rating-average">
            <p>Stars: {product.rating.toFixed(2)}</p>
            <ProductRating rating={product.rating} />
            <p> / {product.star1 + product.star2 + product.star3 + product.star4 + product.star5} đánh giá </p>
          </div>
          <p>(Vui lòng đăng nhập vào tài khoản đã mua hàng để đánh giá sản phẩm)</p>
        </div>
        <form className="product-rating-box" onSubmit={handleSubmit}>
          <div className="comment-part">
            <textarea
              title="Nội dung"
              placeholder="Nội dung. Tối thiểu 15 ký tự *"
              name="Content"
              value={content}
              onChange={handleContentChange}
            ></textarea>
          </div>
          <div className="rating-part">
            <label>
              Rating:
              <ReactStars
                count={5}
                onChange={handleRatingChange}
                size={24}
                activeColor="gold"
                value={rating}
              />
            </label>
          </div>
          {isLoggedIn ? (
            <button className="button-yin" type="submit">
              GỬI ĐÁNH GIÁ
            </button>
          ) : (
            <button
              className="button-yin"
              type="button"
              onClick={onOpenPopup} // Trigger login popup
            >
              ĐĂNG NHẬP ĐỂ GỬI ĐÁNH GIÁ
            </button>
          )}
        </form>
        <div className="rating-content">
          <div>
            {getCurrentComments(currentPage, commentsPerPage, comments).map((comment) => (
              <div key={comment.userId._id} className="item-comment">
                <div className="avt">
                  <img className="avt-yin" src={no_avt} alt="Avatar" />
                </div>
                <div className="info-comment">
                  <strong className="user-name">{"Ẩn danh"}</strong>
                  <span>
                    (
                    {comment.createdAt
                      ? new Date(comment.createdAt).toLocaleDateString()
                      : "Không xác định"}
                    )
                  </span>
                  <ProductRating rating={comment.rating || 0} />
                  <div className="review-item">
                    {typeof comment.text === "string"
                      ? comment.text
                      : JSON.stringify(comment.comment)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="p-comment">Xem bình luận trang số</p>
          <div className="pagination">
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => handlePageChange(number)}
                className={currentPage === number ? 'active' : ''}
              >
                {number}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentAndRating;