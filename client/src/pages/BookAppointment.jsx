import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

export default function BookAppointment() {
  const { user } = useAuth();
  const location = useLocation();
  const [departments, setDepartments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({
    departmentId: location.state?.departmentId || "",
    patientName: user?.name || "",
    date: "",
    time: "",
    reason: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [deptData, apptData] = await Promise.all([
        api.getDepartments(),
        api.getAppointments(),
      ]);
      setDepartments(deptData);
      setAppointments(apptData);
    }
    loadData().catch(console.error);
  }, []);

  const selectedDepartment = departments.find(
    (dept) => dept.id === Number(form.departmentId)
  );

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleCancel(appointmentId) {
    if (!window.confirm("Cancel this appointment?")) return;
    setError("");
    try {
      const result = await api.cancelAppointment(appointmentId);
      setMessage(result.message);
      setAppointments(prev => prev.map(appt =>
        appt.id === appointmentId ? { ...appt, status: "cancelled" } : appt
      ));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const result = await api.bookAppointment(form);
      setMessage(result.message);
      setAppointments((prev) => [result.appointment, ...prev]);
      setForm({
        ...form,
        date: "",
        time: "",
        reason: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Book Appointment</h1>
        <p>Fill the form below to schedule your visit</p>
      </header>

      <div className="two-column">
        <section className="card">
          <h2>Appointment Form</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Department
              <select
                name="departmentId"
                value={form.departmentId}
                onChange={handleChange}
                required
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} — {dept.doctor}
                  </option>
                ))}
              </select>
            </label>

            {selectedDepartment && (
              <div className="doctor-info-box">
                <p>
                  <strong>Doctor:</strong> {selectedDepartment.doctor}
                </p>
                <p>
                  <strong>Available:</strong> {selectedDepartment.availableDays}
                </p>
              </div>
            )}

            <label>
              Patient Name
              <input
                name="patientName"
                value={form.patientName}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Date
              <input
                name="date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={form.date}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Time
              <select
                name="time"
                value={form.time}
                onChange={handleChange}
                required
              >
                <option value="">Select time</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Reason for visit (optional)
              <textarea
                name="reason"
                rows="3"
                value={form.reason}
                onChange={handleChange}
              />
            </label>

            {error && <p className="error-text">{error}</p>}
            {message && <p className="success-text">{message}</p>}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Booking..." : "Book Appointment"}
            </button>
          </form>
        </section>

        <section className="card">
          <h2>Your Appointments</h2>
          {appointments.length === 0 ? (
            <p className="empty-text">No appointments booked yet.</p>
          ) : (
            <div className="appointment-list">
              {appointments.map((appt) => (
                <div className="appointment-item" key={appt.id}>
                  <h4>{appt.departmentName}</h4>
                  <p>Doctor: {appt.doctorName}</p>
                  <p>
                    {appt.date} at {appt.time}
                  </p>
                  <p>Patient: {appt.patientName}</p>
                  <span className={`status ${appt.status}`}>{appt.status}</span>
                  {["pending", "confirmed"].includes(appt.status) && (
                    <button
                      className="btn btn-small btn-outline-dark"
                      type="button"
                      onClick={() => handleCancel(appt.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
