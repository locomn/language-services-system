const express = require('express');
const router = express.Router({ mergeParams: true });
const Building = require('../models/Building');
const ServiceLocation = require('../models/ServiceLocation');

// Get all buildings for a site
router.get('/', async (req, res) => {
    try {
        const buildings = await Building.find({
            organizationId: req.params.organizationId,
            siteId: req.params.siteId
        }).sort('name');
        res.json(buildings);
    } catch (error) {
        console.error('Error fetching buildings:', error);
        res.status(500).json({ message: 'Error fetching buildings' });
    }
});

// Create a new building
router.post('/', async (req, res) => {
    try {
        const building = new Building({
            ...req.body,
            organizationId: req.params.organizationId,
            siteId: req.params.siteId
        });
        await building.save();
        res.status(201).json(building);
    } catch (error) {
        console.error('Error creating building:', error);
        res.status(500).json({ message: 'Error creating building' });
    }
});

// Get a specific building
router.get('/:buildingId', async (req, res) => {
    try {
        const building = await Building.findOne({
            _id: req.params.buildingId,
            organizationId: req.params.organizationId,
            siteId: req.params.siteId
        });
        
        if (!building) {
            return res.status(404).json({ message: 'Building not found' });
        }
        
        res.json(building);
    } catch (error) {
        console.error('Error fetching building:', error);
        res.status(500).json({ message: 'Error fetching building' });
    }
});

// Update a building
router.put('/:buildingId', async (req, res) => {
    try {
        const building = await Building.findOneAndUpdate(
            {
                _id: req.params.buildingId,
                organizationId: req.params.organizationId,
                siteId: req.params.siteId
            },
            req.body,
            { new: true }
        );
        
        if (!building) {
            return res.status(404).json({ message: 'Building not found' });
        }

        // If building is inactive, cascade to service locations
        if (!building.active) {
            await ServiceLocation.updateMany(
                { buildingId: building._id },
                { active: false }
            );
        }
        
        res.json(building);
    } catch (error) {
        console.error('Error updating building:', error);
        res.status(500).json({ message: 'Error updating building' });
    }
});

// Delete a building
router.delete('/:buildingId', async (req, res) => {
    try {
        const building = await Building.findOneAndDelete({
            _id: req.params.buildingId,
            organizationId: req.params.organizationId,
            siteId: req.params.siteId
        });
        
        if (!building) {
            return res.status(404).json({ message: 'Building not found' });
        }

        // Update service locations to remove building reference
        await ServiceLocation.updateMany(
            { buildingId: building._id },
            { buildingId: null }
        );
        
        res.json({ message: 'Building deleted successfully' });
    } catch (error) {
        console.error('Error deleting building:', error);
        res.status(500).json({ message: 'Error deleting building' });
    }
});

module.exports = router;
