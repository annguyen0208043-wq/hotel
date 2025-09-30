import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import api from '../services/api';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = Cookies.get('access_token');
      const userType = Cookies.get('user_type');
      if (token && userType) {
        // Verify token based on user type
        let profileEndpoint;
        switch (userType) {
          case 'employee':
          case 'admin':
            profileEndpoint = '/api/accounts/employees/profile/';
            break;
          case 'customer':
            profileEndpoint = '/api/accounts/customers/profile/';
            break;
          default:
            throw new Error('Invalid user type');
        }
        const response = await api.get(profileEndpoint);
        setUser({ ...response.data, user_type: userType });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials, userType = 'employee') => {
    try {
      let loginEndpoint;
      switch (userType) {
        case 'employee':
        case 'admin':
          loginEndpoint = '/api/accounts/employees/login/';
          break;
        case 'customer':
          loginEndpoint = '/api/accounts/customers/login/';
          break;
        default:
          throw new Error('Invalid user type');
      }

      const response = await api.post(loginEndpoint, credentials);
      const { access, refresh, user: userData } = response.data;
      
      // Store tokens and user type in cookies
      Cookies.set('access_token', access, { expires: 1 }); // 1 day
      Cookies.set('refresh_token', refresh, { expires: 7 }); // 7 days
      Cookies.set('user_type', userType, { expires: 7 });
      
      setUser({ ...userData, user_type: userType });
      message.success('Đăng nhập thành công!');
      return true;
    } catch (error) {
      message.error('Đăng nhập thất bại. Vui lòng kiểm tra thông tin!');
      return false;
    }
  };

  const logout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('user_type');
    setUser(null);
    message.info('Đã đăng xuất');
  };

  const register = async (userData, userType = 'customer') => {
    try {
      let registerEndpoint;
      switch (userType) {
        case 'customer':
          registerEndpoint = '/api/accounts/customers/register/';
          break;
        default:
          throw new Error('Registration only available for customers');
      }

      await api.post(registerEndpoint, userData);
      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại!';
      message.error(errorMessage);
      return false;
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;