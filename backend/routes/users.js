const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get users with filters
router.get('/', async (req, res) => {
    try {
        const {
            username,
            first_name,
            last_name,
            email,
            disabled,
            employee,
            role_id,
            interpreter_id
        } = req.query;

        const users = await User.searchUsers({
            username,
            firstName: first_name,
            lastName: last_name,
            email,
            isDisabled: disabled === 'true',
            isEmployee: employee === 'true',
            roleId: role_id ? parseInt(role_id) : undefined,
            interpreterId: interpreter_id ? parseInt(interpreter_id) : undefined
        });

        res.json({
            users,
            count: users.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific user
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new user
router.post('/', async (req, res) => {
    try {
        const roleMapping = User.getRoleMapping();
        const user = new User({
            username: req.body.username,
            firstName: req.body.first_name,
            lastName: req.body.last_name,
            email: req.body.email,
            isDisabled: req.body.disabled === 'true',
            isEmployee: req.body.employee === 'true',
            ssn: req.body.ssn,
            roleId: parseInt(req.body.role_id),
            role: roleMapping[req.body.role_id],
            interpreterId: req.body.interpreter_id ? parseInt(req.body.interpreter_id) : undefined,
            audit: {
                created: {
                    date: new Date(),
                    by: req.body.created_by
                }
            }
        });

        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const roleMapping = User.getRoleMapping();
        
        // Update fields if provided
        if (req.body.username) user.username = req.body.username;
        if (req.body.first_name) user.firstName = req.body.first_name;
        if (req.body.last_name) user.lastName = req.body.last_name;
        if (req.body.email) user.email = req.body.email;
        if (req.body.ssn) user.ssn = req.body.ssn;
        
        // Update flags
        if (req.body.disabled !== undefined) {
            user.isDisabled = req.body.disabled === 'true';
        }
        if (req.body.employee !== undefined) {
            user.isEmployee = req.body.employee === 'true';
        }

        // Update role and interpreter
        if (req.body.role_id) {
            user.roleId = parseInt(req.body.role_id);
            user.role = roleMapping[req.body.role_id];
        }
        if (req.body.interpreter_id) {
            user.interpreterId = parseInt(req.body.interpreter_id);
        }

        // Update audit
        user.audit.lastModified = {
            date: new Date(),
            by: req.body.modified_by
        };

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Set password for user
router.post('/:id/password', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Set new password (assuming password is hashed before storage)
        user.password = req.body.password;
        
        // Update audit
        user.audit.lastModified = {
            date: new Date(),
            by: req.body.modified_by
        };

        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Disable user (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isDisabled = true;
        user.audit.lastModified = {
            date: new Date(),
            by: req.body.modified_by
        };

        await user.save();
        res.json({ message: 'User disabled successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
