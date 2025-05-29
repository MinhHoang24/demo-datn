import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './ChatPopUp.css';

// Kết nối đến server socket.io
const socket = io('http://localhost:5001');

const ChatPopUp = ({ onClose, userId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Gửi userId khi kết nối
    socket.emit('set_userid', userId);

    // Lắng nghe tin nhắn từ server
    socket.on('receive_message', (data) => {
      console.log(data)
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    console.log(message)

    return () => {
      // Gỡ bỏ sự kiện khi component bị hủy
      socket.off('receive_message');
    };
  }, [userId]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // Gửi tin nhắn kèm theo userId
      socket.emit('send_message', { userId, message });
      setMessage(''); // Xóa nội dung sau khi gửi
    }
  };

  return (
    <div className="chat-popup">
      <div className="chat-header">
        <h2>Chat với Admin</h2>
        <button className="chat-close-button" onClick={onClose}>
          X
        </button>
      </div>
      <div className="chat-body">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className="chat-message">
              <strong>{msg.userId}: </strong> {/* Hiển thị userId */}
              <p>{msg.message}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="chat-footer">
        <textarea
          value={message}
          onChange={handleInputChange}
          placeholder="Gõ tin nhắn của bạn..."
          className="chat-input"
        ></textarea>
        <button className="chat-send-button" onClick={handleSendMessage}>
          Gửi
        </button>
      </div>
    </div>
  );
};

export default ChatPopUp;