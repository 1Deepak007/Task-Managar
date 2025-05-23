import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext({
  isAuthenticated: null,
  user: null,
  authCheckCompleted: false,
  handleAuthChange: () => {},
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [authCheckCompleted, setAuthCheckCompleted] = useState(false);
  const [user, setUser] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3289/api/auth/authCheck', {
        credentials: 'include', // Send cookies
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
        setUser(data.user);
      } else {
        console.error('Auth check failed with status:', response.status);
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      if (!error.toString().includes('401')) {
        console.error('Auth check error:', error);
      }
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setAuthCheckCompleted(true);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    let isHandling401 = false;
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && !isHandling401) {
          isHandling401 = true;
          setIsAuthenticated(false);
          setUser(null);
          isHandling401 = false;
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [checkAuth]);

  const handleAuthChange = useCallback(() => {
    setAuthCheckCompleted(false);
    checkAuth();
  }, [checkAuth]);

  const authContextValue = {
    isAuthenticated,
    user,
    authCheckCompleted,
    handleAuthChange,
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};