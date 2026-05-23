import { apiRequest } from './apiClient';

export const userService = {
  getProfile(userId, token) {
    return apiRequest(`/profile/${userId}`, { token });
  },

  createProfile(payload, token) {
    return apiRequest('/profile', {
      method: 'POST',
      token,
      body: payload,
    });
  },

  updateProfile(userId, payload, token) {
    return apiRequest(`/profile/${userId}`, {
      method: 'PATCH',
      token,
      body: payload,
    });
  },

  getUserSkills(userId, token) {
    return apiRequest(`/profile/${userId}/skills`, { token });
  },

  getSkills(token) {
    return apiRequest('/skills', { token });
  },

  createSkill(payload, token) {
    return apiRequest('/skills', {
      method: 'POST',
      token,
      body: payload,
    });
  },

  assignSkill(payload, token) {
    return apiRequest('/skills/assign', {
      method: 'POST',
      token,
      body: payload,
    });
  },

  deleteAccount(token) {
    return apiRequest('/account', {
      method: 'DELETE',
      token,
    });
  },
};