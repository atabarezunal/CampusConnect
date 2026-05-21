import { apiRequest } from './apiClient';

export const notificationService = {
  listMine(token) {
    return apiRequest('/my-notifications', { token });
  },
};
