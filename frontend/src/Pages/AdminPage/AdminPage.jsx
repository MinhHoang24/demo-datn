import React, { useEffect, useState } from "react";
import {
  UserOutlined,
  ProductOutlined,
  BellOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Badge, Button, Menu } from "antd";
import { io } from "socket.io-client";

import AdminUser from "../../AdminComponents/AdminUser/AdminUser";
import AdminProduct from "../../AdminComponents/AdminProduct/AdminProduct";
import AdminOrder from "../../AdminComponents/AdminOrder/AdminOrder";
import AdminProfile from "../../AdminComponents/AdminProfile/AdminProfile";
// import AdminAnalysis from "../../AdminComponents/AdminAnalysis/AdminAnalysis";

import boxImage from "./box.png";
import styles from "./AdminPage.module.css";
import Tooltip from "./Tooltip";
import CustomModal from "./CustomModal";
import { MENU_KEYS, MENU_LABELS, ROLES, ROUTES, STORAGE_KEYS } from "../../Constants/AdminConstants.ts";

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || "http://localhost:5001";

const getItem = (label, key, icon, children, type) => ({
  key,
  icon,
  children,
  label,
  type,
});

const MENU_ITEMS = [
  getItem(MENU_LABELS[MENU_KEYS.PRODUCTS], MENU_KEYS.PRODUCTS, <ProductOutlined />),
  getItem(MENU_LABELS[MENU_KEYS.USERS], MENU_KEYS.USERS, <UserOutlined />),
  getItem(
    MENU_LABELS[MENU_KEYS.ORDERS],
    MENU_KEYS.ORDERS,
    <img src={boxImage} alt="Order" width={14} />
  ),
  getItem(MENU_LABELS[MENU_KEYS.PROFILE], MENU_KEYS.PROFILE, <InfoCircleOutlined />),
  // getItem(MENU_LABELS[MENU_KEYS.ANALYSIS], MENU_KEYS.ANALYSIS, <RiseOutlined />),
];

const socket = io(SOCKET_URL);

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isTooltipVisible, setTooltipVisible] = useState(false);
  const [isRead, setIsRead] = useState(true);
  const [keySelected, setKeySelected] = useState(MENU_KEYS.PRODUCTS);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isChatModalVisible, setChatModalVisible] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem(STORAGE_KEYS.ROLE);

    if (role !== ROLES.ADMIN) {
      window.location.href = ROUTES.HOME;
      return;
    }

    const handleReceiveMessage = (data) => {
      console.log("Received new message:", data);
      setIsRead(false);

      setUsers((prevUsers) => {
        const exists = prevUsers.find((user) => user.id === data.userId);
        if (!exists) {
          return [...prevUsers, { id: data.userId, mes: data.message }];
        }
        return prevUsers.map((user) =>
          user.id === data.userId ? { ...user, mes: data.message } : user
        );
      });
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = ROUTES.HOME;
  };

  const handleBellClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      top: rect.bottom + window.scrollY + 10,
      left: rect.left + window.scrollX - 100,
    });

    setTooltipVisible((prevVisible) => !prevVisible);
    setIsRead(true);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setTooltipVisible(false);
    setChatModalVisible(true);
  };

  const handleOnClickMenu = ({ key }) => {
    setKeySelected(key);
  };

  const handleCloseChatModal = () => {
    setChatModalVisible(false);
    setSelectedUser(null);
  };

  const renderPage = (key) => {
    switch (key) {
      case MENU_KEYS.USERS:
        return <AdminUser />;
      case MENU_KEYS.PRODUCTS:
        return <AdminProduct />;
      case MENU_KEYS.ORDERS:
        return <AdminOrder />;
      case MENU_KEYS.PROFILE:
        return <AdminProfile />;
      // case MENU_KEYS.ANALYSIS:
      //   return <AdminAnalysis />;
      default:
        return null;
    }
  };

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Admin</h1>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Badge dot={!isRead} offset={[-10, 10]}>
              <Button
                ghost
                shape="circle"
                icon={<BellOutlined />}
                onClick={handleBellClick}
              />
            </Badge>

            <Tooltip
              visible={isTooltipVisible}
              position={tooltipPosition}
              onClose={() => setTooltipVisible(false)}
              content={
                <div>
                  <h4>Người dùng nhắn tin:</h4>
                  <ul
                    style={{
                      margin: 5,
                      padding: 0,
                      listStyle: "none",
                      maxHeight: 250,
                      overflowY: "auto",
                    }}
                  >
                    {users.length === 0 && (
                      <li style={{ color: "#888" }}>Chưa có tin nhắn mới</li>
                    )}
                    {users.map((user) => (
                      <li
                        key={user.id}
                        style={{
                          padding: "8px",
                          cursor: "pointer",
                          background: "#f9f9f9",
                          borderRadius: "4px",
                          marginBottom: "5px",
                        }}
                        onClick={() => handleUserClick(user)}
                      >
                        <div
                          style={{
                            fontWeight: "bold",
                            marginBottom: "4px",
                          }}
                        >
                          ID: {user.id}
                        </div>
                        <div style={{ color: "#333" }}>
                          Tin nhắn: {user.mes}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              }
            />
          </div>

          <Button
            ghost
            onClick={handleLogout}
            style={{ marginLeft: 10, marginRight: 40 }}
          >
            Đăng xuất
          </Button>
        </div>
      </header>

      <div>
        <div className={styles.menuContainer}>
          <Menu
            mode="inline"
            selectedKeys={[keySelected]}
            style={{ height: "100%" }}
            items={MENU_ITEMS}
            onClick={handleOnClickMenu}
          />
        </div>

        <div className={styles.content}>
          <div
            style={{
              height: "calc(100vh - 120px - 40px)",
              overflowY: "auto",
            }}
          >
            {renderPage(keySelected)}
          </div>
        </div>
      </div>

      {isChatModalVisible && (
        <CustomModal
          isVisible={isChatModalVisible}
          onClose={handleCloseChatModal}
          selectedUser={selectedUser}
          socket={socket}
        />
      )}
    </>
  );
};

export default Admin;