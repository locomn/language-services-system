const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
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
categorySchema.index({ name: 'text' });

// Static method for searching categories with pagination
categorySchema.statics.searchCategories = async function(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    return this.find({ isActive: true })
               .sort({ name: 1 }) // Sort alphabetically
               .skip(skip)
               .limit(limit)
               .select('name');
};

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
