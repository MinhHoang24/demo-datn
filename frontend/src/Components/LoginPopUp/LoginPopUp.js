import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginPopUp.css'; 
import computer from '../../Assets/computer.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const LoginPopup = ({ onLogin, onClose }) => {
  return (
    <div className="login-popup-container">
      <div className="login-popup">
        <div className="popup-content">
          <button className = "button-close"onClick = {onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button> 
          
          <p>Vui lòng đăng nhập để thực hiện chức năng này!</p>
          <div className='popup-box'>
            <img src={computer}/>
            <Link to="/login">
              <button className="button-popup" onClick={() => {onLogin(); onClose();}}>Đăng nhập</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;