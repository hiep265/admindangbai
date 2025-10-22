
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute';
import { AdminLayout } from './components/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { OAuthSuccess } from './pages/OAuthSuccess';
import { OAuthError } from './pages/OAuthError';
import { AdminUsers } from './pages/AdminUsers';
import { AdminPricing } from './pages/AdminPricing';
import { AdminUserSubscriptions } from './pages/AdminUserSubscriptions';
import { AdminChatbotPermissions } from './pages/AdminChatbotPermissions';
import { AdminProfile } from './pages/AdminProfile';
import { ServiceManagementPage } from './pages/ServiceManagementPage';
import { useAuth } from './contexts/AuthContext';

// Import các tab components
import DevicesTab from './pages/ChatbotPage/DevicesTab';
import ColorsTab from './pages/ChatbotPage/ColorsTab';
import DeviceColorsTab from './pages/ChatbotPage/DeviceColorsTab';
import DeviceInfosTab from './pages/ChatbotPage/DeviceInfosTab';
import DeviceStorageTab from './pages/ChatbotPage/DeviceStorageTab';
import ChatbotTab from './pages/ChatbotPage/ChatbotTab';
import LinhKienManagementTabs from './pages/ChatbotPage/LinhKienManagementTabs';
import SettingsTab from './pages/ChatbotPage/SettingsTab';
import SystemPromptTab from './pages/ChatbotPage/SystemPromptTab';
import SystemPromptCustomTab from './pages/ChatbotPage/SystemPromptCustomTab';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải ứng dụng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Admin routes using a layout route */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="pricing" element={<AdminPricing />} />
          <Route path="subscriptions" element={<AdminUserSubscriptions />} />
          <Route path="chatbot-permissions" element={<AdminChatbotPermissions />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="service-management" element={<ServiceManagementPage />} />
          {/* Thay thế ChatbotLayout bằng Outlet để các tab con render trực tiếp */}
          <Route path="chatbot" element={<Outlet />}>
            <Route index element={<Navigate to="devices" replace />} />
            <Route path="devices" element={<DevicesTab />} />
            <Route path="device-infos" element={<DeviceInfosTab />} />
            <Route path="colors" element={<ColorsTab />} />
            <Route path="device-colors" element={<DeviceColorsTab />} />
            <Route path="device-storage" element={<DeviceStorageTab />} />
            <Route path="product-components" element={<LinhKienManagementTabs />} />
            <Route path="system-prompt" element={<SystemPromptTab />} />
            <Route path="system-prompt-custom" element={<SystemPromptCustomTab />} />
            <Route path="chat" element={<ChatbotTab />} />
            <Route path="settings" element={<SettingsTab />} />
          </Route>
        </Route>

        {/* Auth routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth/success" element={<OAuthSuccess />} />
        <Route path="/oauth/error" element={<OAuthError />} />
      </Routes>
    </div>
  );
}

export default App;