import { useEffect, useState } from "react";
import { Button, Modal, Input, Spin, Card, notification } from "antd";
import apiService from "../../Api/Api";

const DEFAULT_PASSWORDS = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);

  const [loadingPage, setLoadingPage] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

  const [updatedAdmin, setUpdatedAdmin] = useState({});
  const [passwords, setPasswords] = useState(DEFAULT_PASSWORDS);

  const openNotification = (type, message) => {
    notification[type]({
      message,
      placement: "topRight",
      duration: 5,
      style: { zIndex: 9999999 },
    });
  };

  const ensureAuth = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      openNotification("error", "Bạn cần phải đăng nhập!");
      return null;
    }
    return token;
  };

  const formatField = (value) => value || "Chưa có thông tin";

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoadingPage(true);
      try {
        const token = ensureAuth();
        if (!token) return;

        const response = await apiService.getAdminProfile();
        const adminData = response.data.admin;

        setAdmin(adminData);
        setUpdatedAdmin(adminData);
      } catch (error) {
        console.error(error);
        openNotification("error", "Không thể lấy thông tin admin");
      } finally {
        setLoadingPage(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleUpdate = async () => {
    try {
      setLoadingUpdate(true);
      const token = ensureAuth();
      if (!token) {
        setLoadingUpdate(false);
        return;
      }

      const response = await apiService.updateAdminProfile(updatedAdmin);
      const adminData = response.data.admin;

      setAdmin(adminData);
      openNotification("success", "Cập nhật thông tin thành công!");
      setIsUpdateModalVisible(false);
    } catch (error) {
      console.error(error);
      if (error.response?.data?.message) {
        openNotification("error", error.response.data.message);
      } else {
        openNotification("error", "Cập nhật thông tin thất bại!");
      }
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      openNotification("error", "Mật khẩu mới và xác nhận không khớp!");
      return;
    }

    try {
      setLoadingPassword(true);
      const token = ensureAuth();
      if (!token) {
        setLoadingPassword(false);
        return;
      }

      const response = await apiService.changeAdminPassword(passwords);

      openNotification(
        "success",
        response.data.message || "Đổi mật khẩu thành công!"
      );
      setIsPasswordModalVisible(false);
      setPasswords(DEFAULT_PASSWORDS);
    } catch (error) {
      console.error(error);
      if (error.response?.data?.message) {
        openNotification("error", error.response.data.message);
      } else {
        openNotification("error", "Đổi mật khẩu thất bại!");
      }
    } finally {
      setLoadingPassword(false);
    }
  };

  const showUpdateModal = () => {
    setIsUpdateModalVisible(true);
  };

  const showPasswordModal = () => {
    setIsPasswordModalVisible(true);
  };

  const handleCancelUpdate = () => {
    setIsUpdateModalVisible(false);
    setUpdatedAdmin(admin || {});
  };

  const handleCancelPassword = () => {
    setIsPasswordModalVisible(false);
    setPasswords(DEFAULT_PASSWORDS);
  };

  const handleChange = (field, value) => {
    setUpdatedAdmin((prev) => ({ ...prev, [field]: value }));
  };

  // ====== Render ======
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center"}}>
      {loadingPage ? (
        <Spin size="large" />
      ) : (
        <Card
          title={
            <div style={{ fontWeight: "bold", fontSize: 24 }}>
              Thông tin admin
            </div>
          }
          extra={
            <>
              <Button
                onClick={showUpdateModal}
                style={{ marginRight: 10 }}
              >
                Cập nhật thông tin
              </Button>
              <Button onClick={showPasswordModal}>
                Đổi mật khẩu
              </Button>
            </>
          }
          style={{ width: "70%", minWidth: 320 }}
        >
          <p>
            <strong>Tên:</strong> {formatField(admin?.userName)}
          </p>
          <p>
            <strong>Số điện thoại:</strong> {formatField(admin?.phoneNumber)}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {formatField(admin?.diaChi)}
          </p>
          <p>
            <strong>Email:</strong> {formatField(admin?.email)}
          </p>
        </Card>
      )}

      {/* Modal Cập nhật thông tin */}
      <Modal
        title={
          <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 18 }}>
            Cập nhật thông tin
          </div>
        }
        open={isUpdateModalVisible}
        onOk={handleUpdate}
        onCancel={handleCancelUpdate}
        confirmLoading={loadingUpdate}
      >
        <div style={{ marginBottom: 10 }}>
          <label>Tên: </label>
          <Input
            value={updatedAdmin.userName || ""}
            onChange={(e) => handleChange("userName", e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Số điện thoại: </label>
          <Input
            value={updatedAdmin.phoneNumber || ""}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Địa chỉ: </label>
          <Input
            value={updatedAdmin.diaChi || ""}
            onChange={(e) => handleChange("diaChi", e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Email: </label>
          <Input
            type="email"
            value={updatedAdmin.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
      </Modal>

      {/* Modal Đổi mật khẩu */}
      <Modal
        title={
          <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 18 }}>
            Đổi mật khẩu
          </div>
        }
        open={isPasswordModalVisible}
        onOk={handlePasswordChange}
        onCancel={handleCancelPassword}
        confirmLoading={loadingPassword}
      >
        <div style={{ marginBottom: 10 }}>
          <label>Mật khẩu hiện tại: </label>
          <Input.Password
            value={passwords.currentPassword}
            onChange={(e) =>
              setPasswords((prev) => ({
                ...prev,
                currentPassword: e.target.value,
              }))
            }
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Mật khẩu mới: </label>
          <Input.Password
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords((prev) => ({
                ...prev,
                newPassword: e.target.value,
              }))
            }
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Xác nhận mật khẩu mới: </label>
          <Input.Password
            value={passwords.confirmPassword}
            onChange={(e) =>
              setPasswords((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
          />
        </div>
      </Modal>
    </div>
  );
};

export default AdminProfile;