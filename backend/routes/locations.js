const express = require('express');
const router = express.Router();
const ServiceLocation = require('../models/ServiceLocation');

// Get locations with filters
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { categoryName: { $regex: search, $options: 'i' } },
                    { city: { $regex: search, $options: 'i' } },
                    { state: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const locations = await ServiceLocation.find(query);
        res.json(locations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all categories with their IDs
router.get('/categories', async (req, res) => {
    try {
        const categories = await ServiceLocation.aggregate([
            {
                $group: {
                    _id: '$categoryId',
                    name: { $first: '$category' }
                }
            },
            { $sort: { name: 1 } }
        ]);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single location
router.get('/:id', async (req, res) => {
    try {
        const location = await ServiceLocation.findById(req.params.id);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json(location);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new location
router.post('/', async (req, res) => {
    try {
        const location = new ServiceLocation(req.body);
        await location.save();
        res.status(201).json(location);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a location
router.put('/:id', async (req, res) => {
    try {
        const location = await ServiceLocation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json(location);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a location
router.delete('/:id', async (req, res) => {
    try {
        const location = await ServiceLocation.findByIdAndDelete(req.params.id);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json({ message: 'Location deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
