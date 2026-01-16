import { useState, useEffect } from "react";
import apiService from "../../Api/Api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await apiService.forgotPassword({ email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fc] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl px-6 py-8 sm:px-10 sm:py-12">
        {/* TITLE */}
        <h1 className="text-center text-2xl sm:text-3xl font-bold text-[#1e0e4b]">
          Quên mật khẩu{" "}
          <span className="text-[#7747ff]">MH SHOP</span>
        </h1>
        <p className="text-center text-gray-600 mt-2 mb-8">
          Nhập email để nhận link đặt lại mật khẩu
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 text-base
                focus:border-[#7747ff] focus:ring-2 focus:ring-[#7747ff]/30 outline-none"
              placeholder="example@gmail.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-3 text-lg font-semibold text-white
              bg-gradient-to-r from-[#55d2fc] to-[#1e47c1]
              hover:from-[#251ca2] hover:to-[#ac68ff]
              transition disabled:opacity-60"
          >
            {loading ? "Đang gửi..." : "Gửi link reset"}
          </button>
        </form>

        {message && (
          <p className="text-sm text-center mt-4 text-gray-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}