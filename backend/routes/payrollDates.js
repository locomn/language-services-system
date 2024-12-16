const express = require('express');
const router = express.Router();
const PayrollDate = require('../models/PayrollDate');

// Get payroll dates with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const payrollDates = await PayrollDate.searchPayrollDates(page, limit);
        
        // Format dates for display
        const formattedPayrollDates = payrollDates.map(date => {
            const formatted = date.formatDates();
            return {
                _id: date._id,
                cutoffDate: formatted.cutoffDate,
                payDate: formatted.payDate,
                payPeriodInformation: date.payPeriodInformation,
                audit: {
                    created: {
                        by: date.audit.created.by,
                        date: formatted.createdDate,
                        time: formatted.createdTime
                    }
                }
            };
        });

        // Get total count for pagination
        const total = await PayrollDate.countDocuments({ isActive: true });

        res.json({
            payrollDates: formattedPayrollDates,
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

// Add new payroll date
router.post('/', async (req, res) => {
    try {
        const payrollDate = new PayrollDate({
            cutoffDate: new Date(req.body.cutoff_date),
            payDate: new Date(req.body.pay_date),
            payPeriodInformation: req.body.pay_period_information,
            audit: {
                created: {
                    date: new Date(),
                    by: req.body.created_by
                }
            }
        });

        await payrollDate.save();
        
        // Format dates for response
        const formatted = payrollDate.formatDates();
        res.status(201).json({
            _id: payrollDate._id,
            cutoffDate: formatted.cutoffDate,
            payDate: formatted.payDate,
            payPeriodInformation: payrollDate.payPeriodInformation,
            audit: {
                created: {
                    by: payrollDate.audit.created.by,
                    date: formatted.createdDate,
                    time: formatted.createdTime
                }
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Remove payroll date (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const payrollDate = await PayrollDate.findById(req.params.id);
        if (!payrollDate || !payrollDate.isActive) {
            return res.status(404).json({ error: 'Payroll date not found' });
        }

        payrollDate.isActive = false;
        payrollDate.audit.lastModified = {
            date: new Date(),
            by: req.body.modified_by
        };

        await payrollDate.save();
        res.json({ message: 'Payroll date removed successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
