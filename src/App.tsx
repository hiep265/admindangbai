
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute';
import { AdminLayout } from './components/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { OAuthSuccess } from './pages/OAuthSuccess';
import { OAuthError } from './pages/OAuthError';
import { AdminUsers } from './pages/AdminUsers';
import { AdminPricing } from './pages/AdminPricing';
import { AdminUserSubscriptions } from './pages/AdminUserSubscriptions';
import { usePlatforms } from './hooks/usePlatforms';
import { usePosts } from './hooks/usePosts';
import { useScheduler } from './hooks/useScheduler';
import { useAuth } from './contexts/AuthContext';
import { apiService } from './services/apiService';
import { validateMediaForPlatform } from './utils/mediaUtils';

function App() {
  const { platforms, accounts, addAccount, updateAccount, removeAccount, getAccountsByPlatform, fetchAccountsFromBackend } = usePlatforms();
  const { posts, addPost, deletePost, updatePost } = usePosts();
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Initialize auto scheduler
  const { isSchedulerActive } = useScheduler({ posts, updatePost });

  const connectedAccounts = accounts.filter(acc => acc.connected);

  const handleCreatePost = async (postData: any) => {
    const post = addPost(postData);
    
    // If it's not scheduled, post immediately
    if (!post.scheduledTime) {
      updatePost(post.id, { status: 'posting' });
      
      // Filter accounts based on media compatibility
      const compatibleAccounts = post.platforms.filter(account => {
        if (!post.media || post.media.length === 0) return true;
        const errors = validateMediaForPlatform(post.media, account.platformId);
        return errors.length === 0;
      });

      if (compatibleAccounts.length === 0) {
        updatePost(post.id, { 
          status: 'failed',
          error: 'No compatible accounts for media files'
        });
        return;
      }

      const results = await Promise.allSettled(
        compatibleAccounts.map(account => 
          apiService.postToPlatform(account, post.content, post.media)
        )
      );

      const allSuccessful = results.every(result => 
        result.status === 'fulfilled' && result.value.success
      );

      // Collect post URLs and errors
      const postUrls: { [key: string]: string } = {};
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (result.value.success && result.value.data?.url) {
            postUrls[compatibleAccounts[index].id] = result.value.data.url;
          } else {
            errors.push(`${compatibleAccounts[index].accountName}: ${result.value.message}`);
          }
        } else {
          errors.push(`${compatibleAccounts[index].accountName}: Network error`);
        }
      });

      updatePost(post.id, { 
        status: allSuccessful ? 'posted' : 'failed',
        postUrls: Object.keys(postUrls).length > 0 ? postUrls : undefined,
        error: errors.length > 0 ? errors.join('; ') : undefined,
        postedAt: new Date()
      });
    }
  };

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
              <AdminUsers /> {/* Thay đổi từ AdminDashboard sang AdminUsers */}
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
        {/* Đã ẩn route Analytics */}
        {/* <Route path="/admin/analytics" element={
          <AdminRoute>
            <AdminLayout>
              <AdminAnalytics />
            </AdminLayout>
          </AdminRoute>
        } /> */}
        {/* Đã ẩn route Platforms */}
        {/* <Route path="/admin/platforms" element={
          <AdminRoute>
            <AdminLayout>
              <AdminPlatforms />
            </AdminLayout>
          </AdminRoute>
        } /> */}
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
        {/* Đã ẩn route Settings */}
        {/* <Route path="/admin/settings" element={
          <AdminRoute>
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </AdminRoute>
        } /> */}

        {/* Chỉ giữ lại trang đăng nhập và đăng ký */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth/success" element={<OAuthSuccess />} />
        <Route path="/oauth/error" element={<OAuthError />} />
      </Routes>
    </div>
  );
}

export default App;