const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

// Get list of bills with filters
router.get('/', async (req, res) => {
    try {
        const bills = await Bill.find(req.query).populate('billedAppointments');
        res.json(bills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific bill
router.get('/:id', async (req, res) => {
    try {
        const bill = await Bill.findOne({ billId: req.params.id })
            .populate('billedAppointments')
            .populate('billItems')
            .populate('payrollItems');
        
        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }
        
        res.json(bill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new bill
router.post('/', async (req, res) => {
    try {
        const bill = new Bill({
            billId: req.body.bill_id,
            payerContract: req.body.payer_contract,
            appointmentId: req.body.appointment_id,
            signatureDate: req.body.signature_date,
            totalCharge: req.body.total_charge,
            
            patientRelationshipToInsured: req.body.patient_relationship_to_insured,
            patientMaritalStatus: req.body.patient_marital_status,
            
            conditionRelatedTo: {
                employment: req.body.condition_related_to_employment,
                autoAccident: req.body.condition_related_to_auto_accident,
                otherAccident: req.body.condition_related_to_other_accident
            },
            
            commentsToPlayer: req.body.comments,
            
            client: req.body.client,
            location: req.body.location,
            appointment: req.body.appointment,
            interpreter: req.body.interpreter,
            
            audit: {
                created: {
                    date: new Date(),
                    time: new Date().toLocaleTimeString(),
                    by: req.body.user_id
                }
            }
        });

        await bill.save();
        res.status(201).json(bill);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update bill
router.put('/:id', async (req, res) => {
    try {
        const bill = await Bill.findOne({ billId: req.params.id });
        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        // Update basic fields
        if (req.body.signature_date) bill.signatureDate = req.body.signature_date;
        if (req.body.total_charge) bill.totalCharge = req.body.total_charge;
        if (req.body.patient_relationship_to_insured) bill.patientRelationshipToInsured = req.body.patient_relationship_to_insured;
        if (req.body.patient_marital_status) bill.patientMaritalStatus = req.body.patient_marital_status;
        if (req.body.comments) bill.commentsToPlayer = req.body.comments;

        // Update condition related fields
        if (req.body.condition_related_to_employment) {
            bill.conditionRelatedTo.employment = req.body.condition_related_to_employment;
        }
        if (req.body.condition_related_to_auto_accident) {
            bill.conditionRelatedTo.autoAccident = req.body.condition_related_to_auto_accident;
        }
        if (req.body.condition_related_to_other_accident) {
            bill.conditionRelatedTo.otherAccident = req.body.condition_related_to_other_accident;
        }

        // Update void information
        if (req.body.void_reason) {
            bill.voidReason = req.body.void_reason;
            bill.voidInfo = {
                date: new Date(),
                time: new Date().toLocaleTimeString(),
                by: req.body.user_id
            };
        }

        // Update audit information
        bill.audit.lastEdited = {
            date: new Date(),
            time: new Date().toLocaleTimeString(),
            by: req.body.user_id
        };

        await bill.save();
        res.json(bill);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add bill item
router.post('/:id/items', async (req, res) => {
    try {
        const bill = await Bill.findOne({ billId: req.params.id });
        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        bill.billItems.push({
            billItemId: req.body.bill_item_id,
            startTime: req.body.start_time,
            endTime: req.body.end_time,
            cptCode: req.body.cpt_code,
            units: req.body.units,
            charge: req.body.charge
        });

        // Update total charge
        bill.totalCharge = bill.billItems.reduce((sum, item) => sum + item.charge, 0);

        await bill.save();
        res.status(201).json(bill);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add appointment to bill
router.post('/:id/appointments', async (req, res) => {
    try {
        const bill = await Bill.findOne({ billId: req.params.id });
        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        bill.billedAppointments.push({
            appointmentId: req.body.appointment_id,
            isPrimary: req.body.is_primary,
            appointmentDate: req.body.appointment_date,
            clientId: req.body.client_id
        });

        await bill.save();
        res.status(201).json(bill);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add payroll item
router.post('/:id/payroll', async (req, res) => {
    try {
        const bill = await Bill.findOne({ billId: req.params.id });
        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        bill.payrollItems.push({
            payrollItemId: req.body.payroll_item_id,
            signatureDate: req.body.signature_date,
            payDate: req.body.pay_date,
            cutoffDate: req.body.cutoff_date,
            appointmentId: req.body.appointment_id,
            payAmount: req.body.pay_amount,
            interpreterId: req.body.interpreter_id,
            interpreterFirstName: req.body.interpreter_first_name,
            interpreterLastName: req.body.interpreter_last_name,
            payStartTime: req.body.pay_start_time,
            payEndTime: req.body.pay_end_time,
            comment: req.body.comment
        });

        await bill.save();
        res.status(201).json(bill);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Mark bill as exported
router.post('/:id/export', async (req, res) => {
    try {
        const bill = await Bill.findOne({ billId: req.params.id });
        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        bill.audit.exported = {
            date: new Date(),
            time: new Date().toLocaleTimeString(),
            by: req.body.user_id
        };

        await bill.save();
        res.json(bill);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
