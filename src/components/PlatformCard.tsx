import React, { useState } from 'react';
import { Platform, PlatformAccount } from '../types/platform';
import { Calendar, CheckCircle, AlertCircle, Zap, Plus, Edit2, Trash2, User, RefreshCw } from 'lucide-react';
import { backendService } from '../services/backendService';
import { PlatformIcon } from './PlatformIcon';

interface PlatformCardProps {
  platform: Platform;
  accounts: PlatformAccount[];
  onAddAccount: (platformId: string, accountName: string, accessToken: string, profileInfo?: any) => void;
  onUpdateAccount: (accountId: string, updates: Partial<PlatformAccount>) => void;
  onRemoveAccount: (accountId: string) => void;
  authToken?: string;
  onRefreshAccounts?: () => void;
}

// Helper function to safely trim strings
const safeTrim = (val: any) => (typeof val === 'string' ? val.trim() : '');

export const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  accounts,
  onUpdateAccount,
  onRemoveAccount,
  authToken,
  onRefreshAccounts
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [profilePreview, setProfilePreview] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'connected' | 'disconnected'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [lastResponse, setLastResponse] = useState<any>(null);

  const platformAccounts = accounts.filter(acc => acc.platformId === platform.id);

  const handleConnectPlatform = async () => {
    if (!authToken) {
      alert('Vui lòng đăng nhập trước');
      return;
    }

    setIsConnecting(true);
    setValidationStatus('validating');
    
    try {
      let response;
      
      switch (platform.id) {
        case 'facebook':
          response = await backendService.connectFacebook(authToken);
          break;
        case 'youtube':
          response = await backendService.connectYouTube(authToken);
          break;
        case 'instagram':
          const facebookAccounts = accounts.filter(acc => acc.platformId === 'facebook');
          if (facebookAccounts.length === 0) {
            setValidationStatus('invalid');
            setValidationMessage('Vui lòng kết nối Facebook trước khi kết nối Instagram');
            return;
          }
          response = await backendService.connectInstagram(authToken);
          break;
        default:
          setValidationStatus('invalid');
          setValidationMessage('Nền tảng này chưa được hỗ trợ');
          return;
      }
      
      if (response.success) {
        setValidationStatus('valid');
        setValidationMessage(response.message);
        setLastResponse(response);
        
        if (response.data?.auth_url) {
          window.open(response.data.auth_url, '_blank');
          
          setValidationMessage('Đã mở cửa sổ xác thực. Sau khi hoàn thành, hãy quay lại trang này và nhấn nút "Kiểm tra kết nối".');
        }
        
        if (platform.id === 'instagram' && response.data?.ig_user_id) {
          setProfilePreview({
            displayName: 'Instagram Business Account',
            username: 'Connected',
            verified: true
          });
          
          if (onRefreshAccounts) {
            setTimeout(() => {
              onRefreshAccounts();
            }, 2000);
          }
        }
      } else {
        setValidationStatus('invalid');
        setValidationMessage(response.message);
      }
    } catch (error) {
      setValidationStatus('invalid');
      setValidationMessage('Lỗi kết nối mạng');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCheckConnection = async () => {
    if (!authToken) {
      alert('Vui lòng đăng nhập trước');
      return;
    }

    setIsCheckingConnection(true);
    setConnectionStatus('checking');
    setConnectionMessage('Đang kiểm tra kết nối...');

    try {
      let response;
      
      switch (platform.id) {
        case 'facebook':
          response = await backendService.checkFacebookConnection(authToken);
          break;
        case 'instagram':
          response = await backendService.checkInstagramConnection(authToken);
          break;
        case 'youtube':
          if (platformAccounts.length === 0) {
            setConnectionStatus('disconnected');
            setConnectionMessage('Chưa có tài khoản YouTube nào được kết nối');
            return;
          }
          response = await backendService.checkYouTubeConnection(authToken, platformAccounts[0].id);
          break;
        default:
          setConnectionStatus('disconnected');
          setConnectionMessage('Nền tảng này chưa được hỗ trợ');
          return;
      }

      if (response.success) {
        setConnectionStatus('connected');
        setConnectionMessage(`✅ Kết nối ${platform.name} thành công!`);
        
        if (response.data) {
          const details = response.data;
          let detailMessage = `✅ Kết nối ${platform.name} thành công!\n`;
          
          if (details.page_name) {
            detailMessage += `📄 Page: ${details.page_name}\n`;
          }
          if (details.page_id) {
            detailMessage += `🆔 ID: ${details.page_id}\n`;
          }
          if (details.ig_user_id) {
            detailMessage += `📷 Instagram ID: ${details.ig_user_id}\n`;
          }
          if (details.connected) {
            detailMessage += `🔗 Trạng thái: Đã kết nối\n`;
          }
          
          setConnectionMessage(detailMessage);
        }
      } else {
        setConnectionStatus('disconnected');
        setConnectionMessage(`❌ ${response.message}`);
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      setConnectionMessage('❌ Lỗi kiểm tra kết nối');
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const handleRemoveAccount = async (accountId: string) => {
    if (!authToken) {
      alert('Vui lòng đăng nhập trước');
      return;
    }
    if (confirm('Bạn có chắc muốn xóa tài khoản này?')) {
      try {
        const res = await backendService.deleteSocialAccount(authToken, accountId);
        if (res.success) {
          onRemoveAccount(accountId); // Cập nhật lại state phía FE nếu cần
          alert('Xóa tài khoản thành công!');
        } else {
          alert(res.message || 'Xóa tài khoản thất bại!');
        }
      } catch (err) {
        alert('Lỗi kết nối khi xóa tài khoản!');
      }
    }
  };

  const handleEditAccountName = (accountId: string, newName: string) => {
    if (safeTrim(newName)) {
      onUpdateAccount(accountId, { accountName: safeTrim(newName) });
      setEditingAccount(null);
    }
  };

  const getApiVersion = () => {
    const versions = {
      facebook: 'v22.0',
      instagram: 'v19.0',
      youtube: 'v3',
      twitter: 'v2',
      linkedin: 'v2',
      tiktok: 'v1'
    };
    return versions[platform.id as keyof typeof versions] || 'v1';
  };

  const isLatestVersion = () => {
    return platform.id === 'facebook' || platform.id === 'instagram';
  };

  const getConnectionType = () => {
    switch (platform.id) {
      case 'facebook': return 'OAuth 2.0';
      case 'instagram': return 'Facebook Business';
      case 'youtube': return 'OAuth 2.0';
      case 'twitter': return 'OAuth 2.0';
      case 'linkedin': return 'OAuth 2.0';
      default: return 'OAuth 2.0';
    }
  };
 
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className={`h-2 bg-gradient-to-r ${platform.gradient}`}></div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <PlatformIcon platformId={platform.id} size={24} variant="gradient" animated={true} />
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                {platform.name}
                <div className="flex items-center gap-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isLatestVersion() 
                      ? 'bg-green-100 text-green-600 border border-green-200' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    API {getApiVersion()}
                  </span>
                  {isLatestVersion() && (
                    <Zap size={12} className="text-green-500" />
                  )}
                </div>
              </h3>
              <p className={`text-sm flex items-center gap-1 ${platformAccounts.length > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                {platformAccounts.length > 0 ? (
                  <>
                    <CheckCircle size={12} />
                    {platformAccounts.length} tài khoản đã kết nối
                  </>
                ) : (
                  'Chưa kết nối tài khoản'
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {platformAccounts.length > 0 && (
              <button
                onClick={handleCheckConnection}
                disabled={isCheckingConnection}
                className="p-2 text-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                title="Kiểm tra kết nối"
              >
                <RefreshCw size={16} className={isCheckingConnection ? 'animate-spin' : ''} />
              </button>
            )}
            
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-2 text-green-400 hover:text-green-600 transition-colors"
              title="Kết nối tài khoản"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {connectionStatus !== 'idle' && (
          <div className={`mb-4 p-3 rounded-lg border ${
            connectionStatus === 'connected' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : connectionStatus === 'checking'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {connectionStatus === 'checking' && (
                <RefreshCw size={16} className="animate-spin" />
              )}
              {connectionStatus === 'connected' && (
                <CheckCircle size={16} />
              )}
              {connectionStatus === 'disconnected' && (
                <AlertCircle size={16} />
              )}
              <span className="text-sm font-medium whitespace-pre-line">{connectionMessage}</span>
            </div>
          </div>
        )}

        {platformAccounts.length > 0 && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Tài khoản đã kết nối:</h4>
            </div>
            {platformAccounts.map((account) => (
              <div
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {account.profileInfo?.profilePicture ? (
                      <img
                        src={account.profileInfo.profilePicture}
                        alt={account.accountName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={16} className="text-gray-500" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {editingAccount === account.id ? (
                          <input
                            type="text"
                            defaultValue={account.accountName}
                            onBlur={(e) => handleEditAccountName(account.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleEditAccountName(account.id, e.currentTarget.value);
                              }
                              if (e.key === 'Escape') {
                                setEditingAccount(null);
                              }
                            }}
                            className="text-sm font-medium bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {account.accountName}
                          </span>
                        )}
                        
                        {account.profileInfo?.verified && (
                          <div className="flex items-center gap-1 text-blue-500" title="Tài khoản đã xác minh">
                            <CheckCircle size={12} />
                            <span className="text-xs">Đã xác minh</span>
                          </div>
                        )}
                      </div>

                      {account.profileInfo && (
                        <div className="space-y-1">
                          {account.profileInfo.displayName && account.profileInfo.displayName !== account.accountName && (
                            <div className="text-xs text-gray-600 font-medium">
                              {account.profileInfo.displayName}
                            </div>
                          )}
                          
                          {account.profileInfo.username && (
                            <div className="text-xs text-gray-500">
                              @{account.profileInfo.username}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => setEditingAccount(account.id)}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Sửa tên"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleRemoveAccount(account.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Xóa tài khoản"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  
                  {account.lastPost && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar size={10} />
                      <span>Lần cuối: {new Date(account.lastPost).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 text-gray-600">
                    <Plus size={10} />
                    <span>Thêm: {account.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddForm && (
          <div className="mt-4 space-y-3 border-t pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kết nối {platform.name}
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Sử dụng {getConnectionType()} để kết nối an toàn với {platform.name}
              </p>
              
              {platform.id === 'instagram' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-blue-500 mt-0.5" />
                    <div className="text-xs text-blue-700">
                      <strong>Lưu ý:</strong> Instagram yêu cầu kết nối Facebook Business trước. 
                      Vui lòng đảm bảo bạn đã kết nối Facebook và có Instagram Business Account.
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleConnectPlatform}
                disabled={isConnecting || !authToken}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Đang kết nối...
                  </>
                ) : (
                  `Kết nối ${platform.name}`
                )}
              </button>
              
              {validationStatus !== 'idle' && (
                <div className={`mt-2 text-xs flex items-center gap-1 ${
                  validationStatus === 'valid' ? 'text-green-600' : 
                  validationStatus === 'invalid' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {validationStatus === 'validating' && (
                    <div className="animate-spin rounded-full h-3 w-3 border border-blue-500 border-t-transparent"></div>
                  )}
                  {validationStatus === 'valid' && <CheckCircle size={12} />}
                  {validationStatus === 'invalid' && <AlertCircle size={12} />}
                  {validationMessage}
                </div>
              )}

              {validationStatus === 'valid' && lastResponse?.data?.auth_url && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-blue-500 mt-0.5" />
                    <div className="text-xs text-blue-700">
                      <strong>Hướng dẫn:</strong>
                      <ol className="mt-1 space-y-1 list-decimal list-inside">
                        <li>Cửa sổ xác thực đã được mở</li>
                        <li>Hoàn thành quá trình đăng nhập trong cửa sổ đó</li>
                        <li>Quay lại trang này và nhấn nút "Kiểm tra kết nối" (🔄)</li>
                        <li>Hoặc nhấn nút "Làm mới" ở đầu trang</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {profilePreview && validationStatus === 'valid' && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    {profilePreview.profilePicture ? (
                      <img
                        src={profilePreview.profilePicture}
                        alt={profilePreview.displayName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-green-300"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
                        <User size={16} className="text-green-600" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-800 truncate">
                          {profilePreview.displayName}
                        </span>
                        {profilePreview.verified && (
                          <CheckCircle size={12} className="text-blue-500" />
                        )}
                      </div>
                      
                      {profilePreview.username && (
                        <div className="text-xs text-green-600">
                          @{profilePreview.username}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-green-700">
                    ✅ Kết nối thành công với {platform.name}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setValidationStatus('idle');
                  setValidationMessage('');
                  setProfilePreview(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Hủy
              </button>
            </div>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>Kết nối an toàn thông qua:</p>
              <div className="flex items-center gap-2">
                <CheckCircle size={10} className="text-green-500" />
                <span>OAuth 2.0 Authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={10} className="text-green-500" />
                <span>Không lưu trữ mật khẩu</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={10} className="text-green-500" />
                <span>Token tự động refresh</span>
              </div>
              
              <div className={`mt-2 p-2 rounded ${
                isLatestVersion() ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
              }`}>
                <div className="font-medium flex items-center gap-1">
                  API Version: {getApiVersion()}
                  {isLatestVersion() && <Zap size={12} />}
                </div>
                <div className="text-xs mt-1">
                  {isLatestVersion() 
                    ? `Sử dụng API ${platform.name} mới nhất với tính năng nâng cao`
                    : `Sử dụng API ${platform.name} ổn định với chức năng đáng tin cậy`
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {isLatestVersion() && platformAccounts.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-2">
            <div className="flex items-center gap-1 text-green-700 text-xs font-medium mb-1">
              <Zap size={12} />
              Tính năng API mới nhất
            </div>
            <div className="text-xs text-green-600">
              Upload media nâng cao, xử lý lỗi tốt hơn và hiệu suất cải thiện
            </div>
          </div>
        )}
      </div>
    </div>
  );
};