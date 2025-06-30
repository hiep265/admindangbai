import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, User, Lock } from 'lucide-react';

const BASE_URL = 'http://localhost:8000/api/v1';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [nameMessage, setNameMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isNameLoading, setIsNameLoading] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPassLoading, setIsPassLoading] = useState(false);

  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Đổi tên
  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setNameMessage({ type: 'error', text: 'Vui lòng nhập họ và tên.' });
      return;
    }
    setIsNameLoading(true);
    setNameMessage(null);
    try {
      const res = await fetch(`${BASE_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ full_name: fullName })
      });
      const data = await res.json();
      if (res.status === 200) {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const parsed = JSON.parse(userData);
          parsed.full_name = fullName;
          localStorage.setItem('user_data', JSON.stringify(parsed));
        }
        setNameMessage({ type: 'success', text: 'Đổi tên thành công!' });
      } else {
        setNameMessage({ type: 'error', text: data.detail || 'Đổi tên thất bại.' });
      }
    } catch {
      setNameMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    }
    setIsNameLoading(false);
  };

  // Đổi mật khẩu
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPassMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ thông tin.' });
      return;
    }
    if (newPassword.length < 8) {
      setPassMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 8 ký tự.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }
    setIsPassLoading(true);
    setPassMessage(null);
    try {
      const res = await fetch(`${BASE_URL}/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword
        })
      });
      const data = await res.json();
      if (res.status === 200) {
        setPassMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassMessage({ type: 'error', text: data.detail || 'Đổi mật khẩu thất bại.' });
      }
    } catch {
      setPassMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    }
    setIsPassLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 w-full max-w-5xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Thông tin người dùng</h2>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form đổi tên */}
          <div className="w-full lg:w-1/2 space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2"><User /> Đổi tên</h3>
            {nameMessage && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${nameMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                {nameMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {nameMessage.text}
              </div>
            )}
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập họ và tên mới"
                />
              </div>
              <button
                type="submit"
                disabled={isNameLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-lg disabled:opacity-50"
              >
                {isNameLoading ? 'Đang lưu...' : 'Đổi tên'}
              </button>
            </form>
          </div>

          {/* Form đổi mật khẩu */}
          <div className="w-full lg:w-1/2 space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2"><Lock /> Đổi mật khẩu</h3>
            {passMessage && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${passMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                {passMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {passMessage.text}
              </div>
            )}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu cũ</label>
                <input
                  id="oldPassword"
                  name="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mật khẩu cũ"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Xác nhận mật khẩu mới"
                />
              </div>
              <button
                type="submit"
                disabled={isPassLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold text-lg disabled:opacity-50"
              >
                {isPassLoading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
