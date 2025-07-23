import { useState, useEffect } from 'react';

const BASE_URL = 'http://localhost:8000/api/v1';

interface User {
  id: string;
  email: string;
  full_name: string;
  token: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setAuthState({
          user: { ...user, token },
          isAuthenticated: true,
          isLoading: false
        });
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  }, []);

  const register = async (email: string, password: string, full_name: string, confirm_password: string) => {
    try {
      const response = await fetch(`${BASE_URL}/users/register`, {
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
        return { success: true, message: 'Đăng ký thành công! Vui lòng đăng nhập.' };
      } else if (response.status === 422) {
        let errorMessage = 'Đăng ký thất bại.';
        
        if (data.detail) {
          if (Array.isArray(data.detail)) {
            errorMessage = data.detail.map((err: any) => err.msg || err.message || err).join(', ');
          } else if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else {
            errorMessage = data.detail.message || 'Dữ liệu không hợp lệ.';
          }
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else {
          errorMessage = 'Email có thể đã được sử dụng hoặc dữ liệu không hợp lệ.';
        }
        
        return { success: false, message: errorMessage };
      } else {
        return { 
          success: false, 
          message: `Lỗi server (${response.status}). Vui lòng thử lại sau.` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: 'Có lỗi xảy ra. Vui lòng thử lại.' 
      };
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
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
      console.log("data login: ", data);  

      if (response.status === 200) {
        // Create user object with the response data
        const user: User = {
          id: data.user_id || data.id || 'user_id',
          email: username,
          full_name: data.full_name || 'User',
          token: data.access_token || data.token || 'auth_token'
        };

        // Store auth data
        localStorage.setItem('auth_token', user.token);
        localStorage.setItem('user_data', JSON.stringify({
          id: user.id,
          email: user.email,
          full_name: user.full_name
        }));

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });

        return { success: true, message: 'Đăng nhập thành công!' };
      } else if (response.status === 422) {
        return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu.' };
      } else {
        return { success: false, message: 'Có lỗi xảy ra. Vui lòng thử lại.' };
      }
    } catch (error) {
      return { success: false, message: 'Có lỗi xảy ra. Vui lòng thử lại.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  return {
    ...authState,
    register,
    login,
    logout
  };
};