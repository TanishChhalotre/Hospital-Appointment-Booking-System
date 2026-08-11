import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function DoctorAppointments() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    setLoading(true);
    try {
      const data = await api.getDoctorAppointments();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatus(appointmentId, status) {
    setMessage("");
    setError("");
    setUpdatingId(appointmentId);
    try {
      const result = await api.updateAppointmentStatus(appointmentId, status);
      setMessage(result.message);
      setAppointments(prev => prev.map(appt =>
        appt.id === appointmentId ? { ...appt, status } : appt
      ));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  function handleLogout() {
    logout();
    navigate("/doctor-login");
  }

  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  return (
    <div className="doctor-page">
      <header className="doctor-header">
        <div>
          <h1>Doctor Dashboard</h1>
          <p>
            {user?.name} — {user?.departmentName}
          </p>
        </div>
        <button className="btn btn-outline-dark" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="doctor-stats">
        <div className="info-card">
          <h3>Total Appointments</h3>
          <p className="highlight">{appointments.length}</p>
        </div>
        <div className="info-card">
          <h3>Pending</h3>
          <p className="highlight">{pendingCount}</p>
        </div>
        <div className="info-card">
          <h3>Confirmed</h3>
          <p className="highlight">
            {appointments.filter((a) => a.status === "confirmed").length}
          </p>
        </div>
      </section>

      {error && <p className="error-text">{error}</p>}
      {message && <p className="success-text">{message}</p>}

      <section className="card">
        <h2>Patient Appointments</h2>
        {appointments.length === 0 ? (
          <p className="empty-text">No appointments in your department yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>{appt.patientName}</td>
                    <td>{appt.date}</td>
                    <td>{appt.time}</td>
                    <td>{appt.reason || "-"}</td>
                    <td>
                      <span className={`status ${appt.status}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td>
                      {appt.status === "pending" && (
                        <>
                          <button className="btn btn-primary btn-small" onClick={() => handleStatus(appt.id, "confirmed")} disabled={updatingId === appt.id}>Confirm</button>{" "}
                          <button className="btn btn-outline-dark btn-small" onClick={() => handleStatus(appt.id, "rejected")} disabled={updatingId === appt.id}>Reject</button>
                        </>
                      )}
                      {appt.status === "confirmed" && (
                        <button className="btn btn-primary btn-small" onClick={() => handleStatus(appt.id, "completed")} disabled={updatingId === appt.id}>Complete</button>
                      )}
                      {["rejected", "cancelled", "completed"].includes(appt.status) && <span>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
