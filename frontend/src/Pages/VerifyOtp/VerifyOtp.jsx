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
    <div className="flex justify-center items-center h-screen">
      <div className="login-form w-[360px] text-center">
        <h2 className="text-lg font-bold">🔐 Xác thực OTP</h2>
        <p className="text-sm text-gray-500">
          Nhập mã OTP đã gửi tới email <br />
          <b>{email}</b>
        </p>

        <input
          className="mt-4 w-full text-center tracking-widest"
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="------"
        />

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <button
          className="button-submit mt-4 w-full"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? <Loader size={24} /> : "Xác nhận"}
        </button>
      </div>
    </div>
  );
}