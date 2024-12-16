const mongoose = require('mongoose');

const billingRuleSchema = new mongoose.Schema({
    ruleId: {
        type: Number,
        required: true,
        unique: true
    },
    billingRuleGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BillingRuleGroup',
        required: true
    },
    ruleType: {
        type: String,
        enum: ['Automatic', 'Special', 'Error'],
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    // Conditions (for Automatic and Error rules)
    conditions: {
        // Condition checks
        checkAsl: {
            type: Boolean,
            default: false
        },
        checkCanceled: {
            type: Boolean,
            default: false
        },
        checkServiceType: {
            type: Boolean,
            default: false
        },
        checkCpt: {
            type: Boolean,
            default: false
        },
        checkModifier: {
            type: Boolean,
            default: false
        },
        checkExactTime: {
            type: Boolean,
            default: false
        },
        // Actual values
        isAsl: {
            type: Boolean,
            default: false
        },
        isCanceled: {
            type: Boolean,
            default: false
        },
        serviceType: {
            type: String,
            enum: ['I', 'O', 'T', 'H', 'P', 'V'], // In-Person, Over The Phone, Translation, Home Visit, Phone Conference, Video Conference
            required: false
        },
        cpt: {
            type: String,
            trim: true
        },
        modifier: {
            type: String,
            trim: true
        },
        isExactTime: {
            type: Boolean,
            default: false
        }
    },
    // Units and Rates (only for Automatic and Special rules)
    unitsAndRates: {
        unitLength: {
            type: Number,
            min: 0
        },
        roundUnitsUpAt: {
            type: Number,
            min: 0
        },
        // Contractor Units
        cuMinReq: {
            type: String,
            trim: true
        },
        cuMin: {
            type: Number,
            min: 0
        },
        cuMax: {
            type: Number,
            min: 0
        },
        crMin: {
            type: Number, // Rate in cents (e.g., 10000 = $1.00)
            min: 0
        },
        crAMin: {
            type: Number, // Additional rate in cents
            min: 0
        },
        // Provider Units
        puMinReq: {
            type: String,
            trim: true
        },
        puMin: {
            type: Number,
            min: 0
        },
        puMax: {
            type: Number,
            min: 0
        },
        prMin: {
            type: Number, // Rate in cents
            min: 0
        },
        prAMin: {
            type: Number, // Additional rate in cents
            min: 0
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    audit: {
        created: {
            date: { type: Date, default: Date.now },
            by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        },
        lastModified: {
            date: Date,
            by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }
    }
});

// Indexes for efficient querying
billingRuleSchema.index({ ruleId: 1 });
billingRuleSchema.index({ billingRuleGroup: 1 });
billingRuleSchema.index({ ruleType: 1 });
billingRuleSchema.index({ 'conditions.serviceType': 1 });

// Pre-save middleware to handle rule type specific validation
billingRuleSchema.pre('save', async function(next) {
    // Auto-increment ruleId for new rules
    if (this.isNew) {
        try {
            const lastRule = await this.constructor.findOne({}, {}, { sort: { 'ruleId': -1 } });
            this.ruleId = lastRule ? lastRule.ruleId + 1 : 1;
        } catch (error) {
            return next(error);
        }
    }

    // Special rules only have units and rates
    if (this.ruleType === 'Special') {
        this.conditions = undefined;
    }
    // Error rules only have conditions
    else if (this.ruleType === 'Error') {
        this.unitsAndRates = undefined;
    }
    // Automatic rules have both conditions and units/rates
    else {
        if (!this.conditions || !this.unitsAndRates) {
            return next(new Error('Automatic rules must have both conditions and units/rates'));
        }
    }

    next();
});

const BillingRule = mongoose.model('BillingRule', billingRuleSchema);
module.exports = BillingRule;
