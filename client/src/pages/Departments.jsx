import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getDepartments()
      .then(setDepartments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading">Loading departments...</div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Hospital Departments</h1>
        <p>Choose the right department for your health need</p>
      </header>

      <div className="card-grid">
        {departments.map((dept) => (
          <div className="info-card" key={dept.id}>
            <h3>{dept.name}</h3>
            <p>{dept.description}</p>
            <p>
              <strong>Doctor:</strong> {dept.doctor}
            </p>
            <p>
              <strong>Available:</strong> {dept.availableDays}
            </p>
            <Link
              to="/book-appointment"
              state={{ departmentId: dept.id }}
              className="btn btn-secondary"
            >
              Book in this department
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
