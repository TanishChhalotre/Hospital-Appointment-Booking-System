const test = require('node:test');
const assert = require('node:assert/strict');
const { signupSchema, loginSchema, appointmentSchema, profileSchema } = require('../middleware/validate');

test('accepts a valid signup and normalizes the email', () => {
  const result = signupSchema.parse({ name: 'Demo Patient', email: ' DEMO@EXAMPLE.COM ', password: 'strongpass123' });
  assert.equal(result.email, 'demo@example.com');
});

test('rejects weak passwords', () => {
  assert.equal(signupSchema.safeParse({ name: 'Demo User', email: 'demo@example.com', password: '123' }).success, false);
});

test('rejects unknown login fields', () => {
  assert.equal(loginSchema.safeParse({ email: 'demo@example.com', password: 'password', role: 'admin' }).success, false);
});

test('rejects appointment time outside hospital slots', () => {
  const result = appointmentSchema.safeParse({ departmentId: 1, patientName: 'Demo Patient', date: '2030-01-01', time: '1:30 AM' });
  assert.equal(result.success, false);
});

test('requires at least one profile update', () => {
  assert.equal(profileSchema.safeParse({}).success, false);
});
