# Gurjar Hospital — Appointment Booking System

## Live Demo

https://hospital-appointment-booking-system-dlno.onrender.com

A full-stack hospital appointment system built with React, Express and MongoDB. It demonstrates authentication, role-based authorization, server-side validation, appointment workflow rules and database-level double-booking prevention.

## Features

### Patients
- Sign up and sign in using JWT authentication and bcrypt password hashing
- View/update their profile
- Book only future appointments in predefined hospital time slots
- View their own appointments
- Cancel pending or confirmed appointments

### Doctors
- Sign in through a separate doctor portal
- View only appointments assigned to them
- Confirm or reject pending appointments
- Mark confirmed appointments as completed

### Backend quality and security
- MongoDB `ObjectId` references for patients and doctors
- Unique active slot key to prevent concurrent double booking
- Zod request validation
- Helmet security headers and a 20 KB request limit
- Rate limiting on authentication routes
- Strict CORS allowlist
- Central error handling without exposing internal errors
- Five automated validation tests
- Multi-stage production Docker image

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcrypt |
| Validation/security | Zod, Helmet, express-rate-limit |
| Testing | Node.js test runner |
| Deployment | Docker, Render |

## Local setup

1. Copy `.env.example` to `server/.env` and replace the placeholders.
2. Install and start the backend:

```bash
cd server
npm ci
npm start
```

3. In another terminal, install and start the frontend:

```bash
cd client
npm ci
npm run dev
```

The frontend runs at `http://localhost:5173` and the API at `http://localhost:5000`.

## Environment variables

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=at_least_32_random_characters
CLIENT_URL=http://localhost:5173
PORT=5000
SEED_DATABASE=true
```

`SEED_DATABASE=true` creates demonstration hospital, department, doctor and patient records if they do not exist. Do not use predictable demo credentials for a real production system.

> Schema note: this version replaces the old numeric appointment `userId` with MongoDB ObjectId references. If you used an older development database, delete its old appointment documents before testing this version.

## Tests and production build

```bash
cd server && npm test
cd ../client && npm run build
```

## Main API endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register patient |
| POST | `/api/auth/login` | Public | Patient login |
| POST | `/api/auth/doctor-login` | Public | Doctor login |
| GET | `/api/users/profile` | Patient | Get profile |
| PUT | `/api/users/profile` | Patient | Update profile |
| GET | `/api/appointments` | Patient | List own appointments |
| POST | `/api/appointments` | Patient | Book appointment |
| PATCH | `/api/appointments/:id/cancel` | Patient/owner | Cancel appointment |
| GET | `/api/doctor/appointments` | Doctor | List assigned appointments |
| PATCH | `/api/doctor/appointments/:id/status` | Assigned doctor | Confirm/reject/complete |
| GET | `/api/health` | Public | Health check |

## Render deployment

1. Push the repository to GitHub.
2. Create a **Web Service** on Render and select the **Docker** runtime.
3. Keep the repository root as the root directory and use `./Dockerfile`.
4. Add `MONGODB_URI`, a 32+ character `JWT_SECRET`, `CLIENT_URL`, and `SEED_DATABASE`.
5. Initially set `CLIENT_URL` to your exact `https://<service>.onrender.com` URL and redeploy.
6. Render supplies `PORT`; do not hardcode it in the dashboard.
7. Allow the required network access in MongoDB Atlas.

The server binds to `0.0.0.0` and serves the Vite production build, so only one Render web service is required.

## Appointment workflow

```text
pending ──> confirmed ──> completed
   └──────> rejected
pending/confirmed ──────> cancelled (by appointment owner)
```

Rejected and cancelled appointments release their slot. Double booking is prevented by a unique database key, not only by frontend checks.
