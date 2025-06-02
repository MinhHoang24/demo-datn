import { notification } from "antd";

// Cấu hình notification toàn cục (chỉ chạy một lần)
notification.config({
  getContainer: () => {
    let container = document.getElementById('notification-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-root';
      document.body.appendChild(container);
    }
    return container;
  },
  top: 90,         // khoảng cách từ trên xuống, tùy chỉnh cho header
  duration: 3,
  maxCount: 3,
});

// Hàm tiện ích để gọi notification
const openNotification = (type, message) => {
  notification[type]({
    message,
    placement: "topRight",
    style: { zIndex: 15000 },
  });
};

export default {
  success: (msg) => openNotification("success", msg),
  error: (msg) => openNotification("error", msg),
  info: (msg) => openNotification("info", msg),
  warning: (msg) => openNotification("warning", msg),
};