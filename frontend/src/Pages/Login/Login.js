import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../Api/Api";
import { AuthContext } from "../../Contexts/AuthContext";
import Loader from "../../Components/Loader/Loader";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validatePhoneNumber = (phoneNumber) =>
    /^(0)[3|5|7|8|9][0-9]{8}$/.test(phoneNumber);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!identifier) {
      errs.identifier = "Hãy nhập số điện thoại hoặc email!";
    } else if (!validateEmail(identifier) && !validatePhoneNumber(identifier)) {
      errs.identifier = "Hãy nhập số điện thoại hoặc email hợp lệ!";
    }

    if (!password) {
      errs.password = "Hãy nhập mật khẩu!";
    }

    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      setIsLoggingIn(true);
      const res = await apiService.loginUser({ identifier, password });
      login(res.data.user, res.data.token);

      if (res.data.success) {
        localStorage.setItem("authToken", res.data.token);
        localStorage.setItem("userID", res.data.userID);
        localStorage.setItem("role", res.data.role);

        navigate(res.data.role === "admin" ? "/admin" : "/");
      }
    } catch (error) {
        const status = error?.response?.status;
        const message = error?.response?.data?.message;

        if (status === 403) {
          const emailFromBE = error?.response?.data?.email;
          if (!emailFromBE) {
            setErrors({
              apiError: "Không tìm thấy email xác thực. Vui lòng đăng nhập bằng email.",
            });
            return;
          }
          navigate(`/verify-otp?email=${encodeURIComponent(emailFromBE)}`);
          return;
        }

        // ✅ map lỗi theo message từ BE
        if (status === 400) {
            if (message === "User not found") {
            setErrors({ identifier: "Tài khoản chưa được đăng ký!" });
            return;
            }
            if (message === "Sai mật khẩu") {
            setErrors({ password: "Mật khẩu không chính xác!" });
            return;
            }
        }

        // fallback
        setErrors({ apiError: message || "Đã có lỗi xảy ra. Vui lòng thử lại sau." });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fc] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl px-6 py-8 sm:px-10 sm:py-12">
        {/* TITLE */}
        <h1 className="text-center text-2xl sm:text-3xl font-bold text-[#1e0e4b]">
          Chào mừng quay lại với{" "}
          <span className="text-[#7747ff]">MH SHOP</span>
        </h1>
        <p className="text-center text-gray-600 mt-2 mb-8">
          Đăng nhập vào tài khoản của bạn
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* IDENTIFIER */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại hoặc Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 text-base focus:border-[#7747ff] focus:ring-2 focus:ring-[#7747ff]/30 outline-none"
            />
            {errors.identifier && (
              <p className="text-red-500 text-sm mt-1">
                {errors.identifier}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 text-base focus:border-[#7747ff] focus:ring-2 focus:ring-[#7747ff]/30 outline-none"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full rounded-lg py-3 text-lg font-semibold text-white bg-gradient-to-r from-[#55d2fc] to-[#1e47c1] hover:from-[#251ca2] hover:to-[#ac68ff] transition disabled:opacity-60 flex justify-center"
          >
            {isLoggingIn ? <Loader size={24} /> : "Đăng nhập"}
          </button>
        </form>

        {/* REGISTER */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Bạn chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-semibold text-red-500 hover:text-orange-500"
          >
            Đăng ký ngay!
          </Link>
        </p>

        <p className="text-sm text-center mt-4">
          <Link to="/forgot-password" className="text-blue-600 underline">
            Quên mật khẩu?
          </Link>
        </p>

        {errors.apiError && (
          <p className="text-red-500 text-sm text-center mt-4">
            {errors.apiError}
          </p>
        )}
      </div>
    </div>
  );
}