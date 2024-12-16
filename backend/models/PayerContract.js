const mongoose = require('mongoose');

const payerContractSchema = new mongoose.Schema({
    contractId: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: String,
        trim: true
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    exportFormatName: {
        type: String,
        default: 'NON-PMAP 2017',
        trim: true
    },
    billingRuleGroupName: {
        type: String,
        trim: true
    },
    commonBillingRuleGroupName: {
        type: String,
        trim: true
    },
    systemBillingRuleGroupName: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    onlyOneBillItemAllowed: {
        type: Boolean,
        default: true
    },
    isCptRequired: {
        type: Boolean,
        default: false
    },
    isDiagnosisCodeRequired: {
        type: Boolean,
        default: false
    },
    isModifierRequired: {
        type: Boolean,
        default: false
    },
    isExactTimeEnabled: {
        type: Boolean,
        default: false
    },
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
    conditionRelatedToEmployment: {
        type: String,
        enum: ['N', 'Y'],
        default: 'N'
    },
    conditionRelatedToAutoAccident: {
        type: String,
        enum: ['N', 'Y'],
        default: 'N'
    },
    conditionRelatedToOtherAccident: {
        type: String,
        enum: ['N', 'Y'],
        default: 'N'
    },
    practiceIdNumber: {
        type: String,
        trim: true
    },
    payerIdNumber: {
        type: String,
        trim: true
    },
    defaultCpt: {
        type: String,
        trim: true
    },
    cptValues: {
        type: String,
        trim: true
    },
    defaultDiagnosisCode: {
        type: String,
        trim: true
    },
    diagnosisCodeValues: {
        type: String,
        trim: true
    },
    defaultModifier: {
        type: String,
        trim: true
    },
    modifierValues: {
        type: String,
        trim: true
    },
    contractNotes: {
        type: String,
        trim: true
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
payerContractSchema.index({ contractId: 1 });
payerContractSchema.index({ name: 1 });
payerContractSchema.index({ year: 1 });
payerContractSchema.index({ organization: 1 });

// Static method for searching payer contracts with pagination
payerContractSchema.statics.searchPayerContracts = async function(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    return this.find({ isActive: true })
               .populate('organization', 'name')
               .sort({ name: 1 })
               .skip(skip)
               .limit(limit)
               .select('contractId name year exportFormatName billingRuleGroupName organization');
};

// Auto-increment contractId
payerContractSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const lastContract = await this.constructor.findOne({}, {}, { sort: { 'contractId': -1 } });
            this.contractId = lastContract ? lastContract.contractId + 1 : 1;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

const PayerContract = mongoose.model('PayerContract', payerContractSchema);
module.exports = PayerContract;
