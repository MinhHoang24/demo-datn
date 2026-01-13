import React, { useState, useEffect, useContext} from "react";
import "./Login.css";
import { Link } from "react-router-dom";
import apiService from "../../Api/Api";
import { AuthContext } from "../../Contexts/AuthContext";
import { useNavigate } from 'react-router-dom';
import Loader from '../../Components/Loader/Loader.jsx';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const { login } = useContext(AuthContext);
    const [needVerify, setNeedVerify] = useState(false);
    const [resendMessage, setResendMessage] = useState("");
    const navigate = useNavigate();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isResending, setIsResending] = useState(false);  

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const validatePhoneNumber = (phoneNumber) => {
        return /^(0)[3|5|7|8|9][0-9]{8}$/.test(phoneNumber);
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleResendVerify = async () => {
        try {
            setIsResending(true);
            await apiService.resendOtp({ email: identifier });
            setResendMessage("Đã gửi lại mã OTP. Vui lòng kiểm tra email.");
        } catch {
            setResendMessage("Không thể gửi lại OTP. Vui lòng thử lại.");
        } finally {
            setIsResending(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const errors = {};

        if (!identifier) {
            errors.identifier = "Hãy nhập số điện thoại hoặc email!";
        } else {
            // Kiểm tra hợp lệ email hoặc số điện thoại
            if (!validateEmail(identifier) && !validatePhoneNumber(identifier)) {
                errors.identifier = "Hãy nhập số điện thoại hoặc email hợp lệ!";
            }
        }
        if (!password) {
            errors.password = "Hãy nhập mật khẩu!";
        }

        setErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        // Tạo object gửi lên backend
        // Bạn có thể tùy chỉnh backend nhận dạng bằng trường nào
        // Ví dụ ở đây gửi 1 trường chung là "identifier"
        const user = {
            identifier: identifier,
            password: password,
        };

        try {
            setIsLoggingIn(true);
            const response = await apiService.loginUser(user);

            console.log(response.data.success);
            console.log(response.data);

            login(response.data.user, response.data.token);

            if (response.data.success) {
                if (response.data.role === "admin") {
                    localStorage.setItem("authToken", response.data.token);
                    localStorage.setItem("role", response.data.role);
                    navigate("/admin");
                } else {
                    localStorage.setItem("authToken", response.data.token);
                    localStorage.setItem("phoneNumber", response.data.phoneNumber);
                    localStorage.setItem("userID", response.data.userID);
                    localStorage.setItem('isLoggedIn', true);
                    navigate("/");
                }
            } else {
                const newErrors = { ...errors };
                if (response.data.message === "User not found") {
                    newErrors.identifier = "Tài khoản chưa được đăng ký!";
                }
                if (response.data.message === "Invalid password") {
                    newErrors.password = "Mật khẩu không chính xác!";
                }
                setErrors(newErrors);
            }
        } catch (error) {
        if (error.response?.status === 403) {
            setNeedVerify(true);
            navigate(`/verify-otp?email=${identifier}`);
        } else {
            setErrors({ apiError: "Đã có lỗi xảy ra. Vui lòng thử lại sau." });
        }
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="container">
            <div className="login-form">
                <div className="title">Chào mừng quay lại với <span className="app-name">MH SHOP</span></div>
                <div className="subtitle">Đăng nhập vào tài khoản của bạn</div>
                <form onSubmit={handleSubmit}>
                    <div className="input-container">
                        <div>
                            <label htmlFor="identifier">Số điện thoại hoặc Email</label>
                            <input
                                type="text"
                                id="identifier"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                        </div>
                        {errors.identifier && <div className="error">{errors.identifier}</div>}
                    </div>
                    <div className="input-container">
                        <div>
                            <label htmlFor="password">Mật khẩu</label>
                            <input type="password" id="password" onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        {errors.password && <div className="error">{errors.password}</div>}
                    </div>
                    <div className="signup-link">Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay!</Link></div>
                    <button 
                        className="button-submit" 
                        type="submit"
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? <Loader size={24} /> : "Đăng nhập"}
                    </button>
                </form>
                <div>
                    {needVerify && (
                        <div className="verify-warning flex flex-col items-center">
                            <div className="flex gap-1 pt-10 justify-center items-center">
                                <p>Tài khoản chưa được xác thực.</p>
                                <p
                                    className={`underline cursor-pointer ${
                                        isResending
                                            ? "text-gray-400 cursor-not-allowed"
                                            : "text-blue-600 hover:text-blue-300"
                                    }`}
                                    onClick={!isResending ? handleResendVerify : undefined}
                                >
                                    {isResending ? "Đang gửi..." : "Gửi lại mã OTP?"}
                                </p>
                            </div>
                            {resendMessage && <p>{resendMessage}</p>}
                        </div>
                    )}
                    {errors.apiError && <div className="error">{errors.apiError}</div>}
                </div>
            </div>
        </div>
    );
}