const mongoose = require('mongoose');

const serviceLocationSchema = new mongoose.Schema({
    version: { type: Number, required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    organizationName: { type: String, required: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site' },
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building' },
    name: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    phone: { type: String, required: true },
    fax: String,
    active: { type: Boolean, default: true },
    interpretersCanAcceptAppts: { type: Boolean, default: true },
    locationCreatedApptDontRequireConfirmation: { type: Boolean, default: false },
    appointmentConfirmation: String,
    emailConfirmationFormat: String,
    sendConfirmationTo: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Add text indexes for search
serviceLocationSchema.index({
    name: 'text',
    organizationName: 'text',
    city: 'text',
    state: 'text'
});

// Add regular indexes for common queries
serviceLocationSchema.index({ organizationId: 1 });
serviceLocationSchema.index({ siteId: 1 });
serviceLocationSchema.index({ buildingId: 1 });
serviceLocationSchema.index({ active: 1 });
serviceLocationSchema.index({ city: 1, state: 1 });

const ServiceLocation = mongoose.model('ServiceLocation', serviceLocationSchema);

module.exports = ServiceLocation;
