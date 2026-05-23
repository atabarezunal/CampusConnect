import { apiRequest } from './apiClient';

export const projectService = {
  list(token) {
    return apiRequest('/projects', { token });
  },

  create(payload, token) {
    return apiRequest('/projects', { method: 'POST', token, body: payload });
  },

  remove(projectId, token) {
    return apiRequest(`/projects/${projectId}`, { method: 'DELETE', token });
  },

  getMembers(projectId, token) {
    return apiRequest(`/projects/${projectId}/members`, { token });
  },

  addMember(payload, token) {
    return apiRequest('/projects/members', { method: 'POST', token, body: payload });
  },

  removeMember(projectId, userId, token) {
    return apiRequest(`/projects/${projectId}/members`, {
      method: 'DELETE',
      token,
      body: { user_id: userId },
    });
  },

  createTask(payload, token) {
    return apiRequest('/tasks', { method: 'POST', token, body: payload });
  },

  getTasks(projectId, token) {
    return apiRequest(`/tasks/${projectId}`, { token });
  },

  updateTaskStatus(taskId, status, token) {
    return apiRequest(`/tasks/${taskId}`, {
      method: 'PATCH',
      token,
      body: { status },
    });
  },

  searchUsers(q, token) {
    return apiRequest(`/users/search?q=${encodeURIComponent(q)}`, { token });
  },
};