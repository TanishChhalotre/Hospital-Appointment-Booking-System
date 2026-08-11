const { mongoose } = require('../db');

const departmentSchema = new mongoose.Schema({
  id:            { type: Number, required: true, unique: true },
  name:          { type: String, required: true },
  description:   { type: String },
  doctor:        { type: String },
  availableDays: { type: String },
});

module.exports = mongoose.model('Department', departmentSchema);
