class ApiService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    this.token = null;
  }

  setAuthToken(token) {
    this.token = token;
  }

  clearAuthToken() {
    this.token = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email, password, displayName) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
  }

  async refreshToken() {
    return this.request('/api/auth/refresh', {
      method: 'POST',
    });
  }

  // User endpoints
  async getUserProfile() {
    return this.request('/api/users/profile');
  }

  async updateUserProfile(updates) {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getLeaderboard(limit = 10) {
    return this.request(`/api/users/leaderboard?limit=${limit}`);
  }

  // Game endpoints
  async createGame(opponentId) {
    return this.request('/api/games', {
      method: 'POST',
      body: JSON.stringify({ opponentId }),
    });
  }

  async getGame(gameId) {
    return this.request(`/api/games/${gameId}`);
  }

  async getUserGames() {
    return this.request('/api/games');
  }

  async makeMove(gameId, move) {
    return this.request(`/api/games/${gameId}/moves`, {
      method: 'POST',
      body: JSON.stringify({ move }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;