import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, updateLocalUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .getProfile()
      .then((data) => {
        setProfile(data);
        setForm({ name: data.name, phone: data.phone || "", password: "" });
      })
      .catch(console.error);
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const updates = { name: form.name, phone: form.phone };
    if (form.password) {
      updates.password = form.password;
    }

    try {
      const result = await api.updateProfile(updates);
      setProfile(result.user);
      updateLocalUser(result.user);
      setMessage(result.message);
      setForm({ ...form, password: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!profile) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>My Profile</h1>
        <p>View and update your account details</p>
      </header>

      <div className="two-column">
        <section className="card">
          <h2>Account Info</h2>
          <p>
            <strong>Name:</strong> {profile.name}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Phone:</strong> {profile.phone || "Not added"}
          </p>
          <p>
            <strong>Member since:</strong>{" "}
            {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </section>

        <section className="card">
          <h2>Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Full Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Phone
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </label>
            <label>
              New Password (leave blank to keep current)
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                minLength={6}
              />
            </label>

            {error && <p className="error-text">{error}</p>}
            {message && <p className="success-text">{message}</p>}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
