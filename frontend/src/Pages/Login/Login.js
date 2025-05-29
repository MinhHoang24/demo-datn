import React, { useState, useEffect, useContext} from "react";
import "./Login.css";
import { Link } from "react-router-dom";
import apiService from "../../Api/Api";
import { AuthContext } from "../../Contexts/AuthContext";
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [phonenumber, setPhonenumber] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const { login } = useContext(AuthContext);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const navigate = useNavigate();

    const validatePhoneNumber = (phoneNumber) => {
        return /^(0)[3|5|7|8|9][0-9]{8}$/.test(phoneNumber);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const errors = {};

        if (!phonenumber) {
            errors.phonenumber = "Hãy nhập số điện thoại";
        } else if (!validatePhoneNumber(phonenumber)) {
            errors.phonenumber = "Hãy nhập số điện thoại hợp lệ!";
        }
        if (!password) {
            errors.password = "Hãy nhập mật khẩu!";
        }

        setErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        const user = {
            phoneNumber: phonenumber,
            password: password,
        };

        try {
            const response = await apiService.loginUser(user)
              
            // console.log(user.phoneNumber);
            // console.log(user.password);
            console.log(response.data.success);
            console.log(response.data);
            
            login(response.data.user, response.data.token);
            
            if (response.data.success) {
                if (response.data.role === "admin") {
                    // Lưu token vào localStorage
                    localStorage.setItem("authToken", response.data.token); 

                    // Cập nhật role vào localStorage 
                    localStorage.setItem("role", response.data.role);
                    
                    navigate ("/admin"); // Chuyển hướng đến trang admin
                }   
                 else {
                    localStorage.setItem("authToken", response.data.token);

                    localStorage.setItem("phoneNumber", response.data.phoneNumber);

                    localStorage.setItem("userID", response.data.userID);

                    localStorage.setItem('isLoggedIn', true); // Lưu trạng thái đăng nhập

                    navigate("/");// Chuyển hướng đến trang chủ
                }
            } else {
                const newErrors = { ...errors };
                if (response.data.message === "User not found") {
                    newErrors.phonenumber = "Số điện thoại chưa được đăng ký!";
                }
                if (response.data.message === "Invalid password") {
                    newErrors.password = "Mật khẩu không chính xác!";
                }
                setErrors(newErrors);
            }
        } catch (error) {
            console.error("Error during login:", error);
            setErrors({ apiError: "Đã có lỗi xảy ra. Vui lòng thử lại sau." });
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
                            <label htmlFor="phonenumber">Số điện thoại</label>
                            <input type="text" id="phonenumber" onChange={(e) => setPhonenumber(e.target.value)} />
                        </div>
                        {errors.phonenumber && <div className="error">{errors.phonenumber}</div>}
                    </div>
                    <div className="input-container">
                        <div>
                            <label htmlFor="password">Mật khẩu</label>
                            <input type="password" id="password" onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        {errors.password && <div className="error">{errors.password}</div>}
                    </div>
                    <div className="signup-link">Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay!</Link></div>

                    <button className="button-submit" type="submit">Đăng nhập</button>
                </form>
                {errors.apiError && <div className="error">{errors.apiError}</div>} {/* Hiển thị lỗi từ API */}
            </div>
        </div>
    );
}