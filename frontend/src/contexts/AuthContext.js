import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  isAnonymous: false
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.tokens.accessToken,
        refreshToken: action.payload.tokens.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        isAnonymous: action.payload.user.isAnonymous || false
      };
    case 'LOGIN_ANONYMOUS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.tokens.accessToken,
        refreshToken: action.payload.tokens.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        isAnonymous: true
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (token && refreshToken) {
          // Set token in API headers
          authAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token and get user data
          const response = await authAPI.get('/auth/me');
          
          if (response.data.success) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: {
                user: response.data.data.user,
                tokens: { accessToken: token, refreshToken }
              }
            });
          } else {
            // Token invalid, try refresh
            await refreshAccessToken();
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Try to refresh token if available
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            await refreshAccessToken();
          } catch (refreshError) {
            // Refresh failed, clear storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    initAuth();
  }, []);

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const response = await authAPI.post('/auth/refresh', {
        refreshToken
      });

      if (response.data.success) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
        
        // Update localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Update API headers
        authAPI.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // Get user data
        const userResponse = await authAPI.get('/auth/me');
        
        if (userResponse.data.success) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: userResponse.data.data.user,
              tokens: { accessToken, refreshToken: newRefreshToken }
            }
          });
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authAPI.post('/auth/login', credentials);
      
      if (response.data.success) {
        const { user, tokens } = response.data.data;
        
        // Store tokens
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        
        // Set token in API headers
        authAPI.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, tokens }
        });
        
        toast.success('Login successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authAPI.post('/auth/register', userData);
      
      if (response.data.success) {
        const { user, tokens } = response.data.data;
        
        // Store tokens
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        
        // Set token in API headers
        authAPI.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, tokens }
        });
        
        toast.success('Registration successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: message };
    }
  };

  const loginAnonymous = async (deviceId) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authAPI.post('/auth/anonymous', { deviceId });
      
      if (response.data.success) {
        const { user, tokens } = response.data.data;
        
        // Store tokens
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        
        // Set token in API headers
        authAPI.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
        
        dispatch({
          type: 'LOGIN_ANONYMOUS',
          payload: { user, tokens }
        });
        
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Anonymous login failed';
      toast.error(message);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      if (state.token) {
        await authAPI.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear API headers
      delete authAPI.defaults.headers.common['Authorization'];
      
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    register,
    loginAnonymous,
    logout,
    updateUser,
    refreshAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};