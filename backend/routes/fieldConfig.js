const express = require('express');
const router = express.Router();
const FieldConfig = require('../models/FieldConfig');

// Get all field configurations
router.get('/', async (req, res) => {
  try {
    const fieldConfigs = await FieldConfig.find();
    res.json(fieldConfigs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new field configuration
router.post('/', async (req, res) => {
  const fieldConfig = new FieldConfig({
    fieldName: req.body.fieldName,
    displayLabel: req.body.displayLabel,
    inUse: req.body.inUse,
    required: req.body.required,
    inputPlaceholder: req.body.inputPlaceholder,
    defaultRule: req.body.defaultRule,
    customRule: req.body.customRule,
    defaultMessage: req.body.defaultMessage,
    customMessage: req.body.customMessage,
    modifiedBy: req.body.modifiedBy
  });

  try {
    const newFieldConfig = await fieldConfig.save();
    res.status(201).json(newFieldConfig);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update field configuration
router.patch('/:id', async (req, res) => {
  try {
    const fieldConfig = await FieldConfig.findById(req.params.id);
    
    if (!fieldConfig) {
      return res.status(404).json({ message: 'Field configuration not found' });
    }

    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        fieldConfig[key] = req.body[key];
      }
    });

    const updatedFieldConfig = await fieldConfig.save();
    res.json(updatedFieldConfig);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete field configuration
router.delete('/:id', async (req, res) => {
  try {
    const fieldConfig = await FieldConfig.findById(req.params.id);
    
    if (!fieldConfig) {
      return res.status(404).json({ message: 'Field configuration not found' });
    }

    await fieldConfig.remove();
    res.json({ message: 'Field configuration deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
