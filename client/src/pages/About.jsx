import { useEffect, useState } from "react";
import { api } from "../api";

export default function About() {
  const [hospital, setHospital] = useState(null);

  useEffect(() => {
    api.getHospitalInfo().then(setHospital).catch(console.error);
  }, []);

  if (!hospital) {
    return <div className="loading">Loading about page...</div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>About {hospital.name}</h1>
        <p>Trusted healthcare since 1995</p>
      </header>

      <section className="section card">
        <h2>Who We Are</h2>
        <p>{hospital.about}</p>
      </section>

      <section className="section card-grid">
        <div className="info-card">
          <h3>Our Mission</h3>
          <p>
            To provide affordable, quality medical care to every patient with
            respect and kindness.
          </p>
        </div>
        <div className="info-card">
          <h3>Our Vision</h3>
          <p>
            To become the most trusted community hospital in Gujarat with modern
            technology and caring staff.
          </p>
        </div>
        <div className="info-card">
          <h3>Why Choose Us</h3>
          <ul className="simple-list">
            <li>Experienced doctors</li>
            <li>24/7 emergency service</li>
            <li>Online appointment booking</li>
            <li>Clean and modern facilities</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
