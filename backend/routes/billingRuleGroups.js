const express = require('express');
const router = express.Router();
const BillingRuleGroup = require('../models/BillingRuleGroup');

// Get billing rule groups with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const billingRuleGroups = await BillingRuleGroup.searchBillingRuleGroups(page, limit);
        const total = await BillingRuleGroup.countDocuments({ isActive: true });

        res.json({
            billingRuleGroups,
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

// Get single billing rule group
router.get('/:id', async (req, res) => {
    try {
        const billingRuleGroup = await BillingRuleGroup.findOne({ 
            groupId: req.params.id,
            isActive: true 
        });
        
        if (!billingRuleGroup) {
            return res.status(404).json({ error: 'Billing rule group not found' });
        }
        
        res.json(billingRuleGroup);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create new billing rule group
router.post('/', async (req, res) => {
    try {
        // Parse the rule group name to extract rate information
        const ruleInfo = BillingRuleGroup.parseRuleGroupName(req.body.name);

        const billingRuleGroup = new BillingRuleGroup({
            name: req.body.name,
            ruleType: ruleInfo.ruleType,
            baseRate: ruleInfo.baseRate,
            additionalRate: ruleInfo.additionalRate,
            audit: {
                created: {
                    date: new Date(),
                    by: req.body.created_by
                }
            }
        });

        await billingRuleGroup.save();
        res.status(201).json(billingRuleGroup);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update billing rule group
router.put('/:id', async (req, res) => {
    try {
        const billingRuleGroup = await BillingRuleGroup.findOne({ 
            groupId: req.params.id,
            isActive: true 
        });

        if (!billingRuleGroup) {
            return res.status(404).json({ error: 'Billing rule group not found' });
        }

        // Parse the new rule group name if it's being updated
        if (req.body.name) {
            const ruleInfo = BillingRuleGroup.parseRuleGroupName(req.body.name);
            billingRuleGroup.name = req.body.name;
            billingRuleGroup.ruleType = ruleInfo.ruleType;
            billingRuleGroup.baseRate = ruleInfo.baseRate;
            billingRuleGroup.additionalRate = ruleInfo.additionalRate;
        }

        billingRuleGroup.audit.lastModified = {
            date: new Date(),
            by: req.body.modified_by
        };

        await billingRuleGroup.save();
        res.json(billingRuleGroup);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete billing rule group (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const billingRuleGroup = await BillingRuleGroup.findOne({ 
            groupId: req.params.id,
            isActive: true 
        });

        if (!billingRuleGroup) {
            return res.status(404).json({ error: 'Billing rule group not found' });
        }

        billingRuleGroup.isActive = false;
        billingRuleGroup.audit.lastModified = {
            date: new Date(),
            by: req.body.modified_by
        };

        await billingRuleGroup.save();
        res.json({ message: 'Billing rule group removed successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Refresh contracts and rates
router.post('/refresh', async (req, res) => {
    try {
        // This endpoint can be implemented based on specific business logic
        // for refreshing contracts and rates
        res.json({ message: 'Contracts and rates refreshed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
