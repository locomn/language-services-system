const mongoose = require('mongoose');

const requestorSchema = new mongoose.Schema({
    // Basic Information
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    
    // Contact Information
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return /\d{10,}/.test(v.replace(/\D/g,''));
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    fax: {
        type: String,
        trim: true
    },
    cell: {
        type: String,
        trim: true
    },
    pager: {
        type: String,
        trim: true
    },

    // Status
    active: {
        type: Boolean,
        default: true
    },

    // Organization Details
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    department: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        trim: true
    },

    // Preferences
    preferredContactMethod: {
        type: String,
        enum: ['email', 'phone', 'cell', 'pager'],
        default: 'email'
    },
    notificationPreferences: {
        appointmentConfirmation: {
            type: Boolean,
            default: true
        },
        interpreterAssigned: {
            type: Boolean,
            default: true
        },
        appointmentReminder: {
            type: Boolean,
            default: true
        },
        interpreterArrival: {
            type: Boolean,
            default: false
        }
    },

    // Audit Fields
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    lastLoginAt: Date
});

// Update timestamp on save
requestorSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Instance method to format phone numbers
requestorSchema.methods.formatPhoneNumber = function() {
    const cleaned = ('' + this.phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return null;
};

// Virtual for full name
requestorSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`.trim();
});

// Method to check if requestor can be contacted
requestorSchema.methods.canBeContacted = function() {
    return this.active && (this.email || this.phone || this.cell || this.pager);
};

const Requestor = mongoose.model('Requestor', requestorSchema);

module.exports = Requestor;
