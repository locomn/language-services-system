const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const payrollItemSchema = new Schema({
    payrollItemId: {
        type: Number,
        required: true,
        unique: true
    },
    signatureDate: {
        type: Date,
        required: true
    },
    payDate: {
        type: Date,
        required: true
    },
    cutoffDate: {
        type: Date,
        required: true
    },
    dateOfService: {
        type: Date,
        required: true
    },
    payStartTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // Format: HH:MM (24-hour)
    },
    payEndTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // Format: HH:MM (24-hour)
    },
    payAmount: {
        type: Number,
        required: true,
        min: 0
    },
    appointmentId: {
        type: Number,
        required: true,
        ref: 'Appointment'
    },
    billId: {
        type: Number,
        required: true,
        ref: 'Bill'
    },
    interpreterId: {
        type: Number,
        required: true,
        ref: 'Interpreter'
    },
    comment: {
        type: String
    },
    audit: {
        created: {
            date: { type: Date },
            time: { type: String },
            by: { type: String }
        },
        lastEdited: {
            date: { type: Date },
            time: { type: String },
            by: { type: String }
        },
        exported: {
            date: { type: Date },
            time: { type: String },
            by: { type: String }
        }
    }
}, {
    timestamps: true
});

// Static method to calculate total pay amount for given payroll items
payrollItemSchema.statics.calculateTotalPayAmount = async function(query) {
    const result = await this.aggregate([
        { $match: query },
        { $group: {
            _id: null,
            totalAmount: { $sum: "$payAmount" }
        }}
    ]);
    return result.length > 0 ? result[0].totalAmount : 0;
};

// Instance method to calculate duration in hours
payrollItemSchema.methods.calculateDuration = function() {
    const startParts = this.payStartTime.split(':');
    const endParts = this.payEndTime.split(':');
    
    const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
    
    return (endMinutes - startMinutes) / 60;
};

const PayrollItem = mongoose.model('PayrollItem', payrollItemSchema);

module.exports = PayrollItem;
