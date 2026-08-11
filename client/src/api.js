// All API calls go through this file.
const API_URL = import.meta.env.VITE_API_URL || "";

function getToken() {
  return localStorage.getItem("token");
}

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data     = await response.json();

  if (!response.ok) {
    // Attach the full data to the error so components can read
    // requiresVerification and email from the server response
    const err = new Error(data.message || "Something went wrong");
    err.data  = data;
    throw err;
  }

  return data;
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  login: (email, password) =>
    apiRequest("/api/auth/login", {
      method: "POST",
      body:   JSON.stringify({ email, password }),
    }),

  signup: (name, email, password, phone) =>
    apiRequest("/api/auth/signup", {
      method: "POST",
      body:   JSON.stringify({ name, email, password, phone }),
    }),

  // Verify email with the 6-digit OTP the user received
  verifyOtp: (email, otp) =>
    apiRequest("/api/auth/verify-otp", {
      method: "POST",
      body:   JSON.stringify({ email, otp }),
    }),

  // Request a fresh OTP (e.g. if the first one expired)
  resendOtp: (email) =>
    apiRequest("/api/auth/resend-otp", {
      method: "POST",
      body:   JSON.stringify({ email }),
    }),

  doctorLogin: (email, password) =>
    apiRequest("/api/auth/doctor-login", {
      method: "POST",
      body:   JSON.stringify({ email, password }),
    }),

  // ── Users ─────────────────────────────────────────────────────────────────
  getProfile: () => apiRequest("/api/users/profile"),

  updateProfile: (updates) =>
    apiRequest("/api/users/profile", {
      method: "PUT",
      body:   JSON.stringify(updates),
    }),

  // ── Hospital / Departments ────────────────────────────────────────────────
  getHospitalInfo: () => apiRequest("/api/hospital"),
  getDepartments:  () => apiRequest("/api/departments"),

  // ── Appointments ──────────────────────────────────────────────────────────
  getAppointments: () => apiRequest("/api/appointments"),

  bookAppointment: (formData) =>
    apiRequest("/api/appointments", {
      method: "POST",
      body:   JSON.stringify(formData),
    }),

  cancelAppointment: (appointmentId) =>
    apiRequest(`/api/appointments/${appointmentId}/cancel`, { method: "PATCH" }),

  // ── Doctor ────────────────────────────────────────────────────────────────
  getDoctorAppointments: () => apiRequest("/api/doctor/appointments"),

  updateAppointmentStatus: (appointmentId, status) =>
    apiRequest(`/api/doctor/appointments/${appointmentId}/status`, {
      method: "PATCH",
      body:   JSON.stringify({ status }),
    }),
};
