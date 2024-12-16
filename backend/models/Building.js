const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
    active: { type: Boolean, default: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    phone: String,
    fax: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Add indexes for common queries
buildingSchema.index({ organizationId: 1 });
buildingSchema.index({ siteId: 1 });
buildingSchema.index({ active: 1 });
buildingSchema.index({ name: 'text' });

// Pre-save middleware to handle cascading deactivation
buildingSchema.pre('save', async function(next) {
    if (this.isModified('active') && !this.active) {
        const ServiceLocation = mongoose.model('ServiceLocation');
        
        // Deactivate all service locations associated with this building
        await ServiceLocation.updateMany(
            { buildingId: this._id },
            { active: false }
        );
    }
    next();
});

module.exports = mongoose.model('Building', buildingSchema);
