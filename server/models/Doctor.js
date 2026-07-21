const { mongoose } = require('../db');

const doctorSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, required: true },
  departmentId: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
