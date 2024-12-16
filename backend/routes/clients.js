const express = require('express');
const router = express.Router();
const Client = require('../models/Client');

// Get client by ID
router.get('/:id', async (req, res) => {
    try {
        const client = await Client.findOne({ clientId: req.params.id });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.json(client);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search clients with pagination
router.get('/search', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 18;
        const skip = (page - 1) * limit;

        const searchCriteria = {
            dob: req.query.dob,
            id: req.query.id,
            first_name: req.query.first_name,
            last_name: req.query.last_name,
            phone: req.query.phone,
            locationsClientIDNumber: req.query.locationsClientIDNumber,
            address: req.query.address,
            city: req.query.city,
            state: req.query.state,
            zipCode: req.query.zip,
            language: req.query.language,
            interpreter_id: req.query.interpreter_id,
            limit: limit
        };

        const clients = await Client.searchClients(searchCriteria);
        const total = await Client.countDocuments(searchCriteria);

        res.json({
            clients: clients.map(client => ({
                ...client.toObject(),
                dateOfBirth: client.getFormattedDOB()
            })),
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new client
router.post('/', async (req, res) => {
    try {
        const client = new Client(req.body);
        await client.save();
        res.status(201).json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update client
router.put('/:id', async (req, res) => {
    try {
        const client = await Client.findOneAndUpdate(
            { clientId: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add additional language to client
router.post('/:id/languages', async (req, res) => {
    try {
        const client = await Client.findOne({ clientId: req.params.id });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        client.addLanguage(req.body.language);
        await client.save();
        res.json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Remove additional language from client
router.delete('/:id/languages/:language', async (req, res) => {
    try {
        const client = await Client.findOne({ clientId: req.params.id });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        client.removeLanguage(req.params.language);
        await client.save();
        res.json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get list of insurance providers
router.get('/insurance-providers', (req, res) => {
    try {
        const providers = Client.getInsuranceProviders();
        res.json(providers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add insurance to client
router.post('/:id/insurances', async (req, res) => {
    try {
        const client = await Client.findOne({ clientId: req.params.id });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        const insuranceData = {
            insurance: req.body.insurance_name,
            groupNumber: req.body.group_number,
            memberNumber: req.body.member_number,
            effectiveDate: req.body.effective_date,
            termDate: req.body.term_date
        };

        client.addInsurance(insuranceData);
        await client.save();
        res.json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update insurance
router.put('/:id/insurances/:index', async (req, res) => {
    try {
        const client = await Client.findOne({ clientId: req.params.id });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        const insuranceData = {
            insurance: req.body.insurance_name,
            groupNumber: req.body.group_number,
            memberNumber: req.body.member_number,
            effectiveDate: req.body.effective_date,
            termDate: req.body.term_date,
            isActive: req.body.is_active
        };

        client.updateInsurance(parseInt(req.params.index), insuranceData);
        await client.save();

        // If updating bills was requested
        if (req.body.update_bills) {
            // TODO: Implement bill update logic
            // This would update any existing bills with the new insurance information
        }

        res.json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get client's active insurances
router.get('/:id/insurances/active', async (req, res) => {
    try {
        const client = await Client.findOne({ clientId: req.params.id });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        const activeInsurances = client.insurances.filter(insurance => insurance.active);
        res.json(activeInsurances);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove insurance
router.delete('/:id/insurances/:index', async (req, res) => {
    try {
        const client = await Client.findOne({ clientId: req.params.id });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        client.removeInsurance(parseInt(req.params.index));
        await client.save();
        res.json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
