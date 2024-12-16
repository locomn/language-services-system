const express = require('express');
const router = express.Router();
const Language = require('../models/Language');

// Get languages with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20; // Match the page size from the form

        const languages = await Language.searchLanguages(page, limit);

        // Get total count for pagination
        const total = await Language.countDocuments({ isActive: true });

        res.json({
            languages,
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

// Add new language
router.post('/', async (req, res) => {
    try {
        const language = new Language({
            name: req.body.name,
            audit: {
                created: {
                    date: new Date(),
                    by: req.body.created_by
                }
            }
        });

        await language.save();
        res.status(201).json(language);
    } catch (error) {
        // Handle duplicate language name
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Language already exists' });
        }
        res.status(400).json({ error: error.message });
    }
});

// Remove language (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const language = await Language.findById(req.params.id);
        if (!language || !language.isActive) {
            return res.status(404).json({ error: 'Language not found' });
        }

        language.isActive = false;
        language.audit.lastModified = {
            date: new Date(),
            by: req.body.modified_by
        };

        await language.save();
        res.json({ message: 'Language removed successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
