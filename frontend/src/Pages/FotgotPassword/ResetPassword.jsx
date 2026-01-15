import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiService from "../../Api/Api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiService.resetPassword(token, { password });
      setMessage(res.data.message || "Đặt lại mật khẩu thành công");
      setIsSuccess(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Có lỗi xảy ra");
      setIsSuccess(false);
    }
  };

  // ✅ auto redirect khi thành công
  useEffect(() => {
    if (!isSuccess) return;

    const timer = setTimeout(() => {
      navigate("/login");
    }, 2000); // 2 giây

    return () => clearTimeout(timer);
  }, [isSuccess, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fc] px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4">Đặt lại mật khẩu</h2>

        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-4 py-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <button
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Xác nhận
        </button>

        {message && (
          <p
            className={`text-sm mt-3 ${
              isSuccess ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        {isSuccess && (
          <p className="text-xs text-gray-500 mt-1">
            Đang chuyển về trang đăng nhập...
          </p>
        )}
      </form>
    </div>
  );
}