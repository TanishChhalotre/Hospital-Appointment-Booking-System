const express = require('express');
const { mongoose } = require('../db');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Department = require('../models/Department');
const { requireDoctor } = require('../middleware/auth');

const router = express.Router();
const transitions = {
  pending: ['confirmed', 'rejected'],
  confirmed: ['completed'],
};

router.get('/appointments', requireDoctor, async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const [appointments, department] = await Promise.all([
      Appointment.find({ doctorId: doctor._id }).sort({ date: 1, time: 1 }),
      Department.findOne({ id: doctor.departmentId }),
    ]);

    res.json(appointments.map(appt => ({
      id: appt._id,
      departmentId: appt.departmentId,
      departmentName: department?.name || 'Unknown',
      doctorName: doctor.name,
      patientName: appt.patientName,
      date: appt.date,
      time: appt.time,
      reason: appt.reason,
      status: appt.status,
      createdAt: appt.createdAt,
    })));
  } catch (err) {
    next(err);
  }
});

router.patch('/appointments/:id/status', requireDoctor, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }
    const allowedStatuses = ['confirmed', 'rejected', 'completed'];
    const status = String(req.body.status || '').toLowerCase();
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status must be confirmed, rejected, or completed' });
    }

    const [doctor, appointment] = await Promise.all([
      Doctor.findById(req.doctorId),
      Appointment.findById(req.params.id),
    ]);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (!appointment.doctorId.equals(doctor._id)) {
      return res.status(403).json({ message: 'You can only manage your own appointments' });
    }
    if (!(transitions[appointment.status] || []).includes(status)) {
      return res.status(400).json({ message: `Cannot change ${appointment.status} appointment to ${status}` });
    }

    appointment.status = status;
    if (status === 'rejected') appointment.slotKey = undefined;
    await appointment.save();

    res.json({ message: `Appointment ${status} successfully`, status });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
