const mongoose = require('mongoose');

const billingRuleGroupSchema = new mongoose.Schema({
    groupId: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    // Type of rules (CLO, HCO, BOTH)
    ruleType: {
        type: String,
        enum: ['CLO', 'HCO', 'BOTH'],
        required: true
    },
    // Base rate configuration
    baseRate: {
        amount: {
            type: Number,
            required: true
        },
        minimumHours: {
            type: Number,
            required: true,
            default: 2
        },
        unitIncrement: {
            type: Number,
            required: true,
            default: 0.25 // 15 minutes
        }
    },
    // Additional rate configuration (e.g., for '40+8.75' format)
    additionalRate: {
        amount: {
            type: Number
        },
        minimumHours: {
            type: Number
        }
    },
    // Special fees
    fees: {
        cancellationFee: {
            type: Number
        },
        noShowFee: {
            type: Number
        }
    },
    notes: {
        type: String,
        trim: true
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
billingRuleGroupSchema.index({ groupId: 1 });
billingRuleGroupSchema.index({ name: 1 });
billingRuleGroupSchema.index({ ruleType: 1 });

// Virtual for billing rules
billingRuleGroupSchema.virtual('billingRules', {
    ref: 'BillingRule',
    localField: '_id',
    foreignField: 'billingRuleGroup'
});

// Static method for searching billing rule groups with pagination
billingRuleGroupSchema.statics.searchBillingRuleGroups = async function(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    return this.find({ isActive: true })
               .sort({ name: 1 })
               .skip(skip)
               .limit(limit)
               .select('groupId name');
};

// Parse billing rule group name to extract rate information
billingRuleGroupSchema.statics.parseRuleGroupName = function(name) {
    const ruleInfo = {
        baseRate: {},
        additionalRate: {},
        ruleType: ''
    };

    // Extract rule type
    if (name.includes('CLO Rules')) {
        ruleInfo.ruleType = 'CLO';
    } else if (name.includes('HCO Rules')) {
        ruleInfo.ruleType = 'HCO';
    } else if (name.includes('BOTH Rules')) {
        ruleInfo.ruleType = 'BOTH';
    }

    // Extract rates
    const ratePattern = /(\d+(?:\.\d+)?)\s*(?:\/\s*(\d+(?:\.\d+)?))?\s*(?:\+\s*(\d+(?:\.\d+)?))?/;
    const matches = name.match(ratePattern);

    if (matches) {
        ruleInfo.baseRate.amount = parseFloat(matches[1]);
        if (matches[2]) {
            ruleInfo.baseRate.minimumHours = parseFloat(matches[2]);
        }
        if (matches[3]) {
            ruleInfo.additionalRate.amount = parseFloat(matches[3]);
        }
    }

    return ruleInfo;
};

// Auto-increment groupId
billingRuleGroupSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const lastGroup = await this.constructor.findOne({}, {}, { sort: { 'groupId': -1 } });
            this.groupId = lastGroup ? lastGroup.groupId + 1 : 1;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

const BillingRuleGroup = mongoose.model('BillingRuleGroup', billingRuleGroupSchema);
module.exports = BillingRuleGroup;
