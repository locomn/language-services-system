const express = require('express');
const router = express.Router();
const PayrollItem = require('../models/Payroll');

// Get payroll items with filters
router.get('/', async (req, res) => {
    try {
        const {
            payDateStart,
            payDateEnd,
            id: payrollItemId,
            date_of_service: dateOfService,
            bill_id: billId,
            appointment_id: appointmentId,
            created_by_user_id: createdByUserId,
            interpreter_id: interpreterId
        } = req.query;

        let query = {};

        // Add filters if they exist
        if (payDateStart || payDateEnd) {
            query.payDate = {};
            if (payDateStart) query.payDate.$gte = new Date(payDateStart);
            if (payDateEnd) query.payDate.$lte = new Date(payDateEnd);
        }
        if (payrollItemId) query.payrollItemId = payrollItemId;
        if (dateOfService) query.dateOfService = new Date(dateOfService);
        if (billId) query.billId = billId;
        if (appointmentId) query.appointmentId = appointmentId;
        if (interpreterId) query.interpreterId = interpreterId;
        if (createdByUserId) query['audit.created.by'] = createdByUserId;

        // Get payroll items
        const payrollItems = await PayrollItem.find(query)
            .sort({ payDate: -1, payStartTime: 1 });

        // Calculate total pay amount
        const totalPayAmount = await PayrollItem.calculateTotalPayAmount(query);

        res.json({
            payrollItems,
            totalPayAmount,
            count: payrollItems.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific payroll item
router.get('/:id', async (req, res) => {
    try {
        const payrollItem = await PayrollItem.findOne({ payrollItemId: req.params.id });
        if (!payrollItem) {
            return res.status(404).json({ error: 'Payroll item not found' });
        }
        res.json(payrollItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new payroll item
router.post('/', async (req, res) => {
    try {
        const payrollItem = new PayrollItem({
            payrollItemId: req.body.payroll_item_id,
            signatureDate: req.body.signature_date,
            payDate: req.body.pay_date,
            cutoffDate: req.body.cutoff_date,
            dateOfService: req.body.date_of_service,
            payStartTime: req.body.pay_start_time,
            payEndTime: req.body.pay_end_time,
            payAmount: req.body.pay_amount,
            appointmentId: req.body.appointment_id,
            billId: req.body.bill_id,
            interpreterId: req.body.interpreter_id,
            comment: req.body.comment,
            audit: {
                created: {
                    date: new Date(),
                    time: new Date().toLocaleTimeString(),
                    by: req.body.user_id
                }
            }
        });

        await payrollItem.save();
        res.status(201).json(payrollItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update payroll item
router.put('/:id', async (req, res) => {
    try {
        const payrollItem = await PayrollItem.findOne({ payrollItemId: req.params.id });
        if (!payrollItem) {
            return res.status(404).json({ error: 'Payroll item not found' });
        }

        // Update basic fields
        if (req.body.signature_date) payrollItem.signatureDate = req.body.signature_date;
        if (req.body.pay_date) payrollItem.payDate = req.body.pay_date;
        if (req.body.cutoff_date) payrollItem.cutoffDate = req.body.cutoff_date;
        if (req.body.date_of_service) payrollItem.dateOfService = req.body.date_of_service;
        if (req.body.pay_start_time) payrollItem.payStartTime = req.body.pay_start_time;
        if (req.body.pay_end_time) payrollItem.payEndTime = req.body.pay_end_time;
        if (req.body.pay_amount) payrollItem.payAmount = req.body.pay_amount;
        if (req.body.appointment_id) payrollItem.appointmentId = req.body.appointment_id;
        if (req.body.bill_id) payrollItem.billId = req.body.bill_id;
        if (req.body.interpreter_id) payrollItem.interpreterId = req.body.interpreter_id;
        if (req.body.comment) payrollItem.comment = req.body.comment;

        // Update audit information
        payrollItem.audit.lastEdited = {
            date: new Date(),
            time: new Date().toLocaleTimeString(),
            by: req.body.user_id
        };

        await payrollItem.save();
        res.json(payrollItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Export payroll items
router.post('/export', async (req, res) => {
    try {
        const payrollItems = await PayrollItem.find({
            payrollItemId: { $in: req.body.payroll_item_ids }
        });

        const updatePromises = payrollItems.map(item => {
            item.audit.exported = {
                date: new Date(),
                time: new Date().toLocaleTimeString(),
                by: req.body.user_id
            };
            return item.save();
        });

        await Promise.all(updatePromises);
        res.json({ 
            message: `Successfully exported ${payrollItems.length} payroll items`,
            exportedItems: payrollItems
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
