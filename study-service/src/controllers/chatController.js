const chatService = require('../services/chatService');

exports.createChat = async (req, res) => {
    try {
        const result = await chatService.createChat(
            req.params.groupId,
            req.user_id
        );

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            error: error.message,
        });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const result = await chatService.sendMessage(
            req.params.groupId,
            req.user_id,
            req.body.sender_name,
            req.body.text
        );

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            error: error.message,
        });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const result = await chatService.getMessages(
            req.params.groupId,
            req.user_id
        );

        res.json(result);
    } catch (error) {
        res.status(400).json({
            error: error.message,
        });
    }
};
