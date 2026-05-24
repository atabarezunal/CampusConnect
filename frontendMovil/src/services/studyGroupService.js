import { apiRequest } from './apiClient';

export const studyGroupService = {
  list(token) {
    return apiRequest('/study-groups', { token });
  },

  create(payload, token) {
    return apiRequest('/study-groups', {
      method: 'POST',
      token,
      body: payload,
    });
  },

  getSessions(groupId, token) {
    return apiRequest(`/study-groups/${groupId}/sessions`, { token });
  },

  createSession(groupId, payload, token) {
    return apiRequest(`/study-groups/${groupId}/sessions`, {
      method: 'POST',
      token,
      body: payload,
    });
  },

  inviteUser(payload, token) {
    return apiRequest('/study-groups/invite', {
      method: 'POST',
      token,
      body: payload,
    });
  },

  getInvitations(token) {
    return apiRequest('/my-invitations', { token });
  },

  acceptInvitation(invitationId, token) {
    return apiRequest('/accept-invitation', {
      method: 'POST',
      token,
      body: { invitationId },
    });
  },

  rejectInvitation(invitationId, token) {
    return apiRequest('/reject-invitation', {
      method: 'POST',
      token,
      body: { invitationId },
    });
  },

  getMembers(groupId, token) {
    return apiRequest(`/study-groups/${groupId}/members`, { token });
  },

  removeMember(groupId, targetUserId, token) {
    return apiRequest(`/study-groups/${groupId}/members`, {
      method: 'DELETE',
      token,
      body: { targetUserId },
    });
  },

  deleteGroup(groupId, token) {
    return apiRequest(`/study-groups/${groupId}`, {
      method: 'DELETE',
      token,
    });
  },

  searchUsers(q, token) {
    return apiRequest(`/users/search?q=${encodeURIComponent(q)}`, { token });
  },
  assignRole(payload, token) {
    return apiRequest('/study-groups/assign-role', {
      method: 'PUT',
      token,
      body: payload,
    });
  },
};
