const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Get categories with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20; // Match the page size from the form

        const categories = await Category.searchCategories(page, limit);

        // Get total count for pagination
        const total = await Category.countDocuments({ isActive: true });

        res.json({
            categories,
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

// Add new category
router.post('/', async (req, res) => {
    try {
        const category = new Category({
            name: req.body.name,
            audit: {
                created: {
                    date: new Date(),
                    by: req.body.created_by
                }
            }
        });

        await category.save();
        res.status(201).json(category);
    } catch (error) {
        // Handle duplicate category name
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Category already exists' });
        }
        res.status(400).json({ error: error.message });
    }
});

// Remove category (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category || !category.isActive) {
            return res.status(404).json({ error: 'Category not found' });
        }

        category.isActive = false;
        category.audit.lastModified = {
            date: new Date(),
            by: req.body.modified_by
        };

        await category.save();
        res.json({ message: 'Category removed successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
