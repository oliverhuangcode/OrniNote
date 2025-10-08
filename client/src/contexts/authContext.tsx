import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
  _id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signin: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser || null); // FIXED: Handle undefined by converting to null
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signin = async (usernameOrEmail: string, password: string) => {
    try {
      const response = await authService.signin({ usernameOrEmail, password });
      
      if (response.success && response.user) {
        setUser(response.user);
        return { success: true };
      }
      
      return { success: false, error: response.error || 'Login failed' };
    } catch (error) {
      console.error('Signin error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      const response = await authService.signup({ username, email, password });
      
      if (response.success && response.user) {
        setUser(response.user);
        return { success: true };
      }
      
      return { success: false, error: response.error || 'Signup failed' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An error occurred during signup' };
    }
  };

  const signout = () => {
    authService.signout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    signin,
    signup,
    signout,
    isAuthenticated: user !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};