import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import Search from "../Search/Search";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBagShopping, faCircleUser, faList, faTruckField } from '@fortawesome/free-solid-svg-icons';
import HeadlessTippy from '@tippyjs/react/headless';
import Tippy from '@tippyjs/react/headless';
import MenuBar from "../MenuBar/MenuBar";
import 'tippy.js/dist/tippy.css';
import { AuthContext } from "../../Contexts/AuthContext";
import { faBell, faComment } from '@fortawesome/free-solid-svg-icons';
// import useSignalR from "../useSignalR/useSignalR";

function Header() {
    useEffect(() => {
        const role = localStorage.getItem("role");
        console.log("[useEffect] role from localStorage:", role);  // log role lúc mount
        if(role === "admin") {
          console.log("[useEffect] Redirecting admin to /admin");
          window.location.href = "/admin";
        }
    }, []); // Thêm [] để useEffect chạy 1 lần lúc mount

    const [isMenu, setIsMenu] = useState(false);
    const { isLoggedIn, user, logout } = useContext(AuthContext);
    const [isRead, setIsRead] = useState(true); 

    const handleLogout = () => {
        console.log("[handleLogout] User logging out:", user);
        logout();
        window.location.replace('/');
        localStorage.removeItem('phoneNumber'); // Xóa thông tin người dùng
        localStorage.removeItem('isLoggedIn'); // Xóa trạng thái đăng nhập
        localStorage.removeItem('authToken');
        localStorage.removeItem('userID');
        console.log("[handleLogout] localStorage cleared, redirected to /");
    };

    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    
    const showMessage = (msg) => {
        console.log("[showMessage] New message received:", msg);
        setMessage(msg);
        setVisible(false); 
        setIsRead(false);
    };
    
    // useSignalR(showMessage, '');

    const handleNewMessage = () => {
        // khi có thông báo mới thì setIsRead(false) để hiện dấu chấm đỏ
        setIsRead(true);
        if(message !== ''){
            setVisible(!visible);
            console.log("[handleNewMessage] Toggled message visibility:", !visible);
        }
    };

    console.log("[Render] isLoggedIn:", isLoggedIn, "user:", user, "message:", message, "visible:", visible);

    return (
        <div className="header">
            <div className="menu">
                <div className="logo">
                    <img src={"https://d1csarkz8obe9u.cloudfront.net/posterpreviews/hi-tech-logo-green-design-template-d57e7fb993808c268150e0da8633654e_screen.jpg?ts=1584477855"} alt="Logo" />
                    <span className="about-name">
                        <Link to="/"> <b> MH SHOP </b></Link>
                    </span>
                </div>
                
                <HeadlessTippy
                    visible={isMenu}
                    interactive
                    placement="bottom-end"
                    onClickOutside={() => {
                      console.log("[HeadlessTippy] Click outside - close menu");
                      setIsMenu(false);
                    }} 
                    delay={[0, 700]}
                    render={(attrs) => (
                        <div className="menuBar" tabIndex="-1" {...attrs}>    
                            <MenuBar />         
                        </div>
                    )}
                >
                    <div className="menu-list1" onClick={() => {
                        setIsMenu(!isMenu);
                        console.log("[menu-list1] Menu toggled to", !isMenu);
                    }}>
                        <div className='my-icon'>
                            <FontAwesomeIcon icon={faList} />  
                        </div>
                        <div className="box-content">
                            <span className="title-y">DANH MỤC</span>
                        </div>
                    </div>
                </HeadlessTippy>
                
                <div className="menu-list">
                    <Search />
                </div>
                <Link to="/checkout" className="about-delivery-tracking" >
                    <div className="box-icon">
                        <div className='my-icon'>
                            <FontAwesomeIcon icon={faTruckField} className='fa-h-24px' />
                        </div>
                    </div>
                    <div className="box-content">
                        <p className="title-y">Đơn hàng</p>
                    </div>
                </Link>
                <div className="menu-list">
                    <div className="shop-cart">
                        <Link to="/cart" className="shop-cart">
                            <div className="box-icon">
                                <div className='my-icon'>
                                    <FontAwesomeIcon icon={faBagShopping} className='fa-h-24px' />
                                </div>
                            </div>
                            <div className="box-content">
                                <p className="title-y">Giỏ hàng</p>
                                <span className="count"></span>
                            </div>        
                        </Link>
                    </div>
                </div>
                
                <div>
                    {isLoggedIn ? (
                        <div style={{ backgroundColor: '#0065b3' }} className="box-user">
                            <div className="box-icon">
                                <Link to='/profile' style={{ display: 'inline-block' }}>
                                    <div className="my-icon">
                                        <FontAwesomeIcon icon={faCircleUser} style={{ fontSize: '23px' }} className='avatar' />
                                    </div>
                                </Link>
                            </div>
                            <span className="title-y">
                                <Link to='/profile'>{user}</Link>
                            </span>
                            <div className="notification-icon" style={{ backgroundColor: '0065b3' }}>
                                <Tippy
                                interactive={true}
                                visible={visible}
                                placement="bottom"
                                onClickOutside={() => {
                                    console.log("[Tippy] Click outside notification - hiding");
                                    setVisible(false);
                                }}
                                render={attrs => (
                                    <div className="tooltip-noti" {...attrs}>
                                    {message}
                                    </div>
                                )}
                                >
                                <button onClick={handleNewMessage} className="notification-icon">
                                    <FontAwesomeIcon icon={faBell} style={{ fontSize: '23px' }} className='icon-noti' />
                                    {!isRead && <FontAwesomeIcon icon={faComment} className="unread-dot" />}
                                </button>
                                </Tippy>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div>
                    {isLoggedIn ? (
                        <div className="login-btn" onClick={handleLogout}>
                            <div className="header-item about-member">
                                <div className="box-content">
                                    <span className="title-y">Đăng xuất</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link to='/login' style={{ textDecoration: 'none' }}>
                            <div className="login-btn">
                                <div className="header-item about-member">
                                    <div className="box-content">
                                        <span className="title-y" style={{ textDecoration: 'none'}}>Đăng nhập</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Header;