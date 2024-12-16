const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
    billItemId: {
        type: String,
        required: true,
        unique: true
    },
    startTime: String,
    endTime: String,
    cptCode: String,
    units: {
        type: Number,
        default: 0
    },
    charge: {
        type: Number,
        default: 0
    }
});

const billedAppointmentSchema = new mongoose.Schema({
    appointmentId: {
        type: String,
        required: true
    },
    isPrimary: {
        type: Boolean,
        default: false
    },
    appointmentDate: Date,
    clientId: String
});

const payrollItemSchema = new mongoose.Schema({
    payrollItemId: {
        type: String,
        required: true,
        unique: true
    },
    signatureDate: Date,
    payDate: Date,
    cutoffDate: Date,
    appointmentId: String,
    payAmount: {
        type: Number,
        default: 0
    },
    interpreterId: String,
    interpreterFirstName: String,
    interpreterLastName: String,
    payStartTime: String,
    payEndTime: String,
    comment: String
});

const billSchema = new mongoose.Schema({
    // Basic Bill Information
    billId: {
        type: String,
        required: true,
        unique: true
    },
    payerContract: {
        type: String,
        required: true
    },
    appointmentId: String,
    signatureDate: Date,
    totalCharge: {
        type: Number,
        default: 0
    },
    
    // Patient Information
    patientRelationshipToInsured: {
        type: String,
        enum: ['I', 'S', 'C', 'O'],
        default: 'I'
    },
    patientMaritalStatus: {
        type: String,
        enum: ['S', 'M', 'O'],
        default: 'S'
    },
    
    // Condition Related Information
    conditionRelatedTo: {
        employment: {
            type: String,
            enum: ['Y', 'N'],
            default: 'N'
        },
        autoAccident: {
            type: String,
            enum: ['Y', 'N'],
            default: 'N'
        },
        otherAccident: {
            type: String,
            enum: ['Y', 'N'],
            default: 'N'
        }
    },
    
    // Comments and Notes
    contractNotes: String,
    commentsToPlayer: String,
    
    // Void Information
    voidReason: {
        type: String,
        enum: ['', 'TB', 'DP', 'RL', 'RO', 'DB', 'AC', 'AF', 'WF', 'OR']
    },
    voidInfo: {
        date: Date,
        time: String,
        by: String
    },
    
    // Bill Items, Appointments, and Payroll
    billItems: [billItemSchema],
    billedAppointments: [billedAppointmentSchema],
    payrollItems: [payrollItemSchema],
    
    // Client Information
    client: {
        id: String,
        firstName: String,
        middleName: String,
        lastName: String,
        phone: String,
        dateOfBirth: Date,
        gender: String,
        address: String,
        city: String,
        state: String,
        zipCode: String,
        insurance: {
            name: String,
            groupNumber: String,
            memberNumber: String
        }
    },
    
    // Location Information
    location: {
        id: String,
        name: String,
        organizationLocationId: String,
        organizationLocationName: String,
        organizationZone: String,
        placeOfService: String,
        addressLine2: String,
        city: String,
        state: String,
        zipCode: String
    },
    
    // Appointment Information
    appointment: {
        language: String,
        serviceType: String,
        date: Date,
        cancelReason: String
    },
    
    // Interpreter Information
    interpreter: {
        id: String,
        firstName: String,
        middleName: String,
        lastName: String,
        rosterId: String,
        oldRosterId: String
    },
    
    // Audit Information
    audit: {
        created: {
            date: Date,
            time: String,
            by: String
        },
        lastEdited: {
            date: Date,
            time: String,
            by: String
        },
        markedForExport: {
            by: String
        },
        exported: {
            date: Date,
            time: String,
            by: String
        }
    },
    
    // Fixed Fields
    fixedFields: {
        federalTaxId: String,
        ein: String,
        signatureAndTitle: String,
        billingName: String,
        billingAddress: String,
        billingCityStateZip: String,
        billingProviderPractice: String,
        payerId: String
    }
});

// Add methods from previous implementation
billSchema.statics.getInsuranceProviders = function() {
    return [
        'Aetna', 'Auto Accident', 'Blue Cross Blue Shield', 'Blue Plus', 'Cigna',
        'Health Partners Commercial', 'Health Partners PMAP', 'Hennepin Health PMAP',
        'Humana', 'MA', 'Medica Commercial', 'Medica PMAP', 'Medicare', 'MinnesotaCare',
        'Other', 'PreferredOne', 'South Country Health Alliance', 'UCare Commercial',
        'UCare PMAP', 'UHC Commercial', 'UHC PMAP', 'UnitedHealthcare', 'Worker Compensation'
    ];
};

// Method to void a bill
billSchema.methods.void = function(userId) {
    this.status.isVoided = true;
    this.status.voidDate = new Date();
    this.status.voidedBy = userId;
    this.metadata.lastModifiedAt = new Date();
    this.metadata.lastModifiedBy = userId;
};

// Method to mark bill as exported
billSchema.methods.markAsExported = function(userId) {
    this.status.isExported = true;
    this.status.exportDate = new Date();
    this.metadata.lastModifiedAt = new Date();
    this.metadata.lastModifiedBy = userId;
};

// Search bills with filters
billSchema.statics.searchBills = async function(filters) {
    const query = {};

    if (filters.payerContract) {
        query.payerContract = filters.payerContract;
    }

    if (filters.billId) {
        query.billId = filters.billId;
    }

    if (filters.signatureDateStart || filters.signatureDateEnd) {
        query.signatureDate = {};
        if (filters.signatureDateStart) {
            query.signatureDate.$gte = new Date(filters.signatureDateStart);
        }
        if (filters.signatureDateEnd) {
            query.signatureDate.$lte = new Date(filters.signatureDateEnd);
        }
    }

    if (filters.clientId) {
        query['client.id'] = filters.clientId;
    }

    if (filters.clientFirstName) {
        query['client.firstName'] = new RegExp(filters.clientFirstName, 'i');
    }

    if (filters.clientLastName) {
        query['client.lastName'] = new RegExp(filters.clientLastName, 'i');
    }

    if (filters.clientDob) {
        query['client.dateOfBirth'] = new Date(filters.clientDob);
    }

    if (filters.insuranceName) {
        query['client.insurance.name'] = filters.insuranceName;
    }

    if (filters.groupNumber) {
        query['client.insurance.groupNumber'] = filters.groupNumber;
    }

    if (filters.memberNumber) {
        query['client.insurance.memberNumber'] = filters.memberNumber;
    }

    // Handle export/void status filters
    if (filters.showExported !== undefined || filters.showNotExported !== undefined) {
        if (filters.showExported && !filters.showNotExported) {
            query['status.isExported'] = true;
        } else if (!filters.showExported && filters.showNotExported) {
            query['status.isExported'] = false;
        }
    }

    if (filters.showVoided !== undefined || filters.showNotVoided !== undefined) {
        if (filters.showVoided && !filters.showNotVoided) {
            query['status.isVoided'] = true;
        } else if (!filters.showVoided && filters.showNotVoided) {
            query['status.isVoided'] = false;
        }
    }

    return this.find(query).sort({ signatureDate: -1 });
};

const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
