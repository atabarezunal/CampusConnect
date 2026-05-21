import { apiRequest } from './apiClient';

export const authService = {
  login(credentials) {
    return apiRequest('/login', {
      method: 'POST',
      body: credentials,
    });
  },

  register(payload) {
    return apiRequest('/register', {
      method: 'POST',
      body: payload,
    });
  },

  resetPassword(payload) {
    return apiRequest('/reset-password', {
      method: 'POST',
      body: payload,
    });
  },

  me(token) {
    return apiRequest('/me', { token });
  },

  logout(token) {
    return apiRequest('/logout', {
      method: 'POST',
      token,
    });
  },

  refresh(token) {
    return apiRequest('/refresh', {
      method: 'POST',
      token,
    });
  },
};
