import { useState } from "react";
import apiService from "../../Api/Api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4">Quên mật khẩu</h2>

        <input
          type="email"
          placeholder="Nhập email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-4 py-2 rounded mb-3"
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded">
          {loading ? "Đang gửi..." : "Gửi link reset"}
        </button>

        {message && <p className="text-sm mt-3">{message}</p>}
      </form>
    </div>
  );
}