const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    active: { type: Boolean, default: true },
    hasBuildings: { type: Boolean, default: false },
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
siteSchema.index({ organizationId: 1 });
siteSchema.index({ active: 1 });
siteSchema.index({ name: 'text' });

// Pre-save middleware to handle cascading deactivation
siteSchema.pre('save', async function(next) {
    if (this.isModified('active') && !this.active) {
        const Building = mongoose.model('Building');
        const ServiceLocation = mongoose.model('ServiceLocation');
        
        // Deactivate all buildings associated with this site
        await Building.updateMany(
            { siteId: this._id },
            { active: false }
        );

        // Deactivate all service locations associated with this site
        await ServiceLocation.updateMany(
            { siteId: this._id },
            { active: false }
        );
    }
    next();
});

module.exports = mongoose.model('Site', siteSchema);
