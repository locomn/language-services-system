const mongoose = require('mongoose');

const INSURANCE_PROVIDERS = {
    AETNA: 'Aetna',
    AUTO_ACCIDENT: 'Auto Accident',
    BLUE_CROSS: 'Blue Cross Blue Shield',
    BLUE_PLUS: 'Blue Plus',
    CIGNA: 'Cigna',
    HEALTH_PARTNERS_COMMERCIAL: 'Health Partners Commercial',
    HEALTH_PARTNERS_PMAP: 'Health Partners PMAP',
    HENNEPIN_HEALTH_PMAP: 'Hennepin Health PMAP',
    HUMANA: 'Humana',
    MA: 'MA',
    MEDICA_COMMERCIAL: 'Medica Commercial',
    MEDICA_PMAP: 'Medica PMAP',
    MEDICARE: 'Medicare',
    MINNESOTACARE: 'MinnesotaCare',
    OTHER: 'Other',
    PREFERREDONE: 'PreferredOne',
    SOUTH_COUNTRY: 'South Country Health Alliance',
    UCARE_COMMERCIAL: 'UCare Commercial',
    UCARE_PMAP: 'UCare PMAP',
    UHC_COMMERCIAL: 'UHC Commercial',
    UHC_PMAP: 'UHC PMAP',
    UNITEDHEALTHCARE: 'UnitedHealthcare',
    WORKER_COMP: 'Worker Compensation'
};

const clientLanguageSchema = new mongoose.Schema({
    language: {
        type: String,
        required: true
    }
});

const clientInsuranceSchema = new mongoose.Schema({
    insurance: {
        type: String,
        required: true,
        enum: Object.values(INSURANCE_PROVIDERS)
    },
    groupNumber: String,
    memberNumber: String,
    effectiveDate: Date,
    termDate: Date,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Virtual for checking if insurance is currently active
clientInsuranceSchema.virtual('active').get(function() {
    const now = new Date();
    const effectiveDate = this.effectiveDate ? new Date(this.effectiveDate) : null;
    const termDate = this.termDate ? new Date(this.termDate) : null;
    
    if (!effectiveDate) return this.isActive;
    if (!termDate) return this.isActive && now >= effectiveDate;
    return this.isActive && now >= effectiveDate && now <= termDate;
});

const clientSchema = new mongoose.Schema({
    clientId: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    middleName: String,
    lastName: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['M', 'F', 'X', ''],
        default: ''
    },
    primaryPhone: {
        type: String,
        required: true
    },
    alternatePhone: String,
    address: {
        line1: String,
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true,
            enum: ['MN', 'WI', '']
        },
        zipCode: {
            type: String,
            required: true
        }
    },
    languages: {
        primary: {
            type: String,
            required: true
        },
        preferred_interpreter_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Interpreter'
        },
        others: [clientLanguageSchema]
    },
    insurances: [clientInsuranceSchema],
    locationsClientIDNumber: String, // MR/Chart number
}, {
    timestamps: true
});

// Create indexes for search performance
clientSchema.index({ firstName: 1, lastName: 1 });
clientSchema.index({ clientId: 1 });
clientSchema.index({ dateOfBirth: 1 });
clientSchema.index({ primaryPhone: 1 });
clientSchema.index({ 'languages.primary': 1 });
clientSchema.index({ 'address.zipCode': 1 });

// Method to format date of birth for display
clientSchema.methods.getFormattedDOB = function() {
    return this.dateOfBirth.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });
};

// Static method for searching clients
clientSchema.statics.searchClients = async function(criteria) {
    const query = {};
    
    if (criteria.dob) {
        query.dateOfBirth = new Date(criteria.dob);
    }
    
    if (criteria.id) {
        query.clientId = criteria.id;
    }
    
    if (criteria.first_name) {
        query.firstName = new RegExp(criteria.first_name, 'i');
    }
    
    if (criteria.last_name) {
        query.lastName = new RegExp(criteria.last_name, 'i');
    }
    
    if (criteria.phone) {
        query.$or = [
            { primaryPhone: new RegExp(criteria.phone.replace(/\D/g, '')) },
            { alternatePhone: new RegExp(criteria.phone.replace(/\D/g, '')) }
        ];
    }
    
    if (criteria.locationsClientIDNumber) {
        query.locationsClientIDNumber = criteria.locationsClientIDNumber;
    }
    
    if (criteria.address) {
        query['address.line1'] = new RegExp(criteria.address, 'i');
    }

    if (criteria.city) {
        query['address.city'] = criteria.city;
    }

    if (criteria.state) {
        query['address.state'] = criteria.state;
    }

    if (criteria.zipCode) {
        query['address.zipCode'] = criteria.zipCode;
    }

    if (criteria.language) {
        query['languages.primary'] = criteria.language;
    }

    if (criteria.interpreter_id) {
        query['languages.preferred_interpreter_id'] = criteria.interpreter_id;
    }

    return this.find(query)
        .sort({ lastName: 1, firstName: 1 })
        .limit(criteria.limit || 100);
};

// Method to add additional language
clientSchema.methods.addLanguage = function(language) {
    if (!this.languages.others.some(l => l.language === language)) {
        this.languages.others.push({ language });
    }
};

// Method to remove additional language
clientSchema.methods.removeLanguage = function(language) {
    this.languages.others = this.languages.others.filter(l => l.language !== language);
};

// Method to add insurance
clientSchema.methods.addInsurance = function(insuranceData) {
    const {
        insurance,
        groupNumber,
        memberNumber,
        effectiveDate,
        termDate
    } = insuranceData;

    // Validate insurance provider
    if (!Object.values(INSURANCE_PROVIDERS).includes(insurance)) {
        throw new Error('Invalid insurance provider');
    }

    // Validate dates
    if (effectiveDate && termDate && new Date(effectiveDate) > new Date(termDate)) {
        throw new Error('Effective date cannot be later than term date');
    }

    this.insurances.push({
        insurance,
        groupNumber,
        memberNumber,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
        termDate: termDate ? new Date(termDate) : undefined,
        isActive: true
    });
};

// Method to update insurance
clientSchema.methods.updateInsurance = function(index, insuranceData) {
    if (index < 0 || index >= this.insurances.length) {
        throw new Error('Invalid insurance index');
    }

    const {
        insurance,
        groupNumber,
        memberNumber,
        effectiveDate,
        termDate,
        isActive
    } = insuranceData;

    // Validate insurance provider
    if (!Object.values(INSURANCE_PROVIDERS).includes(insurance)) {
        throw new Error('Invalid insurance provider');
    }

    // Validate dates
    if (effectiveDate && termDate && new Date(effectiveDate) > new Date(termDate)) {
        throw new Error('Effective date cannot be later than term date');
    }

    this.insurances[index] = {
        insurance,
        groupNumber,
        memberNumber,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
        termDate: termDate ? new Date(termDate) : undefined,
        isActive: isActive !== undefined ? isActive : true
    };
};

// Static method to get all insurance providers
clientSchema.statics.getInsuranceProviders = function() {
    return Object.values(INSURANCE_PROVIDERS);
};

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
