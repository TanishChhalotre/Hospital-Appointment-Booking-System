const { mongoose } = require('../db');

const hospitalSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  tagline:      { type: String },
  about:        { type: String },
  address:      { type: String },
  phone:        { type: String },
  email:        { type: String },
  workingHours: { type: String },
});

module.exports = mongoose.model('Hospital', hospitalSchema);
