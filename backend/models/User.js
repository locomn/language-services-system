const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    role: {
        type: String,
        enum: [
            'Office Administrator',
            'Office User',
            'Location User',
            'Location Limited User',
            'Master Biller',
            'Biller',
            'Poster',
            'Interpreter'
        ],
        required: true
    },
    roleId: {
        type: Number,
        required: true,
        enum: [11, 15, 25, 27, 33, 35, 39, 51]
    },
    group: {
        id: {
            type: Number,
            ref: 'Group'
        },
        name: String
    },
    isEmployee: {
        type: Boolean,
        default: false
    },
    lastSignIn: {
        type: Date
    },
    isDisabled: {
        type: Boolean,
        default: false
    },
    audit: {
        created: {
            date: { type: Date, default: Date.now },
            by: String
        },
        lastModified: {
            date: Date,
            by: String
        }
    }
}, {
    timestamps: true
});

// Indexes for efficient searching
userSchema.index({ username: 1 });
userSchema.index({ 'group.id': 1 });
userSchema.index({ roleId: 1 });
userSchema.index({ isDisabled: 1 });

// Static method to search users with filters
userSchema.statics.searchUsers = async function(filters) {
    const query = {};
    
    if (filters.name) {
        const nameRegex = new RegExp(filters.name, 'i');
        query.$or = [
            { firstName: nameRegex },
            { lastName: nameRegex }
        ];
    }
    
    if (filters.username) {
        query.username = new RegExp(filters.username, 'i');
    }
    
    if (filters.roleId) {
        query.roleId = filters.roleId;
    }
    
    if (filters.groupId) {
        query['group.id'] = filters.groupId;
    }
    
    if (filters.isEmployee !== undefined) {
        query.isEmployee = filters.isEmployee;
    }
    
    return await this.find(query)
        .sort({ lastName: 1, firstName: 1 })
        .select('-password');
};

// Instance method to get full name
userSchema.methods.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
};

// Static method to get role mapping
userSchema.statics.getRoleMapping = function() {
    return {
        11: 'Office Administrator',
        15: 'Office User',
        25: 'Location User',
        27: 'Location Limited User',
        33: 'Master Biller',
        35: 'Biller',
        39: 'Poster',
        51: 'Interpreter'
    };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
