const express = require('express');
const router = express.Router({ mergeParams: true });
const Site = require('../models/Site');
const Building = require('../models/Building');
const ServiceLocation = require('../models/ServiceLocation');

// Get all sites for an organization
router.get('/', async (req, res) => {
    try {
        const sites = await Site.find({ organizationId: req.params.organizationId })
            .sort('name');
        res.json(sites);
    } catch (error) {
        console.error('Error fetching sites:', error);
        res.status(500).json({ message: 'Error fetching sites' });
    }
});

// Create a new site
router.post('/', async (req, res) => {
    try {
        const site = new Site({
            ...req.body,
            organizationId: req.params.organizationId
        });
        await site.save();
        res.status(201).json(site);
    } catch (error) {
        console.error('Error creating site:', error);
        res.status(500).json({ message: 'Error creating site' });
    }
});

// Get a specific site
router.get('/:siteId', async (req, res) => {
    try {
        const site = await Site.findOne({
            _id: req.params.siteId,
            organizationId: req.params.organizationId
        });
        
        if (!site) {
            return res.status(404).json({ message: 'Site not found' });
        }
        
        res.json(site);
    } catch (error) {
        console.error('Error fetching site:', error);
        res.status(500).json({ message: 'Error fetching site' });
    }
});

// Update a site
router.put('/:siteId', async (req, res) => {
    try {
        const site = await Site.findOneAndUpdate(
            {
                _id: req.params.siteId,
                organizationId: req.params.organizationId
            },
            req.body,
            { new: true }
        );
        
        if (!site) {
            return res.status(404).json({ message: 'Site not found' });
        }

        // If site is inactive, cascade to buildings and service locations
        if (!site.active) {
            await Building.updateMany(
                { siteId: site._id },
                { active: false }
            );

            await ServiceLocation.updateMany(
                { siteId: site._id },
                { active: false }
            );
        }
        
        res.json(site);
    } catch (error) {
        console.error('Error updating site:', error);
        res.status(500).json({ message: 'Error updating site' });
    }
});

// Delete a site
router.delete('/:siteId', async (req, res) => {
    try {
        const site = await Site.findOneAndDelete({
            _id: req.params.siteId,
            organizationId: req.params.organizationId
        });
        
        if (!site) {
            return res.status(404).json({ message: 'Site not found' });
        }

        // Delete all related buildings and service locations
        await Building.deleteMany({ siteId: site._id });
        await ServiceLocation.updateMany(
            { siteId: site._id },
            { siteId: null }
        );
        
        res.json({ message: 'Site deleted successfully' });
    } catch (error) {
        console.error('Error deleting site:', error);
        res.status(500).json({ message: 'Error deleting site' });
    }
});

module.exports = router;
