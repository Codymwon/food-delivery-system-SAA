import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('fooddash_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fooddash_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token && user?.userId) {
      localStorage.setItem('fooddash_token', token);
      localStorage.setItem('fooddash_user', JSON.stringify(user));
      fetchUserProfile(user.userId);
    } else {
      localStorage.removeItem('fooddash_token');
      localStorage.removeItem('fooddash_user');
      setProfile(null);
    }
  }, [token, user?.userId]);

  const fetchUserProfile = async (userId) => {
    try {
      const res = await apiClient.get(`/users/profile/${userId}`);
      if (res.data) {
        setProfile(res.data);
      }
    } catch (err) {
      console.warn('[AuthContext] Could not fetch profile:', err.message);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      setLoading(false);
      return { success: true, user: receivedUser };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  };

  const demoLogin = async () => {
    return login('customer@vit.ac.in', 'password123');
  };

  const register = async (email, password, name = '', phone = '') => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/register', {
        email,
        password,
        role: 'customer',
      });

      const loginRes = await login(email, password);
      if (loginRes.success && (name || phone)) {
        try {
          await apiClient.put(`/users/profile/${loginRes.user.userId}`, {
            name: name || 'Customer',
            phone: phone || '',
          });
          await fetchUserProfile(loginRes.user.userId);
        } catch (profileErr) {
          console.warn('[AuthContext] Profile update failed:', profileErr.message);
        }
      }
      return loginRes;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  };

  const addAddress = async (addressData) => {
    if (!user?.userId) return { success: false, error: 'User not logged in' };
    try {
      const res = await apiClient.post(`/users/profile/${user.userId}/addresses`, addressData);
      if (res.data) {
        setProfile((prev) => ({
          ...prev,
          addresses: res.data.addresses || prev?.addresses || [],
        }));
      }
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save address';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setProfile(null);
    setError(null);
    localStorage.removeItem('fooddash_token');
    localStorage.removeItem('fooddash_user');
  };

  const value = {
    user,
    profile,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    error,
    login,
    demoLogin,
    register,
    logout,
    addAddress,
    refreshProfile: () => user?.userId && fetchUserProfile(user.userId),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
