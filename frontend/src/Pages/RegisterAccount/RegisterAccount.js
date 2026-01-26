import { useState } from "react";
import { Link } from "react-router-dom";
import apiService from "../../Api/Api";
import "./RegisterAccount.css";
import Loader from "../../Components/Loader/Loader.jsx";

export default function RegisterPage() {
  const [phonenumber, setPhonenumber] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* =========================
     VALIDATE
  ========================= */
  const validatePhoneNumber = (phoneNumber) =>
    /^(0)[3|5|7|8|9][0-9]{8}$/.test(phoneNumber);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /* =========================
     SUBMIT REGISTER
  ========================= */
  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = {};

    if (!phonenumber) {
      validationErrors.phonenumber = "Hãy nhập số điện thoại!";
    } else if (!validatePhoneNumber(phonenumber)) {
      validationErrors.phonenumber = "Số điện thoại không hợp lệ!";
    }

    if (!username) {
      validationErrors.username = "Hãy tạo tên người dùng!";
    }

    if (!email) {
      validationErrors.email = "Hãy nhập email!";
    } else if (!validateEmail(email)) {
      validationErrors.email = "Email không hợp lệ!";
    }

    if (!diaChi) {
      validationErrors.diaChi = "Hãy nhập địa chỉ!";
    }

    if (!password) {
      validationErrors.password = "Hãy tạo mật khẩu!";
    } else if (password.length < 6) {
      validationErrors.password = "Mật khẩu phải có ít nhất 6 ký tự!";
    }

    if (!rePassword) {
      validationErrors.rePassword = "Hãy xác nhận mật khẩu!";
    } else if (password !== rePassword) {
      validationErrors.rePassword = "Mật khẩu xác nhận không khớp!";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const newUser = {
      userName: username,
      phoneNumber: phonenumber,
      email,
      diaChi,
      password,
    };

    const success = await addUser(newUser);

    if (success) {
      setIsRegistered(true);
      setSuccessMessage(
        "Đăng ký thành công! Vui lòng nhập mã OTP đã gửi về email."
      );
    }
  };

  /* =========================
     CALL API REGISTER
  ========================= */
  const addUser = async (newUser) => {
    try {
      setIsSubmitting(true);
      const response = await apiService.registerUser(newUser);

      if (response.data.success) {
        return true;
      }

      return false;
    } catch (error) {
      if (error.response) {
        const message = error.response.data?.message;

        if (message?.includes("Email")) {
          setErrors((e) => ({ ...e, email: message }));
        } else if (message?.includes("Số điện thoại")) {
          setErrors((e) => ({ ...e, phonenumber: message }));
        } else {
          setErrors({ apiError: message || "Có lỗi xảy ra" });
        }
      } else {
        setErrors({ apiError: "Không kết nối được server" });
      }

      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="register-container">
      <div className="login-form">
        <div className="title">
          Chào mừng quay lại với <span className="app-name">MH SHOP</span>
        </div>
        <div className="subtitle">Tạo tài khoản của bạn</div>

        {!isRegistered ? (
          <form onSubmit={handleSubmit}>
            {/* Phone */}
            <div className="input-container">
              <label>Số điện thoại:</label>
              <input
                type="text"
                value={phonenumber}
                onChange={(e) => setPhonenumber(e.target.value)}
              />
              {errors.phonenumber && (
                <div className="error">{errors.phonenumber}</div>
              )}
            </div>

            {/* Username */}
            <div className="input-container">
              <label>Tạo tên người dùng:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {errors.username && (
                <div className="error">{errors.username}</div>
              )}
            </div>

            {/* Email */}
            <div className="input-container">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <div className="error">{errors.email}</div>
              )}
            </div>

            {/* Address */}
            <div className="input-container">
              <label>Địa chỉ:</label>
              <input
                type="text"
                value={diaChi}
                onChange={(e) => setDiaChi(e.target.value)}
              />
              {errors.diaChi && (
                <div className="error">{errors.diaChi}</div>
              )}
            </div>

            {/* Password */}
            <div className="input-container">
              <label>Mật khẩu:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <div className="error">{errors.password}</div>
              )}
            </div>

            {/* Re Password */}
            <div className="input-container">
              <label>Xác nhận mật khẩu:</label>
              <input
                type="password"
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
              />
              {errors.rePassword && (
                <div className="error">{errors.rePassword}</div>
              )}
            </div>

            <div className="signup-link">
              Bạn đã có tài khoản?
              <Link to="/login"> Đăng nhập ngay!</Link>
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader size={24} /> : "Tạo tài khoản"}
            </button>
          </form>
        ) : (
          <div className="verify-info text-center">
            <h2 className="font-bold text-lg">📧 Xác thực tài khoản</h2>
            <p>
              Chúng tôi đã gửi mã OTP đến email:
              <strong> {email}</strong>
            </p>
            <p>Mã OTP có hiệu lực trong 10 phút.</p>

            <Link
              to={`/verify-otp?email=${email}`}
              className="text-blue-600 hover:text-blue-400"
            >
              👉 Đi tới trang nhập OTP
            </Link>
          </div>
        )}

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        {errors.apiError && (
          <div className="error">{errors.apiError}</div>
        )}
      </div>
    </div>
  );
}