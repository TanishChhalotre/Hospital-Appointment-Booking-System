// All API calls go through this file.
// Change API_URL when you deploy to Render or Docker.

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

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const api = {
  login: (email, password) =>
    apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: (name, email, password, phone) =>
    apiRequest("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password, phone }),
    }),

  getProfile: () => apiRequest("/api/users/profile"),

  updateProfile: (updates) =>
    apiRequest("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  getHospitalInfo: () => apiRequest("/api/hospital"),

  getDepartments: () => apiRequest("/api/departments"),

  getAppointments: () => apiRequest("/api/appointments"),

  bookAppointment: (formData) =>
    apiRequest("/api/appointments", {
      method: "POST",
      body: JSON.stringify(formData),
    }),

  doctorLogin: (email, password) =>
    apiRequest("/api/auth/doctor-login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getDoctorAppointments: () => apiRequest("/api/doctor/appointments"),

  cancelAppointment: (appointmentId) =>
    apiRequest(`/api/appointments/${appointmentId}/cancel`, {
      method: "PATCH",
    }),

  updateAppointmentStatus: (appointmentId, status) =>
    apiRequest(`/api/doctor/appointments/${appointmentId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
