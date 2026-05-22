const db = require('../config/db');

class ChatService {
    async createChat(groupId, userId) {
        const groupSnap = await db.ref(`groups/${groupId}`).once('value');

        if (!groupSnap.exists()) {
            throw new Error('Grupo no encontrado');
        }

        const memberSnap = await db
            .ref(`members/${groupId}/${userId}`)
            .once('value');

        if (!memberSnap.exists()) {
            throw new Error('No perteneces al grupo');
        }

        const chatRef = db.ref(`chats/${groupId}/metadata`);

        const chatData = {
            created_at: new Date().toISOString(),
            created_by: userId,
        };

        await chatRef.set(chatData);

        return {
            message: 'Chat creado correctamente',
            groupId,
        };
    }

    async sendMessage(groupId, userId, senderName, text) {
        if (!text || !text.trim()) {
            throw new Error('Mensaje vacío');
        }

        const memberSnap = await db
            .ref(`members/${groupId}/${userId}`)
            .once('value');

        if (!memberSnap.exists()) {
            throw new Error('No perteneces al grupo');
        }

        const messageRef = db.ref(`messages/${groupId}`).push();

        const message = {
            id: messageRef.key,
            sender_id: userId,
            sender_name: senderName,
            text,
            created_at: new Date().toISOString(),
        };

        await messageRef.set(message);

        return message;
    }

    async getMessages(groupId, userId) {
        const memberSnap = await db
            .ref(`members/${groupId}/${userId}`)
            .once('value');

        if (!memberSnap.exists()) {
            throw new Error('No perteneces al grupo');
        }

        const snapshot = await db
            .ref(`messages/${groupId}`)
            .once('value');

        if (!snapshot.exists()) {
            return [];
        }

        return Object.values(snapshot.val())
            .sort((a, b) =>
                new Date(a.created_at) - new Date(b.created_at)
            );
    }
}

module.exports = new ChatService();