const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
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
departmentSchema.index({ name: 'text' });

// Static method to search departments
departmentSchema.statics.searchDepartments = async function(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    return this.find({ isActive: true })
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);
};

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
