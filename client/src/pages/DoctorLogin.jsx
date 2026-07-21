import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DoctorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { doctorLogin } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await doctorLogin(email, password);
      navigate("/doctor/appointments");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page doctor-auth-page">
      <div className="auth-card">
        <h1>Doctor Login</h1>
        <p className="subtitle">Sign in to view and confirm appointments</p>

        <form onSubmit={handleSubmit}>
          <label>
            Doctor Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@gurjarhospital.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Doctor Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Patient? <Link to="/login">Patient login</Link>
        </p>

        <div className="demo-box">
          <p><strong>Demo doctor logins (password : doctor123):</strong></p>
          <p>General Medicine: rajesh@gurjarhospital.com</p>
          {/* <p>Cardiology: priya@gurjarhospital.com</p>
          <p>Orthopedics: amit@gurjarhospital.com</p>
          <p>Pediatrics: neha@gurjarhospital.com</p>
          <p>Gynecology: kavita@gurjarhospital.com</p> */}
        </div>
      </div>
    </div>
  );
}
