import { apiService } from './api';

class AuthService {
  constructor() {
    this.listeners = [];
    this.authState = {
      user: null,
      isAuthenticated: false,
      loading: true,
    };
    this.initializeAuth();
  }

  async initializeAuth() {
    const user = localStorage.getItem('shogi_user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        this.authState.user = userData;
        this.authState.isAuthenticated = true;
        apiService.setUser(userData);
      } catch (error) {
        console.error('Failed to parse user data:', error);
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

  setAuth(user) {
    this.authState = {
      user,
      isAuthenticated: true,
      loading: false,
    };

    localStorage.setItem('shogi_user', JSON.stringify(user));
    apiService.setUser(user);
    this.notifyListeners();
  }

  clearAuth() {
    this.authState = {
      user: null,
      isAuthenticated: false,
      loading: false,
    };

    localStorage.removeItem('shogi_user');
    apiService.clearUser();
    this.notifyListeners();
  }

  async login(name) {
    this.authState.loading = true;
    this.notifyListeners();

    if (!name || !name.trim()) {
      this.authState.loading = false;
      this.notifyListeners();
      return { success: false, error: 'プレイヤー名を入力してください' };
    }

    const trimmedName = name.trim();
    if (trimmedName.length > 20) {
      this.authState.loading = false;
      this.notifyListeners();
      return { success: false, error: 'プレイヤー名は20文字以内で入力してください' };
    }

    const user = {
      id: Date.now().toString(),
      name: trimmedName,
      createdAt: new Date().toISOString(),
    };

    this.setAuth(user);
    return { success: true };
  }

  async logout() {
    this.clearAuth();
  }

  getCurrentUser() {
    return this.authState.user;
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