import { 
  AdminUser, 
  AdminStats, 
  SystemSettings, 
  AdminLog, 
  AdminNotification,
  AdminFilter,
  AdminPagination 
} from '../types/admin';

// const BASE_URL = 'http://localhost:8000/api/v1';
const PUBLIC_URL = "http://localhost:8000/api/v1"

class AdminApiService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${PUBLIC_URL}${endpoint}`, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // Kiểm tra nếu status code là 204 NO_CONTENT thì không parse JSON
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();
    return data;
  }

  // Statistics
  async getStats(): Promise<AdminStats> {
    const response = await this.makeRequest('/admin/stats');
    
    // Transform backend data to frontend format
    const backendData = response.data;
    
    return {
      totalUsers: backendData.total_users,
      activeUsers: backendData.active_users,
      totalPosts: backendData.total_posts,
      totalAccounts: backendData.total_accounts,
      revenue: backendData.revenue,
      platformStats: backendData.platform_stats,
      recentActivity: backendData.recent_activity
    };
  }

  // Users Management
  async getUsers(filter: AdminFilter = {}, pagination: Partial<AdminPagination> = {}): Promise<{ users: AdminUser[], pagination: AdminPagination }> {
    const params = new URLSearchParams();
    
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filter.search) params.append('search', filter.search);
    if (filter.role) params.append('role', filter.role);
    if (filter.status) params.append('status', filter.status);

    const response = await this.makeRequest(`/admin/users?${params.toString()}`);
    
    // The backend now returns a list of users directly
    const users: AdminUser[] = response.map((user: any) => ({
      id: user.id,
      email: user.email,
      username: user.email.split('@')[0],
      fullName: user.full_name,
      role: user.role,
      status: user.is_active ? 'active' : 'suspended',
      createdAt: new Date(user.created_at),
      lastLoginAt: new Date(user.updated_at),
      totalPosts: user.total_posts || 0,
      connectedAccounts: user.connected_accounts || 0,
      subscription: {
        plan: 'free',
        features: ['basic_posting']
      }
    }));

    return {
      users,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        total: users.length, // Assuming the API returns all users for now
        totalPages: Math.ceil(users.length / (pagination.limit || 10))
      }
    };
  }

  async getUserById(id: string): Promise<AdminUser | null> {
    try {
      const user = await this.makeRequest(`/admin/users/${id}`);
      
      return {
        id: user.id,
        email: user.email,
        username: user.email.split('@')[0],
        fullName: user.full_name,
        role: user.role,
        status: user.is_active ? 'active' : 'suspended',
        createdAt: new Date(user.created_at),
        lastLoginAt: new Date(user.updated_at),
        totalPosts: user.total_posts || 0,
        connectedAccounts: user.connected_accounts || 0,
        subscription: {
          plan: 'free',
          features: ['basic_posting']
        }
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    const updateData: any = {};
    
    if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.status !== undefined) updateData.is_active = updates.status === 'active';

    const user = await this.makeRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });

    // Transform and return the updated user from the PUT response
    return {
      id: user.id,
      email: user.email,
      username: user.email.split('@')[0],
      fullName: user.full_name,
      role: user.role,
      status: user.is_active ? 'active' : 'suspended',
      createdAt: new Date(user.created_at),
      lastLoginAt: new Date(user.updated_at),
      totalPosts: user.total_posts || 0,
      connectedAccounts: user.connected_accounts || 0,
      subscription: {
        plan: 'free',
        features: ['basic_posting']
      }
    };
  }

  async deleteUser(id: string): Promise<void> {
    await this.makeRequest(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  }

  // Posts Management
  async getPosts(filter: AdminFilter = {}, pagination: Partial<AdminPagination> = {}): Promise<{ posts: any[], pagination: AdminPagination }> {
    const params = new URLSearchParams();
    
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filter.platform) params.append('platform', filter.platform);
    if (filter.status) params.append('status', filter.status);

    const response = await this.makeRequest(`/admin/posts?${params.toString()}`);
    
    return {
      posts: response.data.posts,
      pagination: response.data.pagination
    };
  }

  // Settings Management (Mock for now, can be extended with real backend)
  async getSettings(category?: string): Promise<SystemSettings[]> {
    // Mock settings for now
    const mockSettings: SystemSettings[] = [
      {
        id: '1',
        key: 'max_posts_per_day',
        value: 50,
        description: 'Maximum posts allowed per day for free users',
        category: 'general',
        updatedAt: new Date(),
        updatedBy: 'admin@example.com'
      },
      {
        id: '2',
        key: 'enable_auto_moderation',
        value: true,
        description: 'Enable automatic content moderation',
        category: 'security',
        updatedAt: new Date(),
        updatedBy: 'admin@example.com'
      },
      {
        id: '3',
        key: 'email_notifications',
        value: true,
        description: 'Enable email notifications for users',
        category: 'notifications',
        updatedAt: new Date(),
        updatedBy: 'admin@example.com'
      }
    ];

    if (category) {
      return mockSettings.filter(setting => setting.category === category);
    }
    return mockSettings;
  }

  async updateSetting(id: string, value: any, updatedBy: string): Promise<SystemSettings> {
    // Mock update for now
    const setting = (await this.getSettings()).find(s => s.id === id);
    if (!setting) {
      throw new Error('Setting not found');
    }
    
    return {
      ...setting,
      value,
      updatedAt: new Date(),
      updatedBy
    };
  }

  // Logs (Mock for now)
  async getLogs(filter: AdminFilter = {}, pagination: Partial<AdminPagination> = {}): Promise<{ logs: AdminLog[], pagination: AdminPagination }> {
    // Mock logs
    const mockLogs: AdminLog[] = [
      {
        id: '1',
        action: 'USER_SUSPENDED',
        userId: 'admin@example.com',
        userEmail: 'admin@example.com',
        targetType: 'user',
        targetId: '4',
        details: { reason: 'Violation of terms of service' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        createdAt: new Date()
      },
      {
        id: '2',
        action: 'SETTING_UPDATED',
        userId: 'admin@example.com',
        userEmail: 'admin@example.com',
        targetType: 'system',
        targetId: '1',
        details: { oldValue: 30, newValue: 50 },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        createdAt: new Date(Date.now() - 3600000)
      }
    ];

    const page = pagination.page || 1;
    const limit = pagination.limit || 20;

    return {
      logs: mockLogs,
      pagination: {
        page,
        limit,
        total: mockLogs.length,
        totalPages: 1
      }
    };
  }

  // Notifications (Mock for now)
  async getNotifications(): Promise<AdminNotification[]> {
    const mockNotifications: AdminNotification[] = [
      {
        id: '1',
        type: 'warning',
        title: 'High Failed Posts Rate',
        message: 'Failed posts rate has increased by 15% in the last 24 hours',
        read: false,
        createdAt: new Date(),
        actionUrl: '/admin/analytics'
      },
      {
        id: '2',
        type: 'info',
        title: 'New User Registration',
        message: '25 new users registered in the last hour',
        read: true,
        createdAt: new Date(Date.now() - 7200000)
      }
    ];

    return mockNotifications;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    // Mock implementation
    console.log(`Marking notification ${id} as read`);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    // Mock implementation
    console.log('Marking all notifications as read');
  }

  async getSubscriptions(filter: AdminFilter = {}, pagination: Partial<AdminPagination> = {}): Promise<{ subscriptions: any[], pagination: AdminPagination }> {
    const params = new URLSearchParams();
    
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filter.search) params.append('search', filter.search);
    if (filter.status) params.append('status', filter.status);

    const response = await this.makeRequest(`/subscriptions?${params.toString()}`);
    
    // Chuyển đổi dữ liệu từ API thành định dạng UserSubscription
    const subscriptions = Array.isArray(response) ? response.map((sub: any) => ({
      id: sub.id,
      userId: sub.user_id,
      planId: sub.subscription_id, // Sử dụng subscription_id từ API làm planId
      status: sub.is_active ? 'active' : 'expired',
      startDate: new Date(sub.start_date),
      endDate: new Date(sub.end_date),
      autoRenew: true, // Giá trị mặc định
      totalPaid: 0, // Giá trị mặc định
      createdAt: new Date(sub.created_at),
      updatedAt: new Date(sub.updated_at),
      // Thêm thông tin người dùng và gói đăng ký
      userName: sub.user?.full_name || sub.user?.email || 'Unknown User',
      userEmail: sub.user?.email || '',
      planName: sub.subscription_plan?.name || 'Unknown Plan',
      planPrice: sub.subscription_plan?.price || 0,
      planPeriod: sub.subscription_plan?.period || 'monthly'
    })) : [];
    
    return {
      subscriptions: subscriptions,
      pagination: {
        page,
        limit,
        total: subscriptions.length,
        totalPages: Math.ceil(subscriptions.length / limit)
      }
    };
  }

  async updateSubscription(id: string, isActive: boolean): Promise<any> {
    // Chuyển đổi dữ liệu từ frontend sang định dạng backend
    const backendUpdates = {
      is_active: isActive
    };
    
    return this.makeRequest(`/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendUpdates)
    });
  }

  async approveSubscription(id: string): Promise<any> {
    return this.makeRequest(`/subscriptions/approve/${id}`, {
      method: 'POST'
    });
  }

  async deleteSubscription(id: string): Promise<void> {
    await this.makeRequest(`/subscriptions/${id}`, {
      method: 'DELETE'
    });
  }

  async getPricingPlans(): Promise<{ plans: any[] }> {
    try {
      const response = await this.makeRequest(`/subscriptions/plans`);
      
      // Nếu không có dữ liệu, trả về mảng rỗng
      if (!response || !Array.isArray(response)) {
        console.warn('API getPricingPlans không trả về mảng dữ liệu:', response);
        return { plans: [] };
      }
      
      // Chuyển đổi dữ liệu từ API thành định dạng PricingPlan
      const plans = response.map((plan: any) => ({
        id: plan.id,
        name: plan.name || 'Unknown Plan',
        price: plan.price || 0,
        period: `/ ${Math.floor(plan.duration_days / 30)} tháng`,
        description: plan.description || '',
        popular: false,
        features: [
          { id: '1', name: 'Số video/ngày', value: `${plan.max_videos_per_day}` },
          { id: '2', name: 'Lên lịch trước tối đa', value: `${plan.max_scheduled_days} ngày` },
          { id: '3', name: 'Số video có thể lưu', value: `${plan.max_stored_videos}` },
          { id: '4', name: 'Dung lượng lưu trữ', value: `${plan.storage_limit_gb}GB` },
          { id: '5', name: 'Tài khoản MXH', value: `${plan.max_social_accounts}` },
          { id: '6', name: 'Hỗ trợ AI', value: plan.ai_content_generation ? '✅ Full' : '❌ Không' }
        ],
        maxUsers: 1,
        maxPostsPerDay: plan.max_videos_per_day,
        maxStorageGB: plan.storage_limit_gb,
        is_active: plan.is_active,
        createdAt: plan.created_at ? new Date(plan.created_at) : new Date(),
        updatedAt: plan.updated_at ? new Date(plan.updated_at) : new Date()
      }));
      
      return { plans };
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      return { plans: [] };
    }
  }

  async createPricingPlan(planData: any): Promise<any> {
    try {
      // Chuyển đổi dữ liệu từ frontend sang định dạng backend
      const backendPlan = {
        name: planData.name,
        description: planData.description,
        price: planData.price,
        duration_days: planData.duration_days || 30,
        max_videos_per_day: planData.maxPostsPerDay || 3,
        max_scheduled_days: planData.max_scheduled_days || 7,
        max_stored_videos: planData.max_stored_videos || 30,
        storage_limit_gb: planData.maxStorageGB || 5,
        max_social_accounts: planData.max_social_accounts || 5,
        ai_content_generation: planData.ai_content_generation !== undefined ? planData.ai_content_generation : true,
        is_active: planData.is_active !== undefined ? planData.is_active : true
      };
      
      return await this.makeRequest(`/subscriptions/plans`, {
        method: 'POST',
        body: JSON.stringify(backendPlan)
      });
    } catch (error) {
      console.error('Error creating pricing plan:', error);
      throw error;
    }
  }

  async updatePricingPlan(id: string, planData: any): Promise<any> {
    try {
      // Chuyển đổi dữ liệu từ frontend sang định dạng backend
      const backendPlan: any = {};
      
      if (planData.name !== undefined) backendPlan.name = planData.name;
      if (planData.description !== undefined) backendPlan.description = planData.description;
      if (planData.price !== undefined) backendPlan.price = planData.price;
      if (planData.duration_days !== undefined) backendPlan.duration_days = planData.duration_days;
      if (planData.maxPostsPerDay !== undefined) backendPlan.max_videos_per_day = planData.maxPostsPerDay;
      if (planData.max_scheduled_days !== undefined) backendPlan.max_scheduled_days = planData.max_scheduled_days;
      if (planData.max_stored_videos !== undefined) backendPlan.max_stored_videos = planData.max_stored_videos;
      if (planData.maxStorageGB !== undefined) backendPlan.storage_limit_gb = planData.maxStorageGB;
      if (planData.max_social_accounts !== undefined) backendPlan.max_social_accounts = planData.max_social_accounts;
      if (planData.ai_content_generation !== undefined) backendPlan.ai_content_generation = planData.ai_content_generation;
      if (planData.is_active !== undefined) backendPlan.is_active = planData.is_active;
      
      return await this.makeRequest(`/subscriptions/plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(backendPlan)
      });
    } catch (error) {
      console.error('Error updating pricing plan:', error);
      throw error;
    }
  }

  async deletePricingPlan(id: string): Promise<void> {
    try {
      await this.makeRequest(`/subscriptions/plans/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting pricing plan:', error);
      throw error;
    }
  }
}

export const adminApiService = new AdminApiService();