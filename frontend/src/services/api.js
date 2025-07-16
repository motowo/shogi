class ApiService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    this.user = null;
  }

  setUser(user) {
    this.user = user;
  }

  clearUser() {
    this.user = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.user) {
      headers['X-User-ID'] = this.user.id;
      headers['X-User-Name'] = this.user.name;
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

  // Auth endpoints (simplified for name-based auth)
  async validateUser(name) {
    return this.request('/api/auth/validate', {
      method: 'POST',
      body: JSON.stringify({ name }),
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
  async createGame(gameType, difficulty = 'medium') {
    return this.request('/api/games', {
      method: 'POST',
      body: JSON.stringify({ gameType, difficulty }),
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

  // Shogi engine endpoints
  async getInitialBoard() {
    return this.request('/api/shogi/initial-board');
  }

  async validateMove(boardState, move, currentPlayer) {
    return this.request('/api/shogi/validate-move', {
      method: 'POST',
      body: JSON.stringify({ boardState, move, currentPlayer }),
    });
  }

  async getValidMoves(boardState, position, currentPlayer) {
    const params = new URLSearchParams({
      boardState: JSON.stringify(boardState),
      position: JSON.stringify(position),
      currentPlayer,
    });
    return this.request(`/api/shogi/valid-moves?${params}`);
  }

  async applyShogiMove(boardState, move, currentPlayer) {
    return this.request('/api/shogi/make-move', {
      method: 'POST',
      body: JSON.stringify({ boardState, move, currentPlayer }),
    });
  }

  async checkGameState(boardState, currentPlayer) {
    return this.request('/api/shogi/check-game-state', {
      method: 'POST',
      body: JSON.stringify({ boardState, currentPlayer }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;