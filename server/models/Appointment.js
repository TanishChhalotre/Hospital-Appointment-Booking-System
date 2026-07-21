const { mongoose } = require('../db');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true,
  },
  departmentId: { type: Number, required: true, index: true },
  doctorName: { type: String, required: true, trim: true },
  patientName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  time: { type: String, required: true },
  reason: { type: String, default: '', trim: true, maxlength: 500 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
    default: 'pending',
    index: true,
  },
  // Active bookings have a unique slotKey. It is removed when rejected/cancelled,
  // which makes that slot available for another patient.
  slotKey: { type: String, unique: true, sparse: true, select: false },
}, { timestamps: true });

appointmentSchema.index({ doctorId: 1, date: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
