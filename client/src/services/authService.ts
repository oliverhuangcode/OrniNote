interface SignupData {
  username: string;
  email: string;
  password: string;
}

interface SigninData {
  usernameOrEmail: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  token?: string;
  user?: {
    _id: string;
    username: string;
    email: string;
  };
}

class AuthService {
  private apiBaseUrl: string;
  private tokenKey = 'auth_token';

  constructor(apiBaseUrl: string = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  // Sign up
  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success && result.token) {
        this.setToken(result.token);
      }

      return result;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // Sign in
  async signin(data: SigninData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success && result.token) {
        this.setToken(result.token);
      }

      return result;
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    try {
      const token = this.getToken();
      
      if (!token) {
        return null;
      }

      const response = await fetch(`${this.apiBaseUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        return result.user;
      }

      // Token is invalid, remove it
      this.removeToken();
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      this.removeToken();
      return null;
    }
  }

  // Token management
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Sign out
  signout(): void {
    this.removeToken();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export const authService = new AuthService();