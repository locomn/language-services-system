require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const clientRoutes = require('./routes/clients');
const interpretersRouter = require('./routes/interpreters');
const billsRouter = require('./routes/bills');
const payrollRouter = require('./routes/payroll');
const locationsRouter = require('./routes/locations');
const groupsRouter = require('./routes/groups');
const departmentsRouter = require('./routes/departments');
const languagesRouter = require('./routes/languages');
const categoriesRouter = require('./routes/categories');
const payrollDatesRouter = require('./routes/payrollDates');
const payerContractsRouter = require('./routes/payerContracts');
const billingRuleGroupsRouter = require('./routes/billingRuleGroups');
const billingRulesRouter = require('./routes/billingRules');
const organizationsRouter = require('./routes/organizations');
const sitesRouter = require('./routes/sites');
const buildingsRouter = require('./routes/buildings');
const fieldConfigRouter = require('./routes/fieldConfig');

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Language Services API is running' });
});

// Routes
app.use('/api/clients', clientRoutes);
app.use('/api/interpreters', interpretersRouter);
app.use('/api/bills', billsRouter);
app.use('/api/payroll', payrollRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/organizations', organizationsRouter);
app.use('/api/organizations/:organizationId/sites', sitesRouter);
app.use('/api/organizations/:organizationId/sites/:siteId/buildings', buildingsRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/languages', languagesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/payroll-dates', payrollDatesRouter);
app.use('/api/payer-contracts', payerContractsRouter);
app.use('/api/billing-rule-groups', billingRuleGroupsRouter);
app.use('/api/billing-rules', billingRulesRouter);
app.use('/api/field-config', fieldConfigRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
