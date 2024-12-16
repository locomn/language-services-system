const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    audit: {
        created: {
            date: {
                type: Date,
                default: Date.now
            },
            by: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        },
        lastModified: {
            date: Date,
            by: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    }
}, {
    timestamps: true
});

// Index for search performance
groupSchema.index({ name: 'text', description: 'text' });

// Static method to search groups
groupSchema.statics.searchGroups = async function(filters = {}) {
    const query = { isActive: true };

    if (filters.name) {
        query.name = { $regex: new RegExp(filters.name, 'i') };
    }

    if (filters.description) {
        query.description = { $regex: new RegExp(filters.description, 'i') };
    }

    return this.find(query)
        .sort({ name: 1 });
};

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
