import React, { useEffect, useState } from "react";
import {
  UserOutlined,
  ProductOutlined,
  InfoCircleOutlined,
  BellOutlined,
  BarChartOutlined
} from "@ant-design/icons";
import { Badge, Button, Dropdown, List, Menu } from "antd";
import { socket } from "../../socket";

import AdminUser from "../../AdminComponents/AdminUser/AdminUser";
import AdminProduct from "../../AdminComponents/AdminProduct/AdminProduct";
import AdminOrder from "../../AdminComponents/AdminOrder/AdminOrder";
import AdminProfile from "../../AdminComponents/AdminProfile/AdminProfile";
import apiService from "../../Api/Api";
import boxImage from "./box.png";
import styles from "./AdminPage.module.css";
import {
  MENU_KEYS,
  MENU_LABELS,
  ROLES,
  ROUTES,
  STORAGE_KEYS,
} from "../../Constants/AdminConstants.ts";
import AdminRevenueDashboard from "../../AdminComponents/AdminAnalysis/AdminAnalysis.jsx";

const getItem = (label, key, icon, children, type) => ({
  key,
  icon,
  children,
  label,
  type,
});

const MENU_ITEMS = [
  getItem(
    MENU_LABELS[MENU_KEYS.PRODUCTS],
    MENU_KEYS.PRODUCTS,
    <ProductOutlined />
  ),
  getItem(
    MENU_LABELS[MENU_KEYS.USERS],
    MENU_KEYS.USERS,
    <UserOutlined />
  ),
  getItem(
    MENU_LABELS[MENU_KEYS.ORDERS],
    MENU_KEYS.ORDERS,
    <img src={boxImage} alt="Order" width={14} />
  ),
  getItem(
    MENU_LABELS[MENU_KEYS.ANALYSIS],
    MENU_KEYS.ANALYSIS,
    <BarChartOutlined />
  ),
  getItem(
    MENU_LABELS[MENU_KEYS.PROFILE],
    MENU_KEYS.PROFILE,
    <InfoCircleOutlined />
  )
];

const Admin = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [keySelected, setKeySelected] = useState(MENU_KEYS.PRODUCTS);

  const fetchNotifications = async () => {
    try {
      const res = await apiService.getNotifications({ page: 1, limit: 20 });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem(STORAGE_KEYS.ROLE);
    if (role !== ROLES.ADMIN) {
      window.location.href = ROUTES.HOME;
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = ROUTES.HOME;
  };

  const handleOnClickMenu = ({ key }) => {
    setKeySelected(key);
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
      case MENU_KEYS.ANALYSIS:
        return <AdminRevenueDashboard />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    if (!socket.connected) socket.connect();

    socket.emit("authenticate", { token });

    socket.on("notification:new", (noti) => {
      setUnreadCount((c) => c + 1);
    });

    return () => {
      socket.off("notification:new");
    };
  }, []);

  const notificationItems = [
    {
      key: "notifications",
      label: (
        <div style={{ width: 360 }}>

          {/* HEADER */}
          <div
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 600 }}>Thông báo</span>
            {unreadCount > 0 && (
              <span
                style={{
                  background: "#ff4d4f",
                  color: "#fff",
                  fontSize: 12,
                  padding: "2px 8px",
                  borderRadius: 12,
                }}
              >
                {unreadCount} mới
              </span>
            )}
          </div>

          {/* LIST */}
          <List
            dataSource={notifications}
            locale={{ emptyText: "Không có thông báo" }}
            style={{ maxHeight: 360, overflowY: "auto" }}
            renderItem={(item) => (
              <List.Item
                onClick={async () => {
                  if (!item.isRead) {
                    await apiService.markNotificationRead(item._id);
                    setNotifications((prev) =>
                      prev.map((n) =>
                        n._id === item._id ? { ...n, isRead: true } : n
                      )
                    );
                    setUnreadCount((c) => Math.max(0, c - 1));
                  }

                  if (item.data?.orderId) {
                    setKeySelected(MENU_KEYS.ORDERS);
                  }
                }}
                style={{
                  cursor: "pointer",
                  background: item.isRead ? "#fff" : "#f0f7ff",
                  paddingLeft: 12,
                }}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: "flex", gap: 8 }}>
                      {!item.isRead && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#1677ff",
                            marginTop: 6,
                          }}
                        />
                      )}
                      <span style={{ fontWeight: 600 }}>
                        {item.title}
                      </span>
                    </div>
                  }
                  description={
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {item.message}
                    </div>
                  }
                />
              </List.Item>
            )}
          />

          {/* FOOTER */}
          {notifications.length > 0 && (
            <div
              style={{
                borderTop: "1px solid #f0f0f0",
                textAlign: "center",
                padding: 8,
              }}
            >
              <Button
                type="link"
                size="small"
                onClick={async () => {
                  await apiService.markAllNotificationsRead();
                  setNotifications((prev) =>
                    prev.map((n) => ({ ...n, isRead: true }))
                  );
                  setUnreadCount(0);
                }}
              >
                Đánh dấu tất cả đã đọc
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Admin</h1>

        <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
          <Dropdown
            menu={{ items: notificationItems }}
            trigger={["click"]}
            placement="bottomRight"
            onOpenChange={(open) => {
              if (open) fetchNotifications();
            }}
          >
            <div style={{ cursor: "pointer" }}>
              <Badge
                count={unreadCount}
                overflowCount={9}
                size="small"
              >
                <BellOutlined
                  style={{ fontSize: 20, color: "#fff" }}
                />
              </Badge>
            </div>
          </Dropdown>

          <Button ghost onClick={handleLogout}>
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
              height: "calc(100vh - 120px)",
              overflowY: "auto",
            }}
          >
            {renderPage(keySelected)}
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;