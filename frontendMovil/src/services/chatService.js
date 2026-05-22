import { apiRequest } from './apiClient';

export const chatService = {
    createChat(groupId, token) {
        return apiRequest(`/study-groups/${groupId}/chat`, {
            method: 'POST',
            token,
        });
    },

    sendMessage(groupId, payload, token) {
        return apiRequest(`/study-groups/${groupId}/messages`, {
            method: 'POST',
            token,
            body: payload,
        });
    },

    getMessages(groupId, token) {
        return apiRequest(`/study-groups/${groupId}/messages`, {
            token,
        });
    },
};
