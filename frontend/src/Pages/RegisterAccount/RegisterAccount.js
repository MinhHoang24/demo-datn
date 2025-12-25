import { useState } from "react";
import { Link } from "react-router-dom";
import apiService from "../../Api/Api";
import "./RegisterAccount.css";
import Loader from '../../Components/Loader/Loader.jsx';

export default function RegisterPage() {
    const [phonenumber, setPhonenumber] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [diaChi, setDiaChi] = useState(""); // Thêm state địa chỉ
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [isRegistered, setIsRegistered] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validatePhoneNumber = (phoneNumber) => {
        return /^(0)[3|5|7|8|9][0-9]{8}$/.test(phoneNumber);
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

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
        }
        if (password.length < 6) {
            validationErrors.password = "Mật khẩu phải có ít nhất 6 ký tự!";
        }
        if (!rePassword) {
            validationErrors.rePassword = "Hãy xác nhận mật khẩu!";
        } else if (password !== rePassword) {
            validationErrors.rePassword = "Hãy xác nhận lại mật khẩu!";
        }

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            const newUser = {
                userName: username,
                phoneNumber: phonenumber,
                email: email,
                diaChi: diaChi,  // Gửi địa chỉ lên backend
                password: password,
            };

            const savedUser = await addUser(newUser);

            if (savedUser) {
                setIsRegistered(true);
                setSuccessMessage(
                    "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản trước khi đăng nhập."
                );
            } else {
                console.log('Đã xảy ra lỗi khi thêm người dùng.');
            }
        }
    };

    const addUser = async (newUser) => {
    try {
        setIsSubmitting(true);
        const response = await apiService.registerUser(newUser);

        if (response.data.success) {
            return response.data.user;
        } else {
            // Kiểm tra theo mã lỗi trả về từ backend
            if (response.data.message === "Số điện thoại đã được sử dụng!") {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    phonenumber: "Số điện thoại đã được sử dụng!",
                }));
            } else if (response.data.message === "Email đã được sử dụng!") {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    email: "Email đã được sử dụng!",
                }));
            } else {
                // Nếu có thông báo lỗi khác, trả về lỗi chung
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    apiError: response.data.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
                }));
            }
        }
    } catch (error) {
        console.error('Error occurred while registering user:', error);
        
        // Nếu có lỗi từ server, thông báo lỗi tổng quát
        setErrors({ apiError: "Đã có lỗi xảy ra. Vui lòng thử lại sau." });
        return null;
    } finally {
        setIsSubmitting(false);
    }
};


    return (
        <div className="register-container">
            <div className="login-form">
                <div className="title">Chào mừng quay lại với <span className="app-name">MH SHOP</span></div>
                <div className="subtitle">Tạo tài khoản của bạn</div>
                {!isRegistered ? (
                    <form onSubmit={handleSubmit}>
                        {/* Số điện thoại */}
                        <div className="input-container">
                            <div>
                                <label htmlFor="phonenumber">Số điện thoại:</label>
                                <input
                                    type="text"
                                    id="phonenumber"
                                    value={phonenumber}
                                    onChange={(e) => setPhonenumber(e.target.value)}
                                />
                            </div>
                            {errors.phonenumber && <div className="error">{errors.phonenumber}</div>}
                        </div>

                        {/* Tên người dùng */}
                        <div className="input-container">
                            <div>
                                <label htmlFor="username">Tạo tên người dùng:</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            {errors.username && <div className="error">{errors.username}</div>}
                        </div>

                        {/* Email */}
                        <div className="input-container">
                            <div>
                                <label htmlFor="email">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            {errors.email && <div className="error">{errors.email}</div>}
                        </div>

                        {/* Địa chỉ */}
                        <div className="input-container">
                            <div>
                                <label htmlFor="diachi">Địa chỉ:</label>
                                <input
                                    type="text"
                                    id="diachi"
                                    value={diaChi}
                                    onChange={(e) => setDiaChi(e.target.value)}
                                />
                            </div>
                            {errors.diaChi && <div className="error">{errors.diaChi}</div>}
                        </div>

                        {/* Mật khẩu */}
                        <div className="input-container">
                            <div>
                                <label htmlFor="password">Mật khẩu:</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            {errors.password && <div className="error">{errors.password}</div>}
                        </div>

                        {/* Xác nhận mật khẩu */}
                        <div className="input-container">
                            <div>
                                <label htmlFor="re-password">Xác nhận mật khẩu:</label>
                                <input
                                    type="password"
                                    id="re-password"
                                    value={rePassword}
                                    onChange={(e) => setRePassword(e.target.value)}
                                />
                            </div>
                            {errors.rePassword && <div className="error">{errors.rePassword}</div>}
                        </div>

                        <div className="signup-link">
                            Bạn đã có tài khoản?
                            <Link to="/login"> Đăng nhập ngay!</Link>
                        </div>

                        <button 
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader size={24} /> : "Tạo tài khoản"}
                        </button>
                    </form>
                ) : (
                    <div className="verify-info">
                        <h2 className="font-bold">📧 Xác nhận email</h2>
                        <p>
                            Chúng tôi đã gửi email xác nhận đến:
                            <strong> {email}</strong>
                        </p>
                        <p>Vui lòng kiểm tra hộp thư và click vào link xác nhận.</p>
                        <p>Sau khi xác nhận, bạn có thể quay lại đăng nhập.</p>

                        <Link 
                            to="/login" 
                            className="pb-4 hover:text-blue-300 text-blue-600"
                        >
                            👉 Đi tới trang đăng nhập
                        </Link>
                    </div>
                )}
                
                {successMessage && <div className="success-message">{successMessage}</div>}
                {errors.apiError && <div className="error">{errors.apiError}</div>}
            </div>
        </div>
    );
}