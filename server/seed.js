const bcrypt = require('bcryptjs');
const User       = require('./models/User');
const Doctor     = require('./models/Doctor');
const Department = require('./models/Department');
const Appointment = require('./models/Appointment');
const Hospital   = require('./models/Hospital');

// ─── Seed Data ────────────────────────────────────────────────────────────────

const hospitalData = {
  name:         'Gurjar Hospital',
  tagline:      'Caring for your health with trust and compassion',
  about:        'Gurjar Hospital has been serving the community since 1995. We provide affordable and quality healthcare with modern facilities and experienced doctors.',
  address:      '42A/3 Vijay Nagar, Indore, Madhya Pradesh, India',
  phone:        '+91 98765 43210',
  email:        'info@gurjarhospital.com',
  workingHours: '24/7 Emergency | OPD: 8:00 AM - 8:00 PM',
};

const departmentsData = [
  { id: 1, name: 'General Medicine', description: 'Treatment for common illnesses like fever, cold, and infections.', doctor: 'Dr. Rajesh Gurjar', availableDays: 'Mon - Sat' },
  { id: 2, name: 'Cardiology',       description: 'Heart related checkups and treatment.',                           doctor: 'Dr. Priya Sharma', availableDays: 'Mon, Wed, Fri' },
  { id: 3, name: 'Orthopedics',      description: 'Bone, joint, and muscle problems.',                               doctor: 'Dr. Amit Patel',   availableDays: 'Tue - Sat' },
  { id: 4, name: 'Pediatrics',       description: 'Healthcare for children and infants.',                            doctor: 'Dr. Neha Singh',   availableDays: 'Mon - Fri' },
  { id: 5, name: 'Gynecology',       description: 'Women health and maternity care.',                                doctor: 'Dr. Kavita Mehta', availableDays: 'Mon, Tue, Thu, Sat' },
];

const doctorsData = [
  { name: 'Dr. Rajesh Gurjar', email: 'rajesh@gurjarhospital.com', departmentId: 1 },
  { name: 'Dr. Priya Sharma',  email: 'priya@gurjarhospital.com',  departmentId: 2 },
  { name: 'Dr. Amit Patel',    email: 'amit@gurjarhospital.com',   departmentId: 3 },
  { name: 'Dr. Neha Singh',    email: 'neha@gurjarhospital.com',   departmentId: 4 },
  { name: 'Dr. Kavita Mehta',  email: 'kavita@gurjarhospital.com', departmentId: 5 },
];

// ─── Seeder Functions ─────────────────────────────────────────────────────────

async function seedHospital() {
  const exists = await Hospital.findOne();
  if (exists) return;

  await Hospital.create(hospitalData);
  console.log('🏥 Hospital info seeded');
}

async function seedDepartments() {
  const exists = await Department.findOne();
  if (exists) return;

  await Department.insertMany(departmentsData);
  console.log('🏢 Departments seeded (5)');
}

async function seedDoctors() {
  const exists = await Doctor.findOne();
  if (exists) return;

  const hashedPassword = await bcrypt.hash('doctor123', 10);
  const docs = doctorsData.map(d => ({ ...d, password: hashedPassword }));
  await Doctor.insertMany(docs);
  console.log('👨‍⚕️ Doctors seeded (5) — password: doctor123');
}

async function seedDemoUser() {
  const exists = await User.findOne({ email: 'demo@gurjarhospital.com' });
  if (exists) return;

  const hashedPassword = await bcrypt.hash('demo123', 10);
  await User.create({
    name:     'Demo Patient',
    email:    'demo@gurjarhospital.com',
    password: hashedPassword,
    phone:    '9876543210',
  });
  console.log('👤 Demo user seeded — demo@gurjarhospital.com / demo123');
}

// ─── Main Seed Entry ──────────────────────────────────────────────────────────

async function seedDatabase() {
  await seedHospital();
  await seedDepartments();
  await seedDoctors();
  await seedDemoUser();
}

module.exports = { seedDatabase };
