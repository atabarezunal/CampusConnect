const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const internalKey = req.headers['x-internal-key'];
    const token = req.headers['authorization']?.split(' ')[1];

    if (internalKey !== process.env.INTERNAL_API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Gateway access only' });
    }

    if (!token) return res.status(401).json({ error: 'Token missing' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user_id = decoded.sub;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid Token' });
    }
};

router.post('/', authMiddleware, controller.create);
router.get('/my-groups', authMiddleware, controller.list);
router.post('/:groupId/sessions', authMiddleware, controller.createSession);

module.exports = router;