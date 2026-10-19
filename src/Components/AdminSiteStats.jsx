import React, { useEffect, useState } from "react";
import { BACKEND_URL } from "../Services/eventUtils";
import { DEFAULT_STATS, PLATFORMS, plus, setSiteStats } from "../Services/siteStats";

// Edit the numbers shown on the website. One save updates every page that uses them.
//   section="ratings"  -> Eventbrite + Meetup ratings (Reviews tab)
//   section="numbers"  -> followers, community total, By The Numbers (Site Numbers tab)

const RATING_FIELDS = [
  { key: "eventbriteRating", label: "Eventbrite rating", where: "Home page, Real Voices" },
  { key: "meetupRating", label: "Meetup rating", where: "Home page, Real Voices" },
];

const OTHER_FIELDS = [
  { key: "communityTotal", label: "Community members (total)", where: "About, Partner and Login pages" },
  { key: "eventsHosted", label: "Events hosted", where: "About page, By The Numbers" },
  { key: "soldOut", label: "Sold-out events", where: "About page, By The Numbers" },
];

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("gfc_token") || ""}`,
});

const AdminSiteStats = ({ section = "numbers" }) => {
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/site-stats`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const d = { ...DEFAULT_STATS, ...data };
        setForm(d);
        setSaved(d);
      })
      .catch(() => setError("Couldn't load the site numbers. Refresh to try again."));
  }, []);

  if (!form) {
    return error ? <p className="dot-red">{error}</p> : <p className="td-muted">Loading site numbers…</p>;
  }

  const fields =
    section === "ratings"
      ? RATING_FIELDS
      : [
          ...PLATFORMS.map((p) => ({ key: p.key, label: p.label, where: "About page (0 hides it)" })),
          ...OTHER_FIELDS,
        ];

  const set = (key) => (e) => {
    setStatus("");
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const changed = fields.some((f) => String(form[f.key]) !== String(saved[f.key]));
  const platformSum = PLATFORMS.reduce(
    (sum, p) => sum + (Number(String(form[p.key]).replace(/[,+\s]/g, "")) || 0),
    0
  );

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = Object.fromEntries(fields.map((f) => [f.key, form[f.key]]));
      const res = await fetch(`${BACKEND_URL}/api/site-stats`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save.");
      const d = { ...DEFAULT_STATS, ...data };
      setForm(d);
      setSaved(d);
      setSiteStats(d);
      setStatus("Saved. The website shows the new numbers now.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="sub-card site-stats-card" onSubmit={save}>
      <div className="section-row">
        <h3 className="section-heading">
          {section === "ratings" ? "Platform ratings" : "Followers & site numbers"}
        </h3>
        {saved.updatedAt && (
          <span className="td-muted">
            Last updated {new Date(saved.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        )}
      </div>
      <p className="td-muted">
        {section === "ratings"
          ? "These show next to the reviews on the home page. Update them when your Eventbrite or Meetup rating changes."
          : "Change a number here and every page that shows it updates. Type plain numbers (1850, not 1.8K); the site adds the comma and the +."}
      </p>

      <div className="site-stats-grid">
        {fields.map((f) => (
          <label key={f.key} className="site-stats-field">
            <span className="site-stats-label">{f.label}</span>
            <input
              className="search-input"
              type="number"
              inputMode={section === "ratings" ? "decimal" : "numeric"}
              min="0"
              max={section === "ratings" ? 5 : undefined}
              step={section === "ratings" ? 0.1 : 1}
              value={form[f.key]}
              onChange={set(f.key)}
              required
            />
            <span className="td-muted site-stats-where">
              {f.where}
              {section !== "ratings" && f.key !== "eventsHosted" && f.key !== "soldOut" && Number(form[f.key]) > 0
                ? ` · shows as ${plus(form[f.key])}`
                : ""}
            </span>
          </label>
        ))}
      </div>

      {section !== "ratings" && (
        <p className="td-muted site-stats-sum">
          Platforms above add up to <strong>{plus(platformSum)}</strong>.{" "}
          <button
            type="button"
            className="export-btn"
            onClick={() => setForm((prev) => ({ ...prev, communityTotal: platformSum }))}
          >
            Use this as the community total
          </button>
        </p>
      )}

      <div className="site-stats-actions">
        <button type="submit" className="gold-fill-btn" disabled={saving || !changed}>
          {saving ? "Saving…" : "Save to website"}
        </button>
        {status && <span className="dot-green" role="status">{status}</span>}
        {error && <span className="dot-red" role="alert">{error}</span>}
      </div>
    </form>
  );
};

export default AdminSiteStats;
