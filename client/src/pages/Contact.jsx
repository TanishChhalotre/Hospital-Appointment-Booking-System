import { useEffect, useState } from "react";
import { api } from "../api";

export default function Contact() {
  const [hospital, setHospital] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.getHospitalInfo().then(setHospital).catch(console.error);
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    // Dummy form - no backend yet. Shows success message only.
    setSent(true);
    setForm({ name: "", email: "", message: "" });
  }

  if (!hospital) {
    return <div className="loading">Loading contact page...</div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Contact Us</h1>
        <p>We are here to help you</p>
      </header>

      <div className="two-column">
        <section className="card">
          <h2>Hospital Details</h2>
          <p>
            <strong>Address:</strong> {hospital.address}
          </p>
          <p>
            <strong>Phone:</strong> {hospital.phone}
          </p>
          <p>
            <strong>Email:</strong> {hospital.email}
          </p>
          <p>
            <strong>Hours:</strong> {hospital.workingHours}
          </p>
        </section>

        <section className="card">
          <h2>Send a Message</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Your Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Your Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Message
              <textarea
                name="message"
                rows="4"
                value={form.message}
                onChange={handleChange}
                required
              />
            </label>
            <button className="btn btn-primary" type="submit">
              Send Message
            </button>
          </form>
          {sent && (
            <p className="success-text">
              Thank you! Your message has been received. (Demo only)
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
