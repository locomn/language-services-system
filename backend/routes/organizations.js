const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const Site = require('../models/Site');
const Building = require('../models/Building');
const ServiceLocation = require('../models/ServiceLocation');

// Get all organizations with optional search
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        
        if (search) {
            query = {
                name: { $regex: search, $options: 'i' }
            };
        }
        
        const organizations = await Organization.find(query)
            .select('id name active hasHierarchy hasSites hasBuildings')
            .sort('name');
            
        res.json(organizations);
    } catch (error) {
        console.error('Error fetching organizations:', error);
        res.status(500).json({ message: 'Error fetching organizations' });
    }
});

// Create new organization
router.post('/', async (req, res) => {
    try {
        const organization = new Organization(req.body);
        await organization.save();
        res.status(201).json(organization);
    } catch (error) {
        console.error('Error creating organization:', error);
        res.status(500).json({ message: 'Error creating organization' });
    }
});

// Get organization by ID with its hierarchy
router.get('/:id', async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id);
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        let response = {
            ...organization.toObject(),
            sites: [],
            buildings: [],
            serviceLocations: []
        };

        // If organization has sites
        if (organization.hasSites) {
            response.sites = await Site.find({ organizationId: organization._id });
            
            // If organization has buildings
            if (organization.hasBuildings) {
                response.buildings = await Building.find({ organizationId: organization._id });
            }
        }

        // Get service locations
        response.serviceLocations = await ServiceLocation.find({ organizationId: organization._id });

        res.json(response);
    } catch (error) {
        console.error('Error fetching organization:', error);
        res.status(500).json({ message: 'Error fetching organization' });
    }
});

// Update organization
router.put('/:id', async (req, res) => {
    try {
        const organization = await Organization.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        // If organization is inactive, cascade the change
        if (!organization.active) {
            // Update all sites to inactive
            await Site.updateMany(
                { organizationId: organization._id },
                { active: false }
            );

            // Update all buildings to inactive
            await Building.updateMany(
                { organizationId: organization._id },
                { active: false }
            );

            // Update all service locations to inactive
            await ServiceLocation.updateMany(
                { organizationId: organization._id },
                { active: false }
            );
        }

        res.json(organization);
    } catch (error) {
        console.error('Error updating organization:', error);
        res.status(500).json({ message: 'Error updating organization' });
    }
});

// Delete organization
router.delete('/:id', async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id);
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        // Delete all related records
        await Site.deleteMany({ organizationId: organization._id });
        await Building.deleteMany({ organizationId: organization._id });
        await ServiceLocation.deleteMany({ organizationId: organization._id });
        
        await organization.remove();
        
        res.json({ message: 'Organization deleted successfully' });
    } catch (error) {
        console.error('Error deleting organization:', error);
        res.status(500).json({ message: 'Error deleting organization' });
    }
});

module.exports = router;
