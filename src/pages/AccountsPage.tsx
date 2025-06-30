import React, { useState, useEffect } from 'react';
import { PlatformCard } from '../components/PlatformCard';
import { PlatformIcon } from '../components/PlatformIcon';
import { Platform, PlatformAccount } from '../types/platform';
import { Users, Plus, CheckCircle } from 'lucide-react';
import { backendService } from '../services/backendService';

interface AccountsPageProps {
  platforms: Platform[];
  accounts: PlatformAccount[];
  onAddAccount: (platformId: string, accountName: string, accessToken: string, profileInfo?: any) => void;
  onUpdateAccount: (accountId: string, updates: Partial<PlatformAccount>) => void;
  onRemoveAccount: (accountId: string) => void;
  getAccountsByPlatform: (platformId: string) => PlatformAccount[];
  authToken?: string;
  fetchAccountsFromBackend: (backendAccounts: any[]) => void;
}

export const AccountsPage: React.FC<AccountsPageProps> = ({
  platforms,
  accounts,
  onAddAccount,
  onUpdateAccount,
  onRemoveAccount,
  authToken,
  fetchAccountsFromBackend
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');
  const [highlightAccountId, setHighlightAccountId] = useState<string | null>(null);

  useEffect(() => {
    if (authToken) {
      refreshAccounts();
    }
    // eslint-disable-next-line
  }, [authToken]);

  useEffect(() => {
    const lastPlatform = localStorage.getItem('lastConnectedPlatform');
    if (lastPlatform) {
      const accountsOfPlatform = accounts.filter(acc => acc.platformId === lastPlatform);
      if (accountsOfPlatform.length > 0) {
        const newest = accountsOfPlatform.reduce((a, b) =>
          new Date(a.createdAt) > new Date(b.createdAt) ? a : b
        );
        setHighlightAccountId(newest.id);
      }
      localStorage.removeItem('lastConnectedPlatform');
    }
  }, [accounts]);

  const connectedAccounts = accounts.filter(acc => acc.connected);
  const connectedPlatforms = [...new Set(connectedAccounts.map(acc => acc.platformId))];

  const refreshAccounts = async () => {
    if (!authToken) return;
    setIsRefreshing(true);
    setRefreshMessage('Đang cập nhật danh sách tài khoản...');
    try {
      const response = await backendService.getConnectedAccounts(authToken);
      if (response.success && response.data) {
        fetchAccountsFromBackend(response.data);
        setRefreshMessage('✅ Cập nhật thành công!');
        setTimeout(() => setRefreshMessage(''), 3000);
      } else {
        setRefreshMessage('❌ Không thể cập nhật danh sách tài khoản');
        setTimeout(() => setRefreshMessage(''), 3000);
      }
    } catch (error) {
      setRefreshMessage('❌ Lỗi kết nối server');
      setTimeout(() => setRefreshMessage(''), 3000);
    } finally {
      setIsRefreshing(false);
    }
  };
  

return (
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
    {/* Hero Section */}
    <div className="text-center space-y-4">
      <h2 className="text-5xl font-extrabold text-gray-900 tracking-tight">Quản lý tài khoản</h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
        Kết nối và quản lý tất cả tài khoản mạng xã hội của bạn tại một nơi. Thêm nhiều tài khoản 
        cho mỗi nền tảng và kiểm soát toàn bộ sự hiện diện mạng xã hội từ một bảng điều khiển duy nhất.
      </p>
    </div>

    {/* Refresh Status */}
    {refreshMessage && (
      <div className={`transition-all duration-300 shadow-sm border rounded-lg p-4 ${
        refreshMessage.includes('✅') 
          ? 'bg-green-50 border-green-300 text-green-800' 
          : 'bg-red-50 border-red-300 text-red-800'
      }`}>
        <div className="flex items-center gap-3">
          {isRefreshing && (
            <div className="animate-spin h-5 w-5 rounded-full border-2 border-current border-t-transparent"></div>
          )}
          <span className="font-medium text-sm">{refreshMessage}</span>
        </div>
      </div>
    )}

    {/* Stats Overview */}
    <section>
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="bg-blue-100 w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center shadow">
              <Users className="text-blue-600" size={26} />
            </div>
            <div className="text-3xl font-bold">{connectedAccounts.length}</div>
            <p className="text-sm text-gray-600">Tài khoản đã kết nối</p>
          </div>

          <div>
            <div className="bg-green-100 w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center shadow">
              <CheckCircle className="text-green-600" size={26} />
            </div>
            <div className="text-3xl font-bold">{platforms.length}</div>
            <p className="text-sm text-gray-600">Nền tảng được hỗ trợ</p>
          </div>
          <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">👥</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">∞</div>
              <div className="text-sm text-gray-600">Tài khoản được chia sẻ</div>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="text-yellow-600" size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-900">∞</div>
              <div className="text-sm text-gray-600">Tài khoản mỗi nền tảng</div>
            </div>
        </div>
      </div>
    </section>

    {/* Platform Connections */}
    <section>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Kết nối nền tảng</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => (
          <PlatformCard
            key={platform.id}
            platform={platform}
            accounts={accounts}
            onAddAccount={onAddAccount}
            onUpdateAccount={onUpdateAccount}
            onRemoveAccount={onRemoveAccount}
            authToken={authToken}
          />
        ))}
      </div>
    </section>

    {/* Connected Accounts List */}
    <section>
      <h3 className="text-xl font-bold text-gray-900 mb-4">Tài khoản đã kết nối</h3>
      {connectedAccounts.length === 0 ? (
        <p className="text-gray-500">Chưa có tài khoản nào được kết nối.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {connectedAccounts.map(acc => (
            <div key={acc.id} className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-4">
              <div className="flex items-center gap-3">
                {acc.profileInfo?.profilePicture ? (
                  <img src={acc.profileInfo.profilePicture} alt={acc.accountName} className="w-12 h-12 rounded-full object-cover shadow" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xl text-gray-700">
                    {acc.accountName[0]}
                  </div>
                )}
                <PlatformIcon platformId={acc.platformId} size={20} showBackground={false} className="text-gray-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-800">{acc.accountName}</div>
                <div className="text-sm text-gray-500">{acc.platformName}</div>
                {acc.profileInfo?.username && (
                  <div className="text-xs text-gray-400">@{acc.profileInfo.username}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>

    {/* Getting Started Guide */}
    {connectedAccounts.length === 0 && (
      <section className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-8 border border-yellow-300 shadow">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Bắt đầu</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700 text-sm">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2 font-semibold">
                <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">1</div>
                Chọn nền tảng
              </div>
              <p>Nhấp vào bất kỳ thẻ nền tảng nào ở trên để bắt đầu kết nối tài khoản của bạn...</p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2 font-semibold">
                <div className="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center">2</div>
                Xác thực OAuth
              </div>
              <p>Sử dụng OAuth 2.0 để kết nối an toàn và trực tiếp với nền tảng.</p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2 font-semibold">
                <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center">3</div>
                Kết nối & Xác minh
              </div>
              <p>Sau khi xác thực, hệ thống sẽ tự động xác minh và lấy thông tin hồ sơ.</p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2 font-semibold">
                <div className="bg-yellow-100 w-8 h-8 rounded-full flex items-center justify-center">4</div>
                Bắt đầu đăng bài
              </div>
              <p>Bây giờ bạn có thể tạo và lên lịch bài viết từ một bảng điều khiển duy nhất.</p>
            </div>
          </div>
        </div>
      </section>
    )}
  </main>
);
}
