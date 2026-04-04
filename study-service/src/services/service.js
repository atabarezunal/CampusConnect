const db = require('../config/db');

class StudyService {
    async createGroup(data, userId) {
        const groupRef = db.ref('groups').push(); 
        const groupId = groupRef.key;
        const newGroup = {
            id: groupId,
            ...data,
            created_by: userId,
            created_at: new Date().toISOString()
        };
        const updates = {};
        updates[`/groups/${groupId}`] = newGroup;
        updates[`/members/${groupId}/${userId}`] = { 
            role: 'LEADER', 
            joined_at: new Date().toISOString() 
        };
        updates[`/user_groups/${userId}/${groupId}`] = true;
        await db.ref().update(updates);
        return newGroup;
    }

    async getMyGroups(userId) {
        const snapshot = await db.ref(`user_groups/${userId}`).once('value');
        if (!snapshot.exists()) return [];

        const groupIds = Object.keys(snapshot.val());
        const groups = [];

        for (const id of groupIds) {
            const gSnap = await db.ref(`groups/${id}`).once('value');
            if (gSnap.exists()) groups.push(gSnap.val());
        }
        return groups;
    }

    async createSession(groupId, sessionData) {
        const sessionRef = db.ref(`sessions/${groupId}`).push();
        const sessionId = sessionRef.key;
        const newSession = {
            id: sessionId,
            id_group: groupId,
            ...sessionData,
            created_at: new Date().toISOString()
        };
        await sessionRef.set(newSession);
        return newSession;
    }

    async getSessionsByGroup(groupId) {
        const snapshot = await db.ref(`sessions/${groupId}`).once('value');
        if (!snapshot.exists()) {
            return [];
        }
        return Object.values(snapshot.val());
    }

    async addMember(groupId, targetUserId, newRole, requesterUserId) {
        const requesterSnap = await db.ref(`members/${groupId}/${requesterUserId}`).once('value');
        const requesterRole = requesterSnap.exists() ? requesterSnap.val().role : null;
        if (requesterRole !== 'LEADER') {
            throw new Error('Solo el LEADER puede gestionar roles de moderación');
        }
        const updates = {};
        updates[`/members/${groupId}/${targetUserId}`] = { 
            role: newRole, 
            joined_at: new Date().toISOString() 
        };
        updates[`/user_groups/${targetUserId}/${groupId}`] = true;
        await db.ref().update(updates);
        return { success: true };
    }
}

module.exports = new StudyService();