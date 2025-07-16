import { apiService } from './api';

class AuthService {
  constructor() {
    this.listeners = [];
    this.authState = {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: true,
    };
    this.initializeAuth();
  }

  async initializeAuth() {
    const token = localStorage.getItem('shogi_token');
    if (token) {
      apiService.setAuthToken(token);
      this.authState.token = token;

      // Validate token by fetching user profile
      const result = await apiService.getUserProfile();
      if (result.data) {
        this.authState.user = result.data;
        this.authState.isAuthenticated = true;
      } else {
        // Token is invalid, clear it
        this.clearAuth();
      }
    }

    this.authState.loading = false;
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.authState));
  }

  setAuth(token, user) {
    this.authState = {
      user,
      token,
      isAuthenticated: true,
      loading: false,
    };

    localStorage.setItem('shogi_token', token);
    apiService.setAuthToken(token);
    this.notifyListeners();
  }

  clearAuth() {
    this.authState = {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
    };

    localStorage.removeItem('shogi_token');
    apiService.clearAuthToken();
    this.notifyListeners();
  }

  async login(email, password) {
    this.authState.loading = true;
    this.notifyListeners();

    const result = await apiService.login(email, password);

    if (result.data) {
      this.setAuth(result.data.token, result.data.user);
      return { success: true };
    } else {
      this.authState.loading = false;
      this.notifyListeners();
      return { success: false, error: result.error };
    }
  }

  async register(email, password, displayName) {
    this.authState.loading = true;
    this.notifyListeners();

    const result = await apiService.register(email, password, displayName);

    if (result.data) {
      this.setAuth(result.data.token, result.data.user);
      return { success: true };
    } else {
      this.authState.loading = false;
      this.notifyListeners();
      return { success: false, error: result.error };
    }
  }

  async logout() {
    this.clearAuth();
  }

  async refreshToken() {
    const result = await apiService.refreshToken();

    if (result.data) {
      const newToken = result.data.token;
      this.authState.token = newToken;
      localStorage.setItem('shogi_token', newToken);
      apiService.setAuthToken(newToken);
      return true;
    } else {
      this.clearAuth();
      return false;
    }
  }

  getCurrentUser() {
    return this.authState.user;
  }

  getToken() {
    return this.authState.token;
  }

  isAuthenticated() {
    return this.authState.isAuthenticated;
  }

  isLoading() {
    return this.authState.loading;
  }

  getAuthState() {
    return { ...this.authState };
  }
}

export const authService = new AuthService();
export default authService;