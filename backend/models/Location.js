const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    locationId: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true
    },
    categoryId: {
        type: Number,
        required: true
    },
    organizationId: {
        type: Number,
        required: true
    },
    kttsLocationName: {
        type: String,
        required: true
    },
    organizationLocationName: String,
    organizationLocationId: String,
    address: {
        street: String,
        city: String,
        state: {
            type: String,
            default: 'MN'
        },
        zipCode: String
    },
    contact: {
        phone: String,
        fax: String
    },
    confirmation: {
        type: {
            type: String,
            enum: ['Manual', 'Automatic'],
            default: 'Manual'
        },
        format: String,
        sendTo: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: undefined
        }
    },
    audit: {
        created: {
            date: { type: Date, default: Date.now },
            time: String,
            by: String
        },
        lastEdited: {
            date: Date,
            time: String,
            by: String
        }
    }
}, {
    timestamps: true
});

// Index for geospatial queries
locationSchema.index({ coordinates: '2dsphere' });

// Static method to get all unique categories
locationSchema.statics.getCategories = async function() {
    return await this.distinct('category').sort();
};

// Static method to search locations with filters
locationSchema.statics.searchLocations = async function(filters) {
    const query = {};
    
    if (filters.category) {
        query.category = filters.category;
    }
    
    if (filters.organizationsLocationId) {
        query.organizationLocationId = filters.organizationsLocationId;
    }
    
    if (filters.name) {
        query.$or = [
            { kttsLocationName: { $regex: filters.name, $options: 'i' } },
            { organizationLocationName: { $regex: filters.name, $options: 'i' } }
        ];
    }
    
    if (filters.id) {
        query.locationId = filters.id;
    }
    
    if (filters.address) {
        query['address.street'] = { $regex: filters.address, $options: 'i' };
    }
    
    // Handle active/non-active filter
    if (filters.showActive && !filters.showNonActive) {
        query.isActive = true;
    } else if (!filters.showActive && filters.showNonActive) {
        query.isActive = false;
    }
    
    return await this.find(query).sort('kttsLocationName');
};

// Instance method to format address
locationSchema.methods.getFormattedAddress = function() {
    const addr = this.address;
    return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
};

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
