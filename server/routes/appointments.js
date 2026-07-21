const express = require('express');
const Appointment = require('../models/Appointment');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const { requireLogin } = require('../middleware/auth');
const { validate, appointmentSchema } = require('../middleware/validate');

const router = express.Router();

function isPastAppointment(date, time) {
  const match = time.match(/^(\d{1,2}):(\d{2}) (AM|PM)$/);
  if (!match) return true;
  let hour = Number(match[1]);
  if (match[3] === 'PM' && hour !== 12) hour += 12;
  if (match[3] === 'AM' && hour === 12) hour = 0;
  const appointmentDate = new Date(`${date}T${String(hour).padStart(2, '0')}:${match[2]}:00`);
  return Number.isNaN(appointmentDate.getTime()) || appointmentDate <= new Date();
}

function toResponse(appt, departmentName) {
  return {
    id: appt._id,
    departmentId: appt.departmentId,
    departmentName,
    doctorName: appt.doctorName,
    patientName: appt.patientName,
    date: appt.date,
    time: appt.time,
    reason: appt.reason,
    status: appt.status,
    createdAt: appt.createdAt,
  };
}

router.get('/', requireLogin, async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ userId: req.userId }).sort({ createdAt: -1 });
    const departments = await Department.find();
    const names = new Map(departments.map(dept => [dept.id, dept.name]));
    res.json(appointments.map(appt => toResponse(appt, names.get(appt.departmentId) || 'Unknown')));
  } catch (err) {
    next(err);
  }
});

router.post('/', requireLogin, validate(appointmentSchema), async (req, res, next) => {
  try {
    const { departmentId, patientName, date, time, reason } = req.body;

    if (isPastAppointment(date, time)) {
      return res.status(400).json({ message: 'Please choose a future appointment date and time' });
    }

    const [department, doctor] = await Promise.all([
      Department.findOne({ id: departmentId }),
      Doctor.findOne({ departmentId }),
    ]);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    if (!doctor) return res.status(409).json({ message: 'No doctor is currently assigned to this department' });

    const appointment = await Appointment.create({
      userId: req.userId,
      doctorId: doctor._id,
      departmentId,
      doctorName: doctor.name,
      patientName,
      date,
      time,
      reason,
      status: 'pending',
      slotKey: `${doctor._id}:${date}:${time}`,
    });

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: toResponse(appointment, department.name),
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'This appointment slot has already been booked' });
    }
    next(err);
  }
});

// Only the owner can cancel, and completed/rejected appointments cannot be cancelled.
router.patch('/:id/cancel', requireLogin, async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, userId: req.userId });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (!['pending', 'confirmed'].includes(appointment.status)) {
      return res.status(400).json({ message: `A ${appointment.status} appointment cannot be cancelled` });
    }

    appointment.status = 'cancelled';
    appointment.slotKey = undefined;
    await appointment.save();
    res.json({ message: 'Appointment cancelled successfully', status: appointment.status });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
