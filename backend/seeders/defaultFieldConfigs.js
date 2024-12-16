const FieldConfig = require('../models/FieldConfig');

const defaultFields = [
  {
    fieldName: 'first_name',
    displayLabel: 'First Name',
    inUse: true,
    required: true,
    inputPlaceholder: 'Enter your first name',
    defaultRule: '^[A-Za-z\'-]{2,30}$',
    defaultMessage: 'Must be 2-30 characters, letters, hyphens and apostrophes only',
    modifiedBy: 'system'
  },
  {
    fieldName: 'last_name',
    displayLabel: 'Last Name',
    inUse: true,
    required: true,
    inputPlaceholder: 'Enter your last name',
    defaultRule: '^[A-Za-z\'-]{2,30}$',
    defaultMessage: 'Must be 2-30 characters, letters, hyphens and apostrophes only',
    modifiedBy: 'system'
  },
  {
    fieldName: 'phone',
    displayLabel: 'Phone Number',
    inUse: true,
    required: false,
    inputPlaceholder: 'Enter your phone number',
    defaultRule: '^\\+1\\s\\([0-9]{3}\\)\\s[0-9]{3}-[0-9]{4}$',
    defaultMessage: 'Valid phone number format: +1 (123) 456-7890',
    modifiedBy: 'system'
  }
];

async function seedDefaultFields() {
  try {
    for (const field of defaultFields) {
      const existingField = await FieldConfig.findOne({ fieldName: field.fieldName });
      if (!existingField) {
        await FieldConfig.create(field);
        console.log(`Created default configuration for ${field.fieldName}`);
      }
    }
    console.log('Default field configurations seeded successfully');
  } catch (error) {
    console.error('Error seeding default field configurations:', error);
  }
}

module.exports = seedDefaultFields;
