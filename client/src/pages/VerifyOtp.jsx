import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { api } from "../api";

export default function VerifyOtp() {
  // useLocation() lets us read data passed through React Router navigation.
  // When Signup redirects here it passes { email } via location.state.
  const location = useLocation();
  const navigate  = useNavigate();

  // Pre-fill email from navigation state, or empty if user arrived directly
  const [email, setEmail]       = useState(location.state?.email || "");

  // otp is an array of 6 strings — one per input box
  // This gives us individual control over each digit box
  const [otp, setOtp]           = useState(["", "", "", "", "", ""]);

  const [error, setError]       = useState("");
  const [message, setMessage]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);

  // Countdown timer — OTP expires in 10 minutes (600 seconds)
  const [secondsLeft, setSecondsLeft] = useState(600);

  // useRef creates a mutable reference that persists between renders
  // We use it to programmatically focus the next input box after each digit
  const inputRefs = useRef([]);

  // ── Countdown timer ────────────────────────────────────────────────────────
  // useEffect with a dependency array runs whenever the listed values change.
  // Here it runs once when the component mounts (secondsLeft starts at 600).
  // setInterval fires every 1000ms. We store the interval ID so we can
  // clear it in the cleanup function (returned from useEffect).
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);
    // Cleanup: React calls this when the component unmounts or before re-running
    return () => clearInterval(timer);
  }, [secondsLeft]);

  // Format seconds as MM:SS for display (e.g. 600 → "10:00", 65 → "01:05")
  function formatTime(s) {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  }

  // ── Handle each digit box ──────────────────────────────────────────────────
  function handleOtpChange(index, value) {
    // Only allow single digits — slice(0,1) keeps only the first character typed
    const digit = value.replace(/\D/g, "").slice(0, 1);

    // Spread the current otp array into a new array, update the changed index
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next box after a digit is entered
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index, e) {
    // Backspace on an empty box moves focus to the previous box
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  // Handle paste — user pastes "482910" and all 6 boxes fill at once
  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = ["", "", "", "", "", ""];
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    // Focus the last filled box
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  // ── Submit OTP ─────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const otpString = otp.join(""); // ["4","8","2","9","1","0"] → "482910"

    if (otpString.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const result = await api.verifyOtp(email, otpString);
      setMessage(result.message);
      // Wait 1.5 seconds so user can read the success message, then go to login
      setTimeout(() => navigate("/login", { state: { verified: true } }), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  async function handleResend() {
    if (!email) { setError("Please enter your email first."); return; }
    setError("");
    setMessage("");
    setResending(true);
    try {
      const result = await api.resendOtp(email);
      setMessage(result.message);
      // Reset countdown to 10 minutes
      setSecondsLeft(600);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  }

  const isExpired = secondsLeft <= 0;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Verify Your Email</h1>
        <p className="subtitle">
          We sent a 6-digit code to <strong>{email || "your email"}</strong>.
          Enter it below to activate your account.
        </p>

        {/* Show email input only if we don't have it from navigation state */}
        {!location.state?.email && (
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </label>
        )}

        <form onSubmit={handleSubmit}>
          {/* ── 6-box OTP input ── */}
          <div className="otp-boxes">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"    /* shows number keyboard on mobile */
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(index, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="otp-input"
                autoFocus={index === 0}
                disabled={isExpired}
              />
            ))}
          </div>

          {/* ── Timer ── */}
          <p className={`otp-timer ${isExpired ? "otp-timer--expired" : ""}`}>
            {isExpired
              ? "Code expired — request a new one below"
              : `Code expires in ${formatTime(secondsLeft)}`}
          </p>

          {error   && <p className="error-text">{error}</p>}
          {message && <p className="success-text">{message}</p>}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading || isExpired || otp.join("").length !== 6}
            style={{ width: "100%", marginTop: "8px" }}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {/* ── Resend ── */}
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <button
            className="btn btn-secondary"
            onClick={handleResend}
            disabled={resending}
            style={{ width: "100%" }}
          >
            {resending ? "Sending..." : "Resend Code"}
          </button>
        </div>

        <p className="auth-switch" style={{ marginTop: "16px" }}>
          Already verified? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
