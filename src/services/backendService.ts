import { PlatformAccount, ApiResponse } from '../types/platform';

class BackendService {
  private baseUrl = 'http://localhost:8000/api/v1';

  // Auth methods
  async login(username: string, password: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const data = await response.json();

      if (response.status === 200) {
        return {
          success: true,
          message: 'Đăng nhập thành công!',
          data: {
            access_token: data.access_token,
            user_id: data.user_id,
            email: data.email,
            full_name: data.full_name
          }
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Đăng nhập thất bại'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi kết nối server'
      };
    }
  }

  async register(email: string, password: string, full_name: string, confirm_password: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          full_name: full_name.trim(),
          confirm_password: confirm_password
        })
      });

      const data = await response.json();

      if (response.status === 201) {
        return {
          success: true,
          message: 'Đăng ký thành công! Vui lòng đăng nhập.'
        };
      } else {
        let errorMessage = 'Đăng ký thất bại.';
        
        if (data.detail) {
          if (Array.isArray(data.detail)) {
            errorMessage = data.detail.map((err: any) => err.msg || err.message || err).join(', ');
          } else if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else {
            errorMessage = data.detail.message || 'Dữ liệu không hợp lệ.';
          }
        }
        
        return {
          success: false,
          message: errorMessage
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Có lỗi xảy ra. Vui lòng thử lại.'
      };
    }
  }

  // Platform connection methods
  async connectFacebook(token: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/facebook/connect`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Facebook connection URL generated',
          data: {
            auth_url: data.data.auth_url.toString(),
            state: data.data.state
          }
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Failed to generate Facebook connection URL'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error'
      };
    }
  }

  async connectYouTube(token: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/youtube/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Facebook connection URL generated',
          data: {
            auth_url: data.data.auth_url.toString(),
            state: data.data.state
          }
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Failed to generate YouTube connection URL'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error'
      };
    }
  }

  async connectInstagram(token: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/instagram/connect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Instagram connected successfully',
          data: {
            ig_user_id: data.data.ig_user_id,
            ig_username: data.data.ig_username,
            ig_name: data.data.ig_name,
            account_id: data.data.account_id
          }
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Failed to connect Instagram'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error'
      };
    }
  }

  // Get connected accounts
  async getConnectedAccounts(token: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users/social-accounts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Accounts retrieved successfully',
          data: data.data.accounts
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Failed to get accounts'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error'
      };
    }
  }

  // Check platform connection status
  async checkFacebookConnection(token: string, account_id?: string): Promise<ApiResponse> {
    try {
      const url = account_id 
        ? `${this.baseUrl}/facebook/page-info?account_id=${account_id}`
        : `${this.baseUrl}/facebook/page-info`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Facebook connection status retrieved',
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Failed to check Facebook connection'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error'
      };
    }
  }

  async checkInstagramConnection(token: string, account_id?: string): Promise<ApiResponse> {
    try {
      const url = account_id 
        ? `${this.baseUrl}/instagram/check-connection?account_id=${account_id}`
        : `${this.baseUrl}/instagram/check-connection`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Instagram connection status retrieved',
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Failed to check Instagram connection'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error'
      };
    }
  }

  async checkYouTubeConnection(token: string, account_id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/youtube/channel-info/${account_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'YouTube connection status retrieved',
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Failed to check YouTube connection'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error'
      };
    }
  }

  // Post content methods
  async postToFacebook(token: string, account_id: string, message: string, media?: File[]): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('account_id', account_id);
      formData.append('message', message);

      if (media && media.length > 0) {
        if (media.length === 1) {
          formData.append('image', media[0]);
        } else {
          media.forEach((file, index) => {
            formData.append('image', file);
          });
        }
      }

      const response = await fetch(`${this.baseUrl}/facebook/post`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Posted to Facebook successfully',
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Failed to post to Facebook'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error'
      };
    }
  }

  async postToInstagram(token: string, account_id: string, caption: string, media?: File[]): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('account_id', account_id);
      formData.append('caption', caption);

      if (media && media.length > 0) {
        if (media.length === 1) {
          formData.append('image', media[0]);
        } else {
          media.forEach((file, index) => {
            formData.append('image', file);
          });
        }
      }

      const response = await fetch(`${this.baseUrl}/instagram/post`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Posted to Instagram successfully',
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Failed to post to Instagram'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error'
      };
    }
  }

  async uploadToYouTube(token: string, account_id: string, title: string, description: string, video_file: File): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('account_id', account_id);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('video_file', video_file);

      const response = await fetch(`${this.baseUrl}/youtube/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Uploaded to YouTube successfully',
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Failed to upload to YouTube'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error'
      };
    }
  }

  async getInstagramAccounts(token: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/instagram/accounts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Instagram accounts retrieved successfully',
          data: data.data.accounts
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Failed to get Instagram accounts'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error'
      };
    }
  }

  /**
   * Đặt lịch đăng bài lên các nền tảng
   * @param token Bearer token
   * @param params Các tham số: platforms, account_id, page_id, content_metadata, privacy_status, scheduled_time, video_file, image_files
   */
  async schedulePost(
    token: string,
    params: {
      platforms: string[];
      account_id?: string;
      page_id?: string;
      content_metadata: any;
      privacy_status?: string;
      scheduled_time: string;
      video_file?: File | null;
      image_files?: File[];
    }
  ): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('platforms', params.platforms.join(','));
      if (params.account_id) formData.append('account_id', params.account_id);
      if (params.page_id) formData.append('page_id', params.page_id);
      formData.append('content_metadata', JSON.stringify(params.content_metadata));
      formData.append('privacy_status', params.privacy_status || 'public');
      formData.append('scheduled_time', params.scheduled_time);
      if (params.video_file) {
        formData.append('video_file', params.video_file);
      }
      if (params.image_files && params.image_files.length > 0) {
        params.image_files.forEach((file) => {
          formData.append('image_files', file);
        });
      }
      const response = await fetch(`${this.baseUrl}/schedule/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Đặt lịch thành công',
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Đặt lịch thất bại'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error'
      };
    }
  }

  /**
   * Lấy danh sách lịch đăng bài (có phân trang)
   */
  async getSchedules(token: string, page: number = 1, page_size: number = 5, status?: string, platform?: string): Promise<ApiResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', page_size.toString());
      if (platform) params.append('platform', platform);
      if (status) params.append('status', status);

      const response = await fetch(`${this.baseUrl}/schedule/schedules?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        return {
          success: true,
          message: 'Schedules retrieved successfully',
          data: data.data // data sẽ chứa schedules, total, page, page_size, total_pages
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Failed to get schedules'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error'
      };
    }
  }

  /**
   * Lấy chi tiết một lịch đăng bài
   */
  async getScheduleDetail(token: string, schedule_id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/schedule/schedules/${schedule_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        return {
          success: true,
          message: 'Schedule detail retrieved successfully',
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Failed to get schedule detail'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error'
      };
    }
  }

  /**
   * Xóa tài khoản mạng xã hội
   */
  async deleteSocialAccount(token: string, account_id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users/accounts/${account_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Xóa tài khoản thành công',
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Xóa tài khoản thất bại'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error'
      };
    }
  }

  /**
   * Xóa lịch đăng bài
   */
  async deleteSchedule(token: string, schedule_id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/schedule/schedules/${schedule_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Xóa lịch thành công',
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.detail || 'Xóa lịch thất bại'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error'
      };
    }
  }
}

export const backendService = new BackendService(); 