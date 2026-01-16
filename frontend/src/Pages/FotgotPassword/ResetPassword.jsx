import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiService from "../../Api/Api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* ================= FE VALIDATE ================= */

    // 1️⃣ tối thiểu 6 ký tự
    if (password.length < 6) {
      setMessage("Mật khẩu phải có ít nhất 6 ký tự");
      setIsSuccess(false);
      return;
    }

    // 2️⃣ khớp mật khẩu
    if (password !== confirmPassword) {
      setMessage("Mật khẩu nhập lại không khớp");
      setIsSuccess(false);
      return;
    }

    /* ================= CALL API ================= */

    try {
      setIsLoading(true);
      setMessage("");

      const res = await apiService.resetPassword(token, { password });

      setMessage(res.data.message || "Đặt lại mật khẩu thành công");
      setIsSuccess(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Có lỗi xảy ra");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  // auto redirect
  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => navigate("/login"), 2000);
    return () => clearTimeout(timer);
  }, [isSuccess, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fc] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl px-6 py-8 sm:px-10 sm:py-12">
        <h1 className="text-center text-2xl sm:text-3xl font-bold text-[#1e0e4b]">
          Đặt lại mật khẩu <span className="text-[#7747ff]">MH SHOP</span>
        </h1>

        <p className="text-center text-gray-600 mt-2 mb-8">
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              required
              disabled={isLoading}
              className="w-full rounded-lg border px-4 py-3 text-base
                focus:border-[#7747ff] focus:ring-2 focus:ring-[#7747ff]/30 outline-none"
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhập lại mật khẩu
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              required
              disabled={isLoading}
              className="w-full rounded-lg border px-4 py-3 text-base
                focus:border-[#7747ff] focus:ring-2 focus:ring-[#7747ff]/30 outline-none"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded-lg py-3 text-lg font-semibold text-white
              transition flex items-center justify-center
              ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#55d2fc] to-[#1e47c1] hover:from-[#251ca2] hover:to-[#ac68ff]"
              }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Đang xử lý...
              </span>
            ) : (
              "Xác nhận"
            )}
          </button>
        </form>

        {message && (
          <p
            className={`text-sm text-center mt-4 ${
              isSuccess ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        {isSuccess && (
          <p className="text-xs text-center text-gray-500 mt-1">
            Đang chuyển về trang đăng nhập...
          </p>
        )}
      </div>
    </div>
  );
}