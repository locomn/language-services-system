const mongoose = require('mongoose');

const payrollDateSchema = new mongoose.Schema({
    cutoffDate: {
        type: Date,
        required: true
    },
    payDate: {
        type: Date,
        required: true
    },
    payPeriodInformation: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    audit: {
        created: {
            date: { type: Date, default: Date.now },
            by: { 
                type: String,
                required: true
            }
        },
        lastModified: {
            date: Date,
            by: String
        }
    }
});

// Index for efficient date-based queries
payrollDateSchema.index({ cutoffDate: -1 });
payrollDateSchema.index({ payDate: -1 });

// Static method for searching payroll dates with pagination
payrollDateSchema.statics.searchPayrollDates = async function(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    return this.find({ isActive: true })
               .sort({ cutoffDate: -1 }) // Sort by cutoff date descending
               .skip(skip)
               .limit(limit)
               .select('cutoffDate payDate payPeriodInformation audit');
};

// Format dates for display
payrollDateSchema.methods.formatDates = function() {
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatCreatedDate = (date) => {
        return date.toLocaleDateString('en-US', {
            month: '1-digit',
            day: '1-digit',
            year: '2-digit'
        });
    };

    return {
        cutoffDate: formatDate(this.cutoffDate),
        payDate: formatDate(this.payDate),
        createdDate: formatCreatedDate(this.audit.created.date),
        createdTime: formatTime(this.audit.created.date)
    };
};

const PayrollDate = mongoose.model('PayrollDate', payrollDateSchema);
module.exports = PayrollDate;
