const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Location Information
  location: {
    category: { type: String, required: true },  // e.g., "HP REGIONS HOSPITAL - [10267]"
    name: { type: String, required: true },      // e.g., "RC - INPATIENT"
    organizationLocationId: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      phone: String
    },
    department: String,
    unitRoomNumber: String,
    locationsClientIdNumber: String  // MR/Chart number
  },

  // Contact Information
  contact: {
    category: String,
    location: String,
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    fax: String,
    flaggedForAttention: { type: Boolean, default: false }
  },

  // Appointment Details
  requestInfo: {
    requestedOn: { type: Date, required: true },
    requestedBy: { type: String, required: true },
    intakeMethod: {
      type: String,
      enum: ['C', 'F', 'P', 'E', 'L', 'I', 'W', 'A'],
      required: true
    },
    serviceType: {
      type: String,
      enum: ['I', 'O', 'T', 'H', 'P', 'V'],
      required: true
    }
  },

  appointmentDetails: {
    csn: String,  // Location's Appointment/Case #
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    checkedInTime: String,
    checkedInBy: String,
    checkedOutTime: String,
    checkedOutBy: String
  },

  language: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
    required: true
  },

  interpreter: {
    requested: { type: mongoose.Schema.Types.ObjectId, ref: 'Interpreter' },
    requestedGender: {
      type: String,
      enum: ['MP', 'FP', 'MO', 'FO', '']
    },
    assigned: { type: mongoose.Schema.Types.ObjectId, ref: 'Interpreter' },
    assignedOn: Date,
    assignedBy: String,
    assignedCell: String,
    interpreterAsked: { type: Boolean, default: false },
    badgeNumber: String
  },

  // Assignment Details
  assignment: {
    needsApproval: { type: Boolean, default: false },
    appointmentNumber: String,
    assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },

  // Status Information
  status: {
    confirmedOn: Date,
    cancelReason: {
      type: String,
      enum: ['', 'L', 'O', 'C', 'N', 'U', 'I', 'M', 'P', 'D']
    },
    canceledOn: Date,
    canceledBy: String,
    canceledAt: Date
  },

  // Client Information
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },

  // Insurance Information
  insurance: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Insurance' },
    isApproved: { type: Boolean, default: false },
    approvedOn: Date,
    approvedBy: String
  },

  // GPS Coordinates for Interpreter App
  gpsCoordinates: {
    latitude: Number,
    longitude: Number,
    parkingInstructions: String,
    buildingEntrance: String,
    navigationNotes: String
  },

  // Audit Trail
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true },
  updatedBy: String,

  // Existing fields
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  serviceType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  }
}, {
  timestamps: true
});

// Update timestamp on save
appointmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for common queries
appointmentSchema.index({ 'appointmentDetails.date': 1 });
appointmentSchema.index({ 'interpreter.assigned': 1 });
appointmentSchema.index({ 'language': 1 });
appointmentSchema.index({ 'location.category': 1 });
appointmentSchema.index({ 'client': 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
