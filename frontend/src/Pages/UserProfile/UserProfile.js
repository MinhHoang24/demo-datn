import React, { useState, useEffect } from 'react';
import './UserProfile.css';
import apiService from '../../Api/Api';
import Noti from "../../Components/NotificationService/NotificationService";
import { Modal, Input, Button } from 'antd';
import Loader from "../../Components/Loader/Loader";

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [updatedUser, setUpdatedUser] = useState({
        userName: '',
        phoneNumber: '',
        diaChi: '',
        email: ''
    });

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setUser(null);
                return;
            }

            const response = await apiService.getUserProfile();
            if (response.data?.user) {
                setUser(response.data.user);
                setUpdatedUser({
                userName: response.data.user.userName,
                phoneNumber: response.data.user.phoneNumber,
                diaChi: response.data.user.diaChi,
                email: response.data.user.email || ''
                });
            }
            } catch (error) {
            setUser(null);
            } finally {
            setIsAuthLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        Noti.error("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    if (newPassword !== confirmNewPassword) {
        Noti.error("Mật khẩu mới không khớp");
        return;
    }

    try {
        setIsChangingPassword(true);

        await apiService.changePassword(currentPassword, newPassword);

        Noti.success("Đổi mật khẩu thành công!");
        setShowChangePassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
    } catch (error) {
        Noti.error(
        error?.response?.data?.message || "Đổi mật khẩu thất bại"
        );
    } finally {
        setIsChangingPassword(false);
    }
    };

    const handleUpdateProfile = async () => {
        try {
            await apiService.updateUserProfile(updatedUser);
            setUser({ ...user, ...updatedUser });
            Noti.success('Cập nhật thông tin thành công!');
            setShowEditProfile(false);
        } catch (error) {
            console.error('Cập nhật thông tin thất bại', error);
            Noti.error('Cập nhật thông tin thất bại!');
        }
    };

    if (isAuthLoading) {
    return (
        <div style={{ padding: 200, textAlign: 'center', fontSize: 22 }}>
            <Loader />
        </div>
    );
    }

    if (!user) {
    return (
        <div style={{ padding: 200, textAlign: 'center', fontSize: 22 }}>
        Bạn chưa đăng nhập!
        </div>
    );
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
                <p><strong>Email: </strong>{user.email || 'Chưa cập nhật'}</p>
                <div className="user-profile-buttons">
                    <Button type="primary" onClick={() => setShowEditProfile(true)}>Chỉnh sửa thông tin</Button>
                    <Button type="primary" onClick={() => setShowChangePassword(true)}>Đổi mật khẩu</Button>
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
            <Input.Password
                placeholder="Mật khẩu hiện tại"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ marginBottom: 10 }}
            />

            <Input.Password
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ marginBottom: 10 }}
            />

            <Input.Password
                placeholder="Nhập lại mật khẩu mới"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                style={{ marginBottom: 16 }}
            />

            <Button
                type="primary"
                loading={isChangingPassword}
                disabled={isChangingPassword}
                onClick={handleChangePassword}
                block
            >
                Đổi mật khẩu
            </Button>
            </Modal>
        </div>
    );
};

export default UserProfile;