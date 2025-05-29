import React, { useState } from 'react';
import { FaCommentDots } from 'react-icons/fa';
import ChatPopUp from '../../Components/ChatPopUp/ChatPopUp.jsx';
import Popular from '../../Components/Popular/Popular.jsx';
import SlidingBanner from '../../Components/SlidingBanner/SlidingBanner.js';
import './Home.css';

function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleClick = () => {
    // Khi mở chat, bạn có thể lấy userId từ backend hoặc localStorage
    const currentUserId = localStorage.getItem('userID') || 'defaultUserId'; // Lấy userId
    setUserId(currentUserId);
    setIsChatOpen(true);
  };
  console.log(userId)

  const handleClose = () => {
    setIsChatOpen(false);
  };

  return (
    <div className="home">
      <SlidingBanner />
      <Popular category={"Điện thoại"} />
      <Popular category={"Laptop"} />
      <Popular category={"Tai nghe"} />
      <Popular category={"Bàn phím"} />
      <Popular category={"Phụ kiện"} />
      <Popular category={"Chuột"} />
      <Popular category={"Ti vi"} />

      {/* Hiển thị icon chat nếu popup chưa mở */}
      {!isChatOpen && (
        <div className="chat-icon" onClick={handleClick}>
          <FaCommentDots size={40} color="#007bff" />
        </div>
      )}

      {/* Hiển thị popup trong Home */}
      {isChatOpen && (
        <div className="chat-popup-container">
          <ChatPopUp onClose={handleClose}  userId={userId}/>
        </div>
      )}
    </div>
  );
}

export default Home;