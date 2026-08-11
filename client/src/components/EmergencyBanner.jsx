import { useEffect, useState } from "react";
import { api } from "../api";

export default function EmergencyBanner() {
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await api.getHospitalInfo();
        if (mounted) setHospital(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return null;

  const phone = hospital?.emergencyPhone || hospital?.phone;
  const address = hospital?.address;

  return (
    <div className="emergency-banner" role="note" aria-label="Emergency contact">
      <div className="emergency-left">
        <span className="emergency-pill">EMERGENCY</span>
        <span className="emergency-text">
          Call:{" "}
          <a className="emergency-link" href={`tel:${phone}`}>
            {phone}
          </a>
          {address ? <span className="emergency-dot">•</span> : null}
          {address ? <span className="emergency-address">{address}</span> : null}
        </span>
      </div>
      <a className="emergency-action" href="/contact">
        Get Help
      </a>
    </div>
  );
}



