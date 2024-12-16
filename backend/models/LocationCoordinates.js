const mongoose = require('mongoose');

const locationCoordinatesSchema = new mongoose.Schema({
    locationId: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        zipCode: String
    },
    coordinates: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    parkingInstructions: {
        type: String,
        default: ''
    },
    buildingEntrance: {
        type: String,
        default: ''
    },
    navigationNotes: {
        type: String,
        default: ''
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for geospatial queries
locationCoordinatesSchema.index({ coordinates: '2dsphere' });

// Method to calculate distance to another location (in kilometers)
locationCoordinatesSchema.methods.distanceTo = function(targetLat, targetLon) {
    const R = 6371; // Earth's radius in km
    const lat1 = this.coordinates.latitude * Math.PI / 180;
    const lat2 = targetLat * Math.PI / 180;
    const dLat = (targetLat - this.coordinates.latitude) * Math.PI / 180;
    const dLon = (targetLon - this.coordinates.longitude) * Math.PI / 180;

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

const LocationCoordinates = mongoose.model('LocationCoordinates', locationCoordinatesSchema);

module.exports = LocationCoordinates;
