import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI
        .me()
        .then((res) => setUser(res.data.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    console.log('Login response:', res.data);
    
    // Backend returns: { success: true, data: { token, user } }
    const token = res.data?.data?.token;
    const user = res.data?.data?.user;
    
    if (!token) {
      console.error('Token not found in response:', res.data);
      throw new Error(res.data?.message || 'Login failed - no token received');
    }
    
    localStorage.setItem('token', token);
    setUser(user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    console.log('Register response:', res.data);
    
    // Backend returns: { success: true, data: { token, user } }
    const token = res.data?.data?.token;
    const user = res.data?.data?.user;
    
    if (!token) {
      console.error('Token not found in response:', res.data);
      throw new Error(res.data?.message || 'Registration failed - no token received');
    }
    
    localStorage.setItem('token', token);
    setUser(user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshKey, triggerRefresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
