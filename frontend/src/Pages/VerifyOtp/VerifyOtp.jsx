import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiService from "../../Api/Api";
import Loader from "../../Components/Loader/Loader";

export default function VerifyOtp() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const email = params.get("email");

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Mã OTP phải gồm 6 chữ số");
      return;
    }

    try {
      setLoading(true);
      await apiService.verifyOtp({ email, otp });
      navigate("/login", { replace: true });
    } catch {
      setError("Mã OTP không hợp lệ hoặc đã hết hạn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fc] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl px-6 py-8 sm:px-10 sm:py-10 text-center">
        {/* TITLE */}
        <h2 className="text-2xl font-bold text-[#1e0e4b]">
          🔐 Xác thực OTP
        </h2>

        <p className="text-sm text-gray-600 mt-2">
          Nhập mã OTP đã gửi tới email
          <br />
          <span className="font-semibold text-gray-800 break-all">
            {email}
          </span>
        </p>

        {/* OTP INPUT */}
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value.replace(/\D/g, ""));
            setError("");
          }}
          placeholder="------"
          className="mt-6 w-full text-center text-2xl tracking-[0.5em] font-semibold border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7747ff]/40"
        />

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm mt-3">
            {error}
          </p>
        )}

        {/* BUTTON */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className="mt-6 w-full flex justify-center items-center rounded-lg py-3 text-lg font-semibold text-white bg-gradient-to-r from-[#55d2fc] to-[#1e47c1] hover:from-[#251ca2] hover:to-[#ac68ff] transition disabled:opacity-60"
        >
          {loading ? <Loader size={24} /> : "Xác nhận"}
        </button>
      </div>
    </div>
  );
}