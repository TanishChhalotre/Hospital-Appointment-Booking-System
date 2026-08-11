import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  // If redirected here after email verification, show a success notice
  const justVerified = location.state?.verified === true;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/home");
    } catch (err) {
      // Server returns requiresVerification:true when the account exists
      // but email hasn't been verified yet — redirect to OTP page
      if (err.data?.requiresVerification) {
        navigate("/verify-otp", { state: { email: err.data.email } });
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Gurjar Hospital</h1>
        <p className="subtitle">Sign in to book your appointment</p>

        {/* Success banner shown after coming from email verification */}
        {justVerified && (
          <div className="demo-box" style={{ background: "#d1fae5", color: "#065f46", marginBottom: "16px" }}>
            ✅ Email verified! You can now log in.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: "100%" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          New patient? <Link to="/signup">Create account</Link>
        </p>
        <p className="auth-switch">
          Doctor? <Link to="/doctor-login">Doctor login</Link>
        </p>

        <div className="demo-box">
          <p><strong>Demo login:</strong></p>
          <p>Email: demo@gurjarhospital.com</p>
          <p>Password: demo123</p>
        </div>
      </div>
    </div>
  );
}
