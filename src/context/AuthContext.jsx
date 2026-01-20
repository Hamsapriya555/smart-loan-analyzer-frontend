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
    console.log('Full Login response data:', JSON.stringify(res.data, null, 2));
    
    // Try different response structures
    let token, user;
    
    // Structure 1: { success: true, data: { token, user } }
    if (res.data?.data?.token) {
      token = res.data.data.token;
      user = res.data.data.user;
    }
    // Structure 2: { token, user } (direct)
    else if (res.data?.token) {
      token = res.data.token;
      user = res.data.user;
    }
    // Structure 3: { success: true, token, user }
    else if (res.data?.token && res.data?.user) {
      token = res.data.token;
      user = res.data.user;
    }
    
    console.log('Extracted token:', token ? 'Found' : 'NOT FOUND');
    console.log('Extracted user:', user);
    
    if (!token) {
      console.error('Complete response data:', res.data);
      throw new Error(res.data?.message || 'Login failed - no token received');
    }
    
    localStorage.setItem('token', token);
    setUser(user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    console.log('Full Register response data:', JSON.stringify(res.data, null, 2));
    
    // Try different response structures
    let token, user;
    
    // Structure 1: { success: true, data: { token, user } }
    if (res.data?.data?.token) {
      token = res.data.data.token;
      user = res.data.data.user;
    }
    // Structure 2: { token, user } (direct)
    else if (res.data?.token) {
      token = res.data.token;
      user = res.data.user;
    }
    // Structure 3: { success: true, token, user }
    else if (res.data?.token && res.data?.user) {
      token = res.data.token;
      user = res.data.user;
    }
    
    console.log('Extracted token:', token ? 'Found' : 'NOT FOUND');
    console.log('Extracted user:', user);
    
    if (!token) {
      console.error('Complete response data:', res.data);
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
