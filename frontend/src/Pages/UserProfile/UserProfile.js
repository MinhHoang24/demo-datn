import React, { useState, useEffect, useContext } from 'react';
import './UserProfile.css';
import apiService from '../../Api/Api';
import { Modal, Input, Button } from 'antd';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [isCurrentPasswordConfirmed, setIsCurrentPasswordConfirmed] = useState(false);
    const [updatedUser, setUpdatedUser] = useState({
        userName: '',
        phoneNumber: '',
        diaChi: '',
        email: ''  // Thêm email vào state cập nhật
    });

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    console.log('Bạn cần đăng nhập để truy cập dữ liệu!');
                    return;
                }
                const response = await apiService.getUserProfile();
                if (response.data) {
                    setUser(response.data.user);
                    setUpdatedUser({
                        userName: response.data.user.userName,
                        phoneNumber: response.data.user.phoneNumber,
                        diaChi: response.data.user.diaChi,
                        email: response.data.user.email || ''  // Lấy email
                    });
                }
            } catch (error) {
                console.error('Failed to fetch user info', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    const handleConfirmCurrentPassword = async () => {
        try {
            const phoneNumber = localStorage.getItem("phoneNumber");
            const response = await apiService.loginUser({
                phoneNumber: phoneNumber,
                password: currentPassword
            });
            if (response.data.success) {
                setError('');
                setIsCurrentPasswordConfirmed(true);
            } else {
                setError('Mật khẩu cũ không đúng');
            }
        } catch (error) {
            setError('Mật khẩu cũ không đúng');
        }
    };

    const handleChangePassword = async () => {
        try {
            await apiService.changePassword(currentPassword, newPassword);
            setShowChangePassword(false);
            setIsCurrentPasswordConfirmed(false);
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            console.error('Error changing password:', error.response ? error.response.data.message : error.message);
            setError('Đổi mật khẩu thất bại');
        }
    };

    const handleUpdateProfile = async () => {
        try {
            await apiService.updateUserProfile(updatedUser);
            setUser({ ...user, ...updatedUser });
            setShowEditProfile(false);
        } catch (error) {
            console.error('Cập nhật thông tin thất bại', error);
        }
    };

    if (isLoading) {
        return <div style={{ paddingTop: "200px", marginLeft: "600px", marginBottom: "200px", fontSize: "25px" }}>Loading...</div>;
    }

    if (!user) {
        return <div style={{ paddingTop: "200px", marginLeft: "600px", marginBottom: "200px", fontSize: "25px" }}>Bạn chưa đăng nhập!</div>;
    }

    return (
        <div className="user-profile-container">
            <div className="user-profile-title">
                <h1>Thông tin người dùng</h1>
            </div>

            <div className="user-profile">
                <p><strong>Tên người dùng: </strong> {user.userName}</p>
                <p><strong>Số điện thoại: </strong> {user.phoneNumber}</p>
                <p><strong>Địa chỉ: </strong>{user.diaChi}</p>
                <p><strong>Email: </strong>{user.email || 'Chưa cập nhật'}</p> {/* Hiển thị email */}
                <div className="user-profile-buttons">
                    <Button type="primary" onClick={() => setShowEditProfile(true)}>Chỉnh sửa thông tin</Button>
                    <Button type="default" onClick={() => setShowChangePassword(true)}>Đổi mật khẩu</Button>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <Modal
                title="Chỉnh sửa thông tin"
                open={showEditProfile}
                onCancel={() => setShowEditProfile(false)}
                footer={null}
            >
                <Input
                    value={updatedUser.userName}
                    onChange={(e) => setUpdatedUser({ ...updatedUser, userName: e.target.value })}
                    placeholder="Tên người dùng"
                    style={{ marginBottom: '10px' }}
                />
                <Input
                    value={updatedUser.phoneNumber}
                    onChange={(e) => setUpdatedUser({ ...updatedUser, phoneNumber: e.target.value })}
                    placeholder="Số điện thoại"
                    style={{ marginBottom: '10px' }}
                />
                <Input
                    value={updatedUser.diaChi}
                    onChange={(e) => setUpdatedUser({ ...updatedUser, diaChi: e.target.value })}
                    placeholder="Địa chỉ"
                    style={{ marginBottom: '10px' }}
                />
                <Input
                    value={updatedUser.email}
                    onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
                    placeholder="Email"
                    style={{ marginBottom: '10px' }}
                    type="email"
                />
                <Button type="primary" onClick={handleUpdateProfile} style={{ marginRight: '10px' }}>Lưu thay đổi</Button>
                <Button onClick={() => setShowEditProfile(false)}>Hủy</Button>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                title="Đổi mật khẩu"
                open={showChangePassword}
                onCancel={() => setShowChangePassword(false)}
                footer={null}
            >
                {!isCurrentPasswordConfirmed ? (
                    <>
                        <Input.Password
                            placeholder="Xác nhận mật khẩu cũ"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            style={{ marginBottom: '10px' }}
                        />
                        <Button type="primary" onClick={handleConfirmCurrentPassword} style={{ marginRight: '10px' }}>Xác nhận</Button>
                        {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
                    </>
                ) : (
                    <>
                        <Input.Password
                            placeholder="Nhập mật khẩu mới"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={{ marginBottom: '10px' }}
                        />
                        <Button type="primary" onClick={handleChangePassword} style={{ marginRight: '10px' }}>Xác nhận</Button>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default UserProfile;