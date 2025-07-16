import { useState, useEffect } from 'react';
import { authService } from '../services/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState(authService.getAuthState());

  useEffect(() => {
    const unsubscribe = authService.subscribe((newAuthState) => {
      setAuthState(newAuthState);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    return authService.login(email, password);
  };

  const register = async (email, password, displayName) => {
    return authService.register(email, password, displayName);
  };

  const logout = async () => {
    return authService.logout();
  };

  return {
    ...authState,
    login,
    register,
    logout,
  };
};