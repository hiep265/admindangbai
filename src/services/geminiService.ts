const API_BASE_MODEL = 'http://localhost:8000/api/v1/ai-model'; // Đổi lại đúng URL backend của bạn
const API_BASE_CONTENT = 'http://localhost:8000/api/v1/generate'; // Đổi lại đúng URL backend của bạn

export type AIModelType = 'gemini' | 'gpt' | string;

function getAuthHeaders() {
  const accessToken = localStorage.getItem('auth_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  return headers;
}

class AIModelService {
  async setApiKey(modelType: AIModelType, apiKey: string, modelName?: string) {
    const res = await fetch(`${API_BASE_MODEL}/config`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        model_type: modelType,
        api_key: apiKey,
        model_name: modelName || null
      })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || 'Failed to save API key');
    }
    return res.json();
  }

  async validateApiKey(modelType: AIModelType, apiKey: string, modelName?: string) {
    const res = await fetch(`${API_BASE_MODEL}/validate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        model_type: modelType,
        api_key: apiKey,
        model_name: modelName || null
      })
    });
    return res.json();
  }

  async getApiKey(modelType: AIModelType) {
    try {
      const res = await fetch(`${API_BASE_MODEL}/switch/${modelType}`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders()
      });
      
      // Nếu response là 400 (Bad Request), có nghĩa là chưa có model nào được cấu hình
      // Trả về null một cách im lặng thay vì throw error
      if (res.status === 400) {
        return null;
      }
      
      if (!res.ok) {
        console.warn(`Failed to get API key for ${modelType}:`, res.status, res.statusText);
        return null;
      }
      
      const data = await res.json();
      // Kiểm tra nếu có current_model và current_model trùng với modelType được yêu cầu
      if (data.data && data.data.current_model === modelType) {
        return data.data;
      }
      return null;
    } catch (error) {
      // Log error một cách im lặng, không throw để tránh hiển thị trên console
      console.warn(`Error getting API key for ${modelType}:`, error);
      return null;
    }
  }

  async checkApiKeyStatus(modelType: AIModelType) {
    try {
      // Sử dụng API switch để kiểm tra trạng thái API key
      const res = await fetch(`${API_BASE_MODEL}/switch/${modelType}`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders()
      });
      
      // Nếu response là 200, có nghĩa là API key đã được cấu hình và switch thành công
      if (res.status === 200) {
        const data = await res.json();
        return data.data || { model_type: modelType, is_configured: true };
      }
      // Nếu response là 400, có nghĩa là chưa có API key cho model này
      if (res.status === 400) {
        console.log('No API key configured for', modelType); // Debug log
        return null;
      }
      // Các trường hợp khác
      if (!res.ok) {
        console.warn(`Failed to check API key status for ${modelType}:`, res.status, res.statusText);
        return null;
      }
      return null;
    } catch (error) {
      console.warn(`Error checking API key status for ${modelType}:`, error);
      return null;
    }
  }

  async clearApiKey(modelType: AIModelType) {
    const res = await fetch(`${API_BASE_MODEL}/config/${modelType}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || 'Failed to remove API key');
    }
    return res.json();
  }

  async generateContent(modelType: AIModelType, prompt: string, modelName?: string): Promise<{ success: boolean; content?: string; error?: string }> {
    // TODO: Nếu backend có endpoint generate, hãy gọi về backend ở đây với model_type, prompt, model_name
    // Đảm bảo truyền header xác thực nếu cần
    return { success: false, error: 'Not implemented: Please implement backend endpoint for content generation.' };
  }

  async getAvailableModels() {
    const res = await fetch(`${API_BASE_MODEL}/available`, {
      method: 'GET',
      // headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch available models');
    return res.json();
  }

  async generateContentWithModel(modelType: AIModelType, prompt: string, platforms: string[] = ['facebook'], config?: any): Promise<{ success: boolean; content?: any; error?: string }> {
    try {
      // Chuẩn bị body theo API mới
      const body: any = {
        prompt,
        platform: platforms,
        model_type: modelType
      };
      if (config) {
        if (config.brand) body.brand = config.brand;
        if (config.systemPrompt) body.system_prompt = config.systemPrompt;
        if (config.hashtags && Array.isArray(config.hashtags)) body.default_tags = config.hashtags;
      }
      const res = await fetch(`${API_BASE_CONTENT}/content`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || data.message || 'Failed to generate content' };
      }
      return { success: true, content: data.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network error' };
    }
  }
}

export const aiModelService = new AIModelService();