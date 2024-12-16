const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
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
            date: { type: Date, default: Date.now },
            by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        },
        lastModified: {
            date: Date,
            by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }
    }
});

// Text index for efficient searching
languageSchema.index({ name: 'text' });

// Static method for searching languages with pagination
languageSchema.statics.searchLanguages = async function(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    return this.find({ isActive: true })
               .sort({ name: 1 }) // Sort alphabetically
               .skip(skip)
               .limit(limit)
               .select('name');
};

const Language = mongoose.model('Language', languageSchema);
module.exports = Language;
