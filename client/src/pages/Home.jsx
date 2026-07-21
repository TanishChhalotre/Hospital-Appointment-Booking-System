import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import HomeHeroBackground from "../components/HomeHeroBackground";

export default function Home() {
  const { user } = useAuth();
  const [hospital, setHospital] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [hospitalData, appointmentData] = await Promise.all([
          api.getHospitalInfo(),
          api.getAppointments(),
        ]);
        setHospital(hospitalData);
        setAppointments(appointmentData.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="loading">Loading home page...</div>;
  }

  return (
    <div className="page">
      <header className="page-header" style={{ marginTop: "0px" }}>
        <h1>Welcome, {user?.name}</h1>
        <p>{hospital?.tagline}</p>
      </header>

      <HomeHeroBackground />


      <section className="card-grid">
        <div className="info-card">
          <h3>Quick Book</h3>
          <p>Book a doctor appointment in a few clicks.</p>
          <Link to="/book-appointment" className="btn btn-primary">
            Book Appointment
          </Link>
        </div>

        <div className="info-card">
          <h3>Our Departments</h3>
          <p>Cardiology, Pediatrics, Orthopedics and more.</p>
          <Link to="/departments" className="btn btn-secondary">
            View Departments
          </Link>
        </div>

        <div className="info-card">
          <h3>Need Help?</h3>
          <p>Call us anytime for emergency support.</p>
          <p className="highlight">{hospital?.phone}</p>
        </div>
      </section>

      <section className="section">
        <h2>Your Recent Appointments</h2>
        {appointments.length === 0 ? (
          <p className="empty-text">No appointments yet. Book your first visit.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>{appt.departmentName}</td>
                    <td>{appt.doctorName}</td>
                    <td>{appt.date}</td>
                    <td>{appt.time}</td>
                    <td>
                      <span className={`status ${appt.status}`}>
                        {appt.status}
                      </span>
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
