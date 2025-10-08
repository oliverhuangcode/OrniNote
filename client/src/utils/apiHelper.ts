import { authService } from '../services/authService';

export const getAuthHeaders = (): HeadersInit => {
  const token = authService.getToken();
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const handleAuthError = (error: any) => {
  // If we get a 401, token is invalid - sign out
  if (error.status === 401) {
    authService.signout();
    window.location.href = '/login';
  }
  throw error;
};