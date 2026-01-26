import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Search from "../Search/Search";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBagShopping,
  faList,
  faTruckField,
  faBell,
  faCaretDown,
  faRightFromBracket,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";
import HeadlessTippy from "@tippyjs/react/headless";
import MenuBar from "../MenuBar/MenuBar";
import { AuthContext } from "../../Contexts/AuthContext";
import apiService from "../../Api/Api";
import { socket } from "../../socket";
import { CartContext } from "../../Contexts/CartCountContext";

export default function Header() {
  const navigate = useNavigate();
  const { cartCount, loadingCount } = useContext(CartContext);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isLoggedIn, user, logout } = useContext(AuthContext);

  const [isMenu, setIsMenu] = useState(false);
  const [showNoti, setShowNoti] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const socketAuthed = useRef(false);

  /* =========================
     REDIRECT ADMIN
  ========================= */
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "admin") {
      window.location.href = "/admin";
    }
  }, []);

  /* =========================
     FETCH NOTIFICATIONS
  ========================= */
  const fetchNotifications = async () => {
    try {
      const res = await apiService.getNotifications({ page: 1, limit: 20 });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {
      console.error("Fetch notifications failed:", e);
    }
  };

  /* =========================
     SOCKET LISTEN
  ========================= */
  useEffect(() => {
    if (!isLoggedIn) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    if (!socket.connected) socket.connect();

    if (!socketAuthed.current) {
      socket.emit("authenticate", { token });
      socketAuthed.current = true;
    }

    socket.on("notification:new", (noti) => {
      setNotifications((prev) => [noti, ...prev]);
      setUnreadCount((c) => c + 1);
    });

    return () => {
      socket.off("notification:new");
    };
  }, [isLoggedIn]);

  /* =========================
     CLICK NOTIFICATION
  ========================= */
  const handleClickNotification = async (n) => {
    try {
      if (!n.isRead) {
        await apiService.markNotificationRead(n._id);
        setNotifications((prev) =>
          prev.map((x) =>
            x._id === n._id ? { ...x, isRead: true } : x
          )
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }

      if (n.data?.orderId) {
        navigate(`/orders`);
      }
      setShowNoti(false);
    } catch (e) {
      console.error("Mark notification failed:", e);
    }
  };

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = () => {
    logout();
    localStorage.clear();
    window.location.replace("/");
  };

  return (
    <header className="fixed top-0 z-[10000] w-full h-20 bg-[#0065b3] flex items-center">
      <div className="w-full flex items-center justify-around gap-8 px-4">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src="https://res.cloudinary.com/dcmowy3ou/image/upload/v1768648255/logo_momc8f.png"
            alt="Logo"
            className="h-11 hidden lg:block"
          />
          <span className="font-bold text-white text-lg">
            MH SHOP
          </span>
        </Link>

        {/* MENU */}
        <HeadlessTippy
          visible={isMenu}
          interactive
          placement="bottom-start"
          onClickOutside={() => setIsMenu(false)}
          render={(attrs) => (
            <div
              tabIndex="-1"
              {...attrs}
              className="bg-white rounded-xl shadow-lg"
            >
              <MenuBar />
            </div>
          )}
        >
          <button
            onClick={() => setIsMenu((v) => !v)}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg hover:bg-white hover:text-[#0065b3] transition"
          >
            <FontAwesomeIcon icon={faList} />
            <span className="hidden md:block">Danh mục</span>
          </button>
        </HeadlessTippy>

        {/* SEARCH */}
        <div className="flex-1 max-w-[300px]">
          <Search />
        </div>

        {/* ORDERS */}
        <Link
          to="/orders"
          className="flex items-center gap-2 text-white hover:scale-105 transition"
        >
          <FontAwesomeIcon icon={faTruckField} />
          <span className="hidden md:block">Đơn hàng</span>
        </Link>

        {/* CART */}
        <Link
          to="/cart"
          className="flex items-center gap-2 text-white hover:scale-105 transition"
        >
          <span className="relative inline-flex">
            <FontAwesomeIcon icon={faBagShopping} />

            {!loadingCount && cartCount > 0 && (
              <span
                className="absolute -top-2 -right-2 min-w-[16px] h-[16px]
                bg-red-500 text-white text-[10px] flex items-center justify-center
                rounded-full px-1 leading-none"
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </span>

          <span className="hidden md:block">Giỏ hàng</span>
        </Link>

        {/* LOGIN / USER ACTIONS */}
        {!isLoggedIn ? (
          /* ===== CHƯA LOGIN ===== */
          <Link
            to="/login"
            className="bg-white text-black hover:text-[#0065b3] px-4 py-2 rounded-lg transition font-medium"
          >
            Đăng nhập
          </Link>
        ) : (
          /* ===== ĐÃ LOGIN ===== */
          <div className="flex items-center gap-3 bg-white/20 px-3 py-2 rounded-xl">
            {/* 🔔 NOTIFICATION */}
            <div className="relative pr-2">
              <button
                onClick={() => {
                  setShowNoti((v) => !v);
                  fetchNotifications();
                }}
                className="relative text-white hover:scale-110 transition"
              >
                <FontAwesomeIcon icon={faBell} />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px]
                    bg-red-500 text-white text-[10px] flex items-center justify-center
                    rounded-full px-1">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* NOTIFICATION DROPDOWN */}
              {showNoti && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b font-semibold">
                    Thông báo
                  </div>

                  <div className="max-h-[320px] overflow-y-auto">
                    {notifications.length === 0 && (
                      <div className="p-4 text-sm text-gray-400">
                        Không có thông báo
                      </div>
                    )}

                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => handleClickNotification(n)}
                        className={`px-4 py-3 border-b cursor-pointer hover:bg-gray-100 ${
                          !n.isRead ? "bg-blue-50" : ""
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-800">
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {n.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ⋮ DROPDOWN LOGOUT */}
            <HeadlessTippy
              visible={showUserMenu}
              interactive
              placement="bottom-end"
              onClickOutside={() => setShowUserMenu(false)}
              render={(attrs) => (
                <div
                  tabIndex="-1"
                  {...attrs}
                  className="w-48 bg-white rounded-xl shadow-xl overflow-hidden border"
                >
                  {/* USER INFO */}
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm font-semibold text-gray-800">
                      {user}
                    </p>
                    <p className="text-xs text-gray-500">
                      Tài khoản cá nhân
                    </p>
                  </div>

                  {/* PROFILE */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("/profile");
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FontAwesomeIcon icon={faUserGear} />
                    Hồ sơ cá nhân
                  </button>

                  {/* LOGOUT */}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FontAwesomeIcon icon={faRightFromBracket} />
                    Đăng xuất
                  </button>
                </div>
              )}
            >
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex items-center gap-1 text-white hover:opacity-80 transition"
              >
                <FontAwesomeIcon icon={faCaretDown} />
              </button>
            </HeadlessTippy>
          </div>
        )}
      </div>
    </header>
  );
}