import React, { useEffect, useState } from "react";
import {
  UserOutlined,
  ProductOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Button, Menu } from "antd";

import AdminUser from "../../AdminComponents/AdminUser/AdminUser";
import AdminProduct from "../../AdminComponents/AdminProduct/AdminProduct";
import AdminOrder from "../../AdminComponents/AdminOrder/AdminOrder";
import AdminProfile from "../../AdminComponents/AdminProfile/AdminProfile";

import boxImage from "./box.png";
import styles from "./AdminPage.module.css";
import {
  MENU_KEYS,
  MENU_LABELS,
  ROLES,
  ROUTES,
  STORAGE_KEYS,
} from "../../Constants/AdminConstants.ts";

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
    MENU_LABELS[MENU_KEYS.PROFILE],
    MENU_KEYS.PROFILE,
    <InfoCircleOutlined />
  ),
];

const Admin = () => {
  const [keySelected, setKeySelected] = useState(MENU_KEYS.PRODUCTS);

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
      default:
        return null;
    }
  };

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Admin</h1>

        <Button ghost onClick={handleLogout} style={{ marginRight: 40 }}>
          Đăng xuất
        </Button>
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
    </>
  );
};

export default Admin;