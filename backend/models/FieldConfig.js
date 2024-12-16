const mongoose = require('mongoose');

const fieldConfigSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: true,
    unique: true
  },
  displayLabel: {
    type: String,
    required: true
  },
  inUse: {
    type: Boolean,
    default: true
  },
  required: {
    type: Boolean,
    default: false
  },
  inputPlaceholder: {
    type: String,
    default: ''
  },
  defaultRule: {
    type: String,
    required: true
  },
  customRule: {
    type: String
  },
  defaultMessage: {
    type: String,
    required: true
  },
  customMessage: {
    type: String
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  modifiedBy: {
    type: String,
    required: true
  }
});

// Add audit trail functionality
fieldConfigSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.lastModified = new Date();
  }
  next();
});

module.exports = mongoose.model('FieldConfig', fieldConfigSchema);
