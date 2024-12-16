const express = require('express');
const router = express.Router();
const PayerContract = require('../models/PayerContract');

// Get payer contracts with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const payerContracts = await PayerContract.searchPayerContracts(page, limit);
        const total = await PayerContract.countDocuments({ isActive: true });

        res.json({
            payerContracts,
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

// Get single payer contract
router.get('/:id', async (req, res) => {
    try {
        const payerContract = await PayerContract.findOne({ 
            contractId: req.params.id,
            isActive: true 
        }).populate('organization', 'name');
        
        if (!payerContract) {
            return res.status(404).json({ error: 'Payer contract not found' });
        }
        
        res.json(payerContract);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create new payer contract
router.post('/', async (req, res) => {
    try {
        const payerContract = new PayerContract({
            name: req.body.name,
            year: req.body.year,
            organization: req.body.organization_id,
            exportFormatName: req.body.export_format_name,
            billingRuleGroupName: req.body.billing_rule_group_name,
            commonBillingRuleGroupName: req.body.common_billing_rule_group_name,
            systemBillingRuleGroupName: req.body.system_billing_rule_group_name,
            isActive: req.body.is_active === 'on',
            onlyOneBillItemAllowed: req.body.only_one_bill_item_allowed === 'on',
            isCptRequired: req.body.is_cpt_required === 'on',
            isDiagnosisCodeRequired: req.body.is_diagnosis_code_required === 'on',
            isModifierRequired: req.body.is_modifier_required === 'on',
            isExactTimeEnabled: req.body.is_exact_time_enabled === 'on',
            patientRelationshipToInsured: req.body.patient_relationship_to_insured,
            patientMaritalStatus: req.body.patient_marital_status,
            conditionRelatedToEmployment: req.body.condition_related_to_employment,
            conditionRelatedToAutoAccident: req.body.condition_related_to_auto_accident,
            conditionRelatedToOtherAccident: req.body.condition_related_to_other_accident,
            practiceIdNumber: req.body.practice_id_number,
            payerIdNumber: req.body.payer_id_number,
            defaultCpt: req.body.default_cpt,
            cptValues: req.body.cpt_values,
            defaultDiagnosisCode: req.body.default_diagnosis_code,
            diagnosisCodeValues: req.body.diagnosis_code_values,
            defaultModifier: req.body.default_modifier,
            modifierValues: req.body.modifier_values,
            contractNotes: req.body.contract_notes,
            audit: {
                created: {
                    date: new Date(),
                    by: req.body.created_by
                }
            }
        });

        await payerContract.save();
        res.status(201).json(payerContract);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update payer contract
router.put('/:id', async (req, res) => {
    try {
        const payerContract = await PayerContract.findOne({ 
            contractId: req.params.id,
            isActive: true 
        });

        if (!payerContract) {
            return res.status(404).json({ error: 'Payer contract not found' });
        }

        // Update all fields
        payerContract.name = req.body.name;
        payerContract.year = req.body.year;
        payerContract.organization = req.body.organization_id;
        payerContract.exportFormatName = req.body.export_format_name;
        payerContract.billingRuleGroupName = req.body.billing_rule_group_name;
        payerContract.commonBillingRuleGroupName = req.body.common_billing_rule_group_name;
        payerContract.systemBillingRuleGroupName = req.body.system_billing_rule_group_name;
        payerContract.isActive = req.body.is_active === 'on';
        payerContract.onlyOneBillItemAllowed = req.body.only_one_bill_item_allowed === 'on';
        payerContract.isCptRequired = req.body.is_cpt_required === 'on';
        payerContract.isDiagnosisCodeRequired = req.body.is_diagnosis_code_required === 'on';
        payerContract.isModifierRequired = req.body.is_modifier_required === 'on';
        payerContract.isExactTimeEnabled = req.body.is_exact_time_enabled === 'on';
        payerContract.patientRelationshipToInsured = req.body.patient_relationship_to_insured;
        payerContract.patientMaritalStatus = req.body.patient_marital_status;
        payerContract.conditionRelatedToEmployment = req.body.condition_related_to_employment;
        payerContract.conditionRelatedToAutoAccident = req.body.condition_related_to_auto_accident;
        payerContract.conditionRelatedToOtherAccident = req.body.condition_related_to_other_accident;
        payerContract.practiceIdNumber = req.body.practice_id_number;
        payerContract.payerIdNumber = req.body.payer_id_number;
        payerContract.defaultCpt = req.body.default_cpt;
        payerContract.cptValues = req.body.cpt_values;
        payerContract.defaultDiagnosisCode = req.body.default_diagnosis_code;
        payerContract.diagnosisCodeValues = req.body.diagnosis_code_values;
        payerContract.defaultModifier = req.body.default_modifier;
        payerContract.modifierValues = req.body.modifier_values;
        payerContract.contractNotes = req.body.contract_notes;
        payerContract.audit.lastModified = {
            date: new Date(),
            by: req.body.modified_by
        };

        await payerContract.save();
        res.json(payerContract);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete payer contract (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const payerContract = await PayerContract.findOne({ 
            contractId: req.params.id,
            isActive: true 
        });

        if (!payerContract) {
            return res.status(404).json({ error: 'Payer contract not found' });
        }

        payerContract.isActive = false;
        payerContract.audit.lastModified = {
            date: new Date(),
            by: req.body.modified_by
        };

        await payerContract.save();
        res.json({ message: 'Payer contract removed successfully' });
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
