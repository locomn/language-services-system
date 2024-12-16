const express = require('express');
const router = express.Router();
const Interpreter = require('../models/Interpreter');

// Get list of supported languages
router.get('/languages', (req, res) => {
    try {
        const languages = Interpreter.getLanguages();
        res.json(languages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search interpreters with pagination
router.get('/search', async (req, res) => {
    try {
        const searchCriteria = {
            firstName: req.query.first_name,
            lastName: req.query.last_name,
            interpreterId: req.query.id,
            gender: req.query.gender,
            language: req.query.language,
            isTranslator: req.query.translator === 'true',
            showActive: req.query.showActive === 'true',
            showNonActive: req.query.showNonActive === 'true',
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20
        };

        const result = await Interpreter.searchInterpreters(searchCriteria);
        res.json({
            interpreters: result.interpreters,
            total: result.total,
            page: result.page,
            totalPages: result.totalPages
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get interpreter by ID
router.get('/:id', async (req, res) => {
    try {
        const interpreter = await Interpreter.findOne({ interpreterId: req.params.id });
        if (!interpreter) {
            return res.status(404).json({ error: 'Interpreter not found' });
        }
        res.json(interpreter);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new interpreter
router.post('/', async (req, res) => {
    try {
        const interpreterData = {
            interpreterId: req.body.id,
            firstName: req.body.first_name,
            lastName: req.body.last_name,
            middleName: req.body.middle_name,
            nickname: req.body.nickname,
            gender: req.body.gender,
            contact: {
                homePhone: req.body.home_phone,
                cellPhone: req.body.cell_phone,
                fax: req.body.fax,
                email: req.body.email
            },
            address: {
                line1: req.body.address_line1,
                line2: req.body.address_line2,
                city: req.body.city,
                state: req.body.state,
                zipCode: req.body.zip_code
            },
            isActive: true,
            metadata: {
                createdBy: req.body.user_id,
                lastModifiedBy: req.body.user_id
            }
        };

        const interpreter = new Interpreter(interpreterData);
        await interpreter.save();
        res.status(201).json(interpreter);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get comment types
router.get('/comment-types', (req, res) => {
    try {
        const commentTypes = Interpreter.getCommentTypes();
        res.json(commentTypes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add comment to interpreter
router.post('/:id/comments', async (req, res) => {
    try {
        const interpreter = await Interpreter.findOne({ interpreterId: req.params.id });
        if (!interpreter) {
            return res.status(404).json({ error: 'Interpreter not found' });
        }

        interpreter.addComment(
            req.body.comment_type,
            req.body.content,
            req.body.user_id
        );

        await interpreter.save();
        res.json(interpreter);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Terminate interpreter
router.post('/:id/terminate', async (req, res) => {
    try {
        const interpreter = await Interpreter.findOne({ interpreterId: req.params.id });
        if (!interpreter) {
            return res.status(404).json({ error: 'Interpreter not found' });
        }

        interpreter.terminate(req.body.user_id, req.body.dont_rehire);
        await interpreter.save();
        res.json(interpreter);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Reinstate interpreter
router.post('/:id/reinstate', async (req, res) => {
    try {
        const interpreter = await Interpreter.findOne({ interpreterId: req.params.id });
        if (!interpreter) {
            return res.status(404).json({ error: 'Interpreter not found' });
        }

        interpreter.reinstate(req.body.user_id);
        await interpreter.save();
        res.json(interpreter);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update interpreter
router.put('/:id', async (req, res) => {
    try {
        const interpreter = await Interpreter.findOne({ interpreterId: req.params.id });
        if (!interpreter) {
            return res.status(404).json({ error: 'Interpreter not found' });
        }

        // Update basic information
        interpreter.ssn = req.body.ssn;
        interpreter.firstName = req.body.first_name;
        interpreter.lastName = req.body.last_name;
        interpreter.middleName = req.body.middle_name;
        interpreter.nickname = req.body.nickname;
        interpreter.namePrefix = req.body.name_prefix;
        interpreter.nameSuffix = req.body.name_suffix;
        interpreter.gender = req.body.gender;
        interpreter.badgeNumber = req.body.badge_number;
        interpreter.stateRosterId = req.body.state_roster_id;
        interpreter.oldRosterId = req.body.roster_id;
        interpreter.externalId = req.body.external_id;

        // Update contact information
        interpreter.contact = {
            homePhone: req.body.home_phone,
            cellPhone: req.body.cell_phone,
            fax: req.body.fax,
            email: req.body.email
        };

        // Update address
        interpreter.address = {
            line1: req.body.address_line1,
            line2: req.body.address_line2,
            city: req.body.city,
            state: req.body.state,
            zipCode: req.body.zip_code
        };

        // Update settings
        interpreter.settings = {
            isActive: req.body.is_active,
            autoAssign: req.body.auto_assign,
            canAcceptRequestedAppointments: req.body.can_accept_appts_if_requested,
            canAcceptAvailableAppointments: req.body.can_accept_available_appts
        };

        // Update comments and notes
        if (req.body.comments !== undefined) {
            interpreter.comments = req.body.comments;
        }
        if (req.body.management_notes !== undefined) {
            interpreter.managementNotes = req.body.management_notes;
        }

        // Update metadata
        interpreter.metadata.lastModifiedBy = req.body.user_id;
        interpreter.metadata.lastModifiedAt = new Date();

        await interpreter.save();
        res.json(interpreter);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add language to interpreter
router.post('/:id/languages', async (req, res) => {
    try {
        const interpreter = await Interpreter.findOne({ interpreterId: req.params.id });
        if (!interpreter) {
            return res.status(404).json({ error: 'Interpreter not found' });
        }

        interpreter.addLanguage(
            req.body.language,
            req.body.is_translator || false,
            req.body.certifications || []
        );

        await interpreter.save();
        res.json(interpreter);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
