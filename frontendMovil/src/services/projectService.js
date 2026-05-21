import { apiRequest } from './apiClient';

export const projectService = {
  list(token) {
    return apiRequest('/projects', { token });
  },

  create(payload, token) {
    return apiRequest('/projects', {
      method: 'POST',
      token,
      body: payload,
    });
  },

  remove(projectId, token) {
    return apiRequest(`/projects/${projectId}`, {
      method: 'DELETE',
      token,
    });
  },

  addMember(payload, token) {
    return apiRequest('/projects/members', {
      method: 'POST',
      token,
      body: payload,
    });
  },

  createTask(payload, token) {
    return apiRequest('/tasks', {
      method: 'POST',
      token,
      body: payload,
    });
  },

  getTasks(projectId, token) {
    return apiRequest(`/tasks/${projectId}`, { token });
  },
};
