import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const BASE_URL = 'http://192.168.1.161:8000/api/v1';

interface User {
  id: string;
  email: string;
  full_name: string;
  token: string;
  role?: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<any>;
  logout: () => void;
  register: (email: string, password: string, full_name: string, confirm_password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    if (token && userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser({ ...userObj, token });
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const formBody = new URLSearchParams();
      formBody.append('username', username);
      formBody.append('password', password);
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString()
      });
      const loginData = await response.json();

      if (response.status === 200 && loginData.access_token) {
        const token = loginData.access_token;

        // Fetch user details from /users/me
        const meResponse = await fetch(`${BASE_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!meResponse.ok) {
          const errorData = await meResponse.json().catch(() => ({ detail: 'Failed to fetch user details.' }));
          throw new Error(errorData.detail);
        }
        
        const meData = await meResponse.json();

        const userObj: User = {
          id: meData.id,
          email: meData.email,
          full_name: meData.full_name || 'User',
          token: token,
          role: meData.role || 'user'
        };

        localStorage.setItem('auth_token', userObj.token);
        localStorage.setItem('user_data', JSON.stringify({
          id: userObj.id,
          email: userObj.email,
          full_name: userObj.full_name,
          role: userObj.role
        }));
        
        setUser(userObj);
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true, message: 'Đăng nhập thành công!' };
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return { success: false, message: loginData.detail || 'Sai tên đăng nhập hoặc mật khẩu.' };
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.';
      return { success: false, message: errorMessage };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const register = useCallback(async (email: string, password: string, full_name: string, confirm_password: string) => {
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
        return { success: false, message: `Lỗi server (${response.status}). Vui lòng thử lại sau.` };
      }
    } catch (error) {
      return { success: false, message: 'Có lỗi xảy ra. Vui lòng thử lại.' };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}; 