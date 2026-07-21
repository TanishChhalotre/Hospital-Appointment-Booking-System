import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
  });
  const [saved, setSaved] = useState(false);

  function handleToggle(event) {
    const { name, checked } = event.target;
    setSettings({ ...settings, [name]: checked });
    setSaved(false);
  }

  function handleSave(event) {
    event.preventDefault();
    // Saved in browser only for now (no database table yet)
    localStorage.setItem("userSettings", JSON.stringify(settings));
    setSaved(true);
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Settings</h1>
        <p>Manage your app preferences</p>
      </header>

      <section className="card settings-card">
        <h2>Account</h2>
        <p>
          <strong>Logged in as:</strong> {user?.email}
        </p>

        <h2>Notifications</h2>
        <form onSubmit={handleSave}>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleToggle}
            />
            Email me about appointment updates
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="smsNotifications"
              checked={settings.smsNotifications}
              onChange={handleToggle}
            />
            SMS reminders before appointment
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="darkMode"
              checked={settings.darkMode}
              onChange={handleToggle}
            />
            Dark mode (coming soon)
          </label>

          <button className="btn btn-primary" type="submit">
            Save Settings
          </button>
        </form>

        {saved && (
          <p className="success-text">
            Settings saved in browser. (Will move to database later)
          </p>
        )}
      </section>
    </div>
  );
}
