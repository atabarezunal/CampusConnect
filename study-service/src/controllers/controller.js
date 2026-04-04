const StudyGroup = require('../models/model');
const Service = require('../services/service');

exports.create = async (req, res) => {
    const validation = StudyGroup.validate(req.body);
    if (!validation.isValid) {
        return res.status(400).json({ errors: validation.errors });
    }
    const cleanData = StudyGroup.format(req.body, req.user_id);
    try {
        const group = await Service.createGroup(cleanData, req.user_id);
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.list = async (req, res) => {
    try {
        const groups = await Service.getMyGroups(req.user_id);
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createSession = async (req, res) => {
    try {
        const { groupId } = req.params;
        const session = await Service.createSession(groupId, req.body);
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSessions = async (req, res) => {
    try {
        const sessions = await Service.getSessionsByGroup(req.params.groupId);
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};