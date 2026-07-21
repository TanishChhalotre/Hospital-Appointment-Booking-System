const { z } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: 'Please correct the submitted information',
        errors: result.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    req.body = result.data;
    next();
  };
}

const email = z.string().trim().toLowerCase().email().max(150);
const password = z.string().min(8, 'Password must contain at least 8 characters').max(72);
const name = z.string().trim().min(2).max(80);

const signupSchema = z.object({
  name,
  email,
  password,
  phone: z.string().trim().max(20).optional().default(''),
}).strict();

const loginSchema = z.object({ email, password: z.string().min(1).max(72) }).strict();

const appointmentSchema = z.object({
  departmentId: z.coerce.number().int().positive(),
  patientName: name,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use date format YYYY-MM-DD'),
  time: z.enum(['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']),
  reason: z.string().trim().max(500).optional().default(''),
}).strict();

const profileSchema = z.object({
  name: name.optional(),
  phone: z.string().trim().max(20).optional(),
  password: password.optional(),
}).strict().refine(value => Object.keys(value).length > 0, 'Provide at least one field');

module.exports = { validate, signupSchema, loginSchema, appointmentSchema, profileSchema };
