const express = require('express');
const router = express.Router();
const Group = require('../models/Group');

// Get groups with pagination and filters
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 18; // Match the page size from the form
        const skip = (page - 1) * limit;

        const filters = {
            name: req.query.name,
            description: req.query.description
        };

        const groups = await Group.searchGroups(filters)
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const total = await Group.countDocuments({ 
            isActive: true,
            ...(filters.name && { name: { $regex: new RegExp(filters.name, 'i') } }),
            ...(filters.description && { description: { $regex: new RegExp(filters.description, 'i') } })
        });

        res.json({
            groups,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                limit
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific group
router.get('/:id', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group || !group.isActive) {
            return res.status(404).json({ error: 'Group not found' });
        }
        res.json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new group
router.post('/', async (req, res) => {
    try {
        const group = new Group({
            name: req.body.name,
            description: req.body.description,
            audit: {
                created: {
                    date: new Date(),
                    by: req.body.created_by
                }
            }
        });

        await group.save();
        res.status(201).json(group);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update group
router.put('/:id', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group || !group.isActive) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Update fields if provided
        if (req.body.name) group.name = req.body.name;
        if (req.body.description) group.description = req.body.description;

        // Update audit
        group.audit.lastModified = {
            date: new Date(),
            by: req.body.modified_by
        };

        await group.save();
        res.json(group);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Soft delete group
router.delete('/:id', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group || !group.isActive) {
            return res.status(404).json({ error: 'Group not found' });
        }

        group.isActive = false;
        group.audit.lastModified = {
            date: new Date(),
            by: req.body.modified_by
        };

        await group.save();
        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
