const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');

const internalAuth = (req, res, next) => {
    if (req.headers['x-internal-key'] !== process.env.INTERNAL_API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Gateway Only' });
    }
    next();
};

router.post('/send', internalAuth, controller.sendNotification);
router.get('/user/:userId', internalAuth, controller.listMyNotifications);

module.exports = router;