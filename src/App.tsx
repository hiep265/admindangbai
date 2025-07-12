
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute';
import { AdminLayout } from './components/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { OAuthSuccess } from './pages/OAuthSuccess';
import { OAuthError } from './pages/OAuthError';
import { AdminUsers } from './pages/AdminUsers';
import { AdminPricing } from './pages/AdminPricing';
import { AdminUserSubscriptions } from './pages/AdminUserSubscriptions';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated, isLoading, user } = useAuth();

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
        {/* Admin routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/pricing" element={
          <AdminRoute>
            <AdminLayout>
              <AdminPricing />
            </AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/subscriptions" element={
          <AdminRoute>
            <AdminLayout>
              <AdminUserSubscriptions />
            </AdminLayout>
          </AdminRoute>
        } />

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