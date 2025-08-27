export interface ChatbotService {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface ChatbotPlan {
  id: string;
  name: string;
  description?: string;
  monthly_price: number;
  services: ChatbotService[];
  created_at?: Date;
  updated_at?: Date;
}

export interface UserBasicInfo {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
}

export interface UserChatbotSubscription {
  id: string;
  user_id: string;
  user?: UserBasicInfo;
  plan: ChatbotPlan;
  start_date: Date;
  end_date: Date;
  months_subscribed: number;
  total_price: number;
  is_active: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: Date;
  updated_at?: Date;
}

export interface ChatbotPermission {
  id: string;
  service_id: string;
  service_name: string;
  user_id: string;
  user_email: string;
  user_name: string;
  is_active: boolean;
  granted_at?: Date;
  expires_at?: Date;
}

export interface ChatbotServiceCreate {
  name: string;
  description?: string;
  base_price: number;
}

export interface ChatbotServiceUpdate {
  name?: string;
  description?: string;
  base_price?: number;
}

export interface ChatbotPlanCreate {
  name: string;
  description?: string;
  monthly_price: number;
  service_ids: string[];
}

export interface ChatbotPlanUpdate {
  name?: string;
  description?: string;
  monthly_price?: number;
  service_ids?: string[];
}

export interface UserChatbotSubscriptionCreate {
  plan_id: string;
  months_subscribed: number;
}

export interface ChatbotPermissionCreate {
  service_id: string;
  user_id: string;
  expires_at?: Date;
}

export interface ChatbotPermissionUpdate {
  is_active?: boolean;
  expires_at?: Date;
} 