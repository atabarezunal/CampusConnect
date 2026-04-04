const db = require('../config/db');

exports.sendNotification = async (req, res) => {
    try {
        const { userId, userName, groupName, invitationId } = req.body;
        
        const notifRef = db.ref(`notifications/${userId}`).push();
        const notification = {
            id: notifRef.key,
            message: `¡Hola ${userName}! Has sido invitado al grupo: ${groupName}`,
            invitationId,
            date: new Date().toISOString(),
            read: false
        };

        await notifRef.set(notification);
        res.status(201).json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.listMyNotifications = async (req, res) => {
    try {
        const { userId } = req.params;         
        const snapshot = await db.ref(`notifications/${userId}`).once('value');
        
        res.json(snapshot.exists() ? Object.values(snapshot.val()) : []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};