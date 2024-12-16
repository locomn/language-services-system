const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

// Get departments with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20; // Match the page size from the form

        const departments = await Department.searchDepartments(page, limit);

        // Get total count for pagination
        const total = await Department.countDocuments({ isActive: true });

        res.json({
            departments,
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

// Create new department
router.post('/', async (req, res) => {
    try {
        const department = new Department({
            name: req.body.name,
            audit: {
                created: {
                    date: new Date(),
                    by: req.body.created_by
                }
            }
        });

        await department.save();
        res.status(201).json(department);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Remove department (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department || !department.isActive) {
            return res.status(404).json({ error: 'Department not found' });
        }

        department.isActive = false;
        department.audit.lastModified = {
            date: new Date(),
            by: req.body.modified_by
        };

        await department.save();
        res.json({ message: 'Department removed successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
