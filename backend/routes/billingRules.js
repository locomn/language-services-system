const express = require('express');
const router = express.Router();
const BillingRule = require('../models/BillingRule');
const BillingRuleGroup = require('../models/BillingRuleGroup');

// Get billing rules for a group
router.get('/group/:groupId', async (req, res) => {
    try {
        const group = await BillingRuleGroup.findOne({ groupId: req.params.groupId });
        if (!group) {
            return res.status(404).json({ error: 'Billing rule group not found' });
        }

        const rules = await BillingRule.find({ 
            billingRuleGroup: group._id,
            isActive: true 
        }).sort({ ruleId: 1 });

        res.json(rules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single billing rule
router.get('/:id', async (req, res) => {
    try {
        const rule = await BillingRule.findOne({ 
            ruleId: req.params.id,
            isActive: true 
        });
        
        if (!rule) {
            return res.status(404).json({ error: 'Billing rule not found' });
        }
        
        res.json(rule);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create new billing rule
router.post('/', async (req, res) => {
    try {
        const group = await BillingRuleGroup.findOne({ groupId: req.body.groupId });
        if (!group) {
            return res.status(404).json({ error: 'Billing rule group not found' });
        }

        const billingRule = new BillingRule({
            billingRuleGroup: group._id,
            ruleType: req.body.ruleType || 'Automatic',
            description: req.body.description
        });

        // Add conditions for Automatic and Error rules
        if (billingRule.ruleType !== 'Special') {
            billingRule.conditions = {
                checkAsl: req.body['conditionsArea:is_asl_checked'] === 'on',
                checkCanceled: req.body['conditionsArea:is_canceled_checked'] === 'on',
                checkServiceType: req.body['conditionsArea:is_service_type_checked'] === 'on',
                checkCpt: req.body['conditionsArea:is_cpt_checked'] === 'on',
                checkModifier: req.body['conditionsArea:is_modifier_checked'] === 'on',
                checkExactTime: req.body['conditionsArea:is_exact_time_checked'] === 'on',
                isAsl: req.body['conditionsArea:is_asl'] === 'on',
                isCanceled: req.body['conditionsArea:is_canceled'] === 'on',
                serviceType: req.body['conditionsArea:service_type'] || undefined,
                cpt: req.body['conditionsArea:cpt'] || undefined,
                modifier: req.body['conditionsArea:modifier'] || undefined,
                isExactTime: req.body['conditionsArea:is_exact_time'] === 'on'
            };
        }

        // Add units and rates for Automatic and Special rules
        if (billingRule.ruleType !== 'Error') {
            // Convert empty strings to undefined for numeric fields
            const numericFields = ['unit_length', 'round_units_up_at', 'cumin', 'cumax', 'crmin', 'cramin', 'pumin', 'pumax', 'prmin', 'pramin'];
            const unitsAndRates = {};
            
            for (const field of numericFields) {
                const value = req.body[`unitsAndRatesArea:${field}`];
                unitsAndRates[field] = value === '' ? undefined : Number(value);
            }

            billingRule.unitsAndRates = {
                unitLength: unitsAndRates.unit_length,
                roundUnitsUpAt: unitsAndRates.round_units_up_at,
                cuMinReq: req.body['unitsAndRatesArea:cuminreq'] || undefined,
                cuMin: unitsAndRates.cumin,
                cuMax: unitsAndRates.cumax,
                crMin: unitsAndRates.crmin,
                crAMin: unitsAndRates.cramin,
                puMinReq: req.body['unitsAndRatesArea:puminreq'] || undefined,
                puMin: unitsAndRates.pumin,
                puMax: unitsAndRates.pumax,
                prMin: unitsAndRates.prmin,
                prAMin: unitsAndRates.pramin
            };
        }

        billingRule.audit = {
            created: {
                date: new Date(),
                by: req.body.created_by
            }
        };

        await billingRule.save();
        res.status(201).json(billingRule);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update billing rule
router.put('/:id', async (req, res) => {
    try {
        const rule = await BillingRule.findOne({ 
            ruleId: req.params.id,
            isActive: true 
        });

        if (!rule) {
            return res.status(404).json({ error: 'Billing rule not found' });
        }

        rule.description = req.body.description;

        // Update conditions for Automatic and Error rules
        if (rule.ruleType !== 'Special') {
            rule.conditions = {
                checkAsl: req.body['conditionsArea:is_asl_checked'] === 'on',
                checkCanceled: req.body['conditionsArea:is_canceled_checked'] === 'on',
                checkServiceType: req.body['conditionsArea:is_service_type_checked'] === 'on',
                checkCpt: req.body['conditionsArea:is_cpt_checked'] === 'on',
                checkModifier: req.body['conditionsArea:is_modifier_checked'] === 'on',
                checkExactTime: req.body['conditionsArea:is_exact_time_checked'] === 'on',
                isAsl: req.body['conditionsArea:is_asl'] === 'on',
                isCanceled: req.body['conditionsArea:is_canceled'] === 'on',
                serviceType: req.body['conditionsArea:service_type'] || undefined,
                cpt: req.body['conditionsArea:cpt'] || undefined,
                modifier: req.body['conditionsArea:modifier'] || undefined,
                isExactTime: req.body['conditionsArea:is_exact_time'] === 'on'
            };
        }

        // Update units and rates for Automatic and Special rules
        if (rule.ruleType !== 'Error') {
            // Convert empty strings to undefined for numeric fields
            const numericFields = ['unit_length', 'round_units_up_at', 'cumin', 'cumax', 'crmin', 'cramin', 'pumin', 'pumax', 'prmin', 'pramin'];
            const unitsAndRates = {};
            
            for (const field of numericFields) {
                const value = req.body[`unitsAndRatesArea:${field}`];
                unitsAndRates[field] = value === '' ? undefined : Number(value);
            }

            rule.unitsAndRates = {
                unitLength: unitsAndRates.unit_length,
                roundUnitsUpAt: unitsAndRates.round_units_up_at,
                cuMinReq: req.body['unitsAndRatesArea:cuminreq'] || undefined,
                cuMin: unitsAndRates.cumin,
                cuMax: unitsAndRates.cumax,
                crMin: unitsAndRates.crmin,
                crAMin: unitsAndRates.cramin,
                puMinReq: req.body['unitsAndRatesArea:puminreq'] || undefined,
                puMin: unitsAndRates.pumin,
                puMax: unitsAndRates.pumax,
                prMin: unitsAndRates.prmin,
                prAMin: unitsAndRates.pramin
            };
        }

        rule.audit.lastModified = {
            date: new Date(),
            by: req.body.modified_by
        };

        await rule.save();
        res.json(rule);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete billing rule (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const rule = await BillingRule.findOne({ 
            ruleId: req.params.id,
            isActive: true 
        });

        if (!rule) {
            return res.status(404).json({ error: 'Billing rule not found' });
        }

        rule.isActive = false;
        rule.audit.lastModified = {
            date: new Date(),
            by: req.body.modified_by
        };

        await rule.save();
        res.json({ message: 'Billing rule removed successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
