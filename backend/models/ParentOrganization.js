const mongoose = require('mongoose');

const parentOrganizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    organizationCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['HEALTHCARE', 'INSURANCE', 'GOVERNMENT', 'EDUCATION', 'OTHER'],
        required: true
    },
    settings: {
        namingConvention: {
            pattern: String,
            rules: mongoose.Schema.Types.Mixed
        }
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
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
}, {
    timestamps: true
});

// Indexes
parentOrganizationSchema.index({ organizationCode: 1 });
parentOrganizationSchema.index({ name: 'text' });
parentOrganizationSchema.index({ type: 1 });

const ParentOrganization = mongoose.model('ParentOrganization', parentOrganizationSchema);
module.exports = ParentOrganization;
