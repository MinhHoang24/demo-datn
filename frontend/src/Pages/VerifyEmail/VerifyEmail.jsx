import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiService from "../../Api/Api";
import Loader from "../../Components/Loader/Loader";

export default function VerifyEmail() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const token = params.get("token");

    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        if (!token) {
            setIsVerifying(true);
            return;
        }

        apiService.verifyEmail(token)
            .then(() => {
                setTimeout(() => {
                    navigate("/login", { replace: true });
                }, 1000);
            })
            .catch(() => {
                setIsVerifying(true);
            });
    }, [token, navigate]);

    return (
        <>
            {isVerifying ? (
                <Loader className="h-[500px]"/>
            ) : (
                <div className="flex flex-col justify-center items-center h-screen text-center">
                    <p className="text-xl text-red-500 mb-2">❌ Xác nhận email thất bại</p>
                    <p className="text-gray-500">Link không hợp lệ hoặc đã hết hạn</p>
                </div>
            )}
        </>
    );
}