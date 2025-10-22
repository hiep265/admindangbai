import { 
  ChatbotService, 
  ChatbotPlan, 
  UserChatbotSubscription, 
  ChatbotPermission,
  ChatbotServiceCreate,
  ChatbotServiceUpdate,
  ChatbotPlanCreate,
  ChatbotPlanUpdate,
  UserChatbotSubscriptionCreate,
  UserChatbotSubscriptionUpdate,
  ChatbotPermissionCreate,
  ChatbotPermissionUpdate
} from '../types/chatbot';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ChatbotServiceClass {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}/api/v1/chatbot-subscriptions${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // Handle 204 No Content responses (no body to parse)
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Chatbot Services
  async getServices(): Promise<ChatbotService[]> {
    return this.request<ChatbotService[]>('/admin/services');
  }

  async createService(data: ChatbotServiceCreate): Promise<ChatbotService> {
    return this.request<ChatbotService>('/admin/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(id: string, data: ChatbotServiceUpdate): Promise<ChatbotService> {
    return this.request<ChatbotService>(`/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteService(id: string): Promise<void> {
    return this.request<void>(`/admin/services/${id}`, {
      method: 'DELETE',
    });
  }

  // Chatbot Plans
  async getPlans(): Promise<ChatbotPlan[]> {
    return this.request<ChatbotPlan[]>('/admin/plans');
  }

  async createPlan(data: ChatbotPlanCreate): Promise<ChatbotPlan> {
    return this.request<ChatbotPlan>('/admin/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePlan(id: string, data: ChatbotPlanUpdate): Promise<ChatbotPlan> {
    return this.request<ChatbotPlan>(`/admin/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePlan(id: string): Promise<void> {
    return this.request<void>(`/admin/plans/${id}`, {
      method: 'DELETE',
    });
  }

  // User Subscriptions
  async getUserSubscriptions(): Promise<UserChatbotSubscription[]> {
    return this.request<UserChatbotSubscription[]>('/admin/subscriptions');
  }

  async getPendingSubscriptions(): Promise<UserChatbotSubscription[]> {
    return this.request<UserChatbotSubscription[]>('/admin/subscriptions/pending');
  }

  async approveSubscription(id: string, notes?: string): Promise<UserChatbotSubscription> {
    return this.request<UserChatbotSubscription>(`/admin/subscriptions/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ status: 'approved', notes }),
    });
  }

  async rejectSubscription(id: string, notes?: string): Promise<UserChatbotSubscription> {
    return this.request<UserChatbotSubscription>(`/admin/subscriptions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ status: 'rejected', notes }),
    });
  }

  async createUserSubscription(data: UserChatbotSubscriptionCreate): Promise<UserChatbotSubscription> {
    return this.request<UserChatbotSubscription>('/admin/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserSubscription(id: string, data: UserChatbotSubscriptionUpdate): Promise<UserChatbotSubscription> {
    return this.request<UserChatbotSubscription>(`/admin/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUserSubscription(id: string): Promise<void> {
    return this.request<void>(`/admin/subscriptions/${id}`, {
      method: 'DELETE',
    });
  }

  // Permissions
  async getPermissions(): Promise<ChatbotPermission[]> {
    return this.request<ChatbotPermission[]>('/admin/permissions');
  }

  async createPermission(data: ChatbotPermissionCreate): Promise<ChatbotPermission> {
    return this.request<ChatbotPermission>('/admin/permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePermission(id: string, data: ChatbotPermissionUpdate): Promise<ChatbotPermission> {
    return this.request<ChatbotPermission>(`/admin/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePermission(id: string): Promise<void> {
    return this.request<void>(`/admin/permissions/${id}`, {
      method: 'DELETE',
    });
  }

  // Public endpoints
  async getAvailablePlans(): Promise<ChatbotPlan[]> {
    return this.request<ChatbotPlan[]>('/plans');
  }

  // Instructions/System Prompt
  async getInstructions(): Promise<Array<{key: string, value: string}>> {
    const CHATBOT_API_URL = import.meta.env.VITE_API_CHATBOT_URL;
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${CHATBOT_API_URL}/instructions`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async updateInstructions(instructions: Array<{key: string, value: string}>): Promise<Array<{key: string, value: string}>> {
    const CHATBOT_API_URL = import.meta.env.VITE_API_CHATBOT_URL;
    const token = localStorage.getItem('auth_token');
    
    // Wrap instructions in the expected format
    const payload = {
      instructions: instructions
    };
    
    const response = await fetch(`${CHATBOT_API_URL}/instructions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // The response should be the updated instructions array
    const responseData = await response.json();
    if (Array.isArray(responseData)) {
      return responseData;
    } else if (responseData.instructions && Array.isArray(responseData.instructions)) {
      return responseData.instructions;
    } else {
      // Fallback: return the original instructions if response format is unexpected
      return instructions;
    }
  }
}

export const chatbotService = new ChatbotServiceClass(); 