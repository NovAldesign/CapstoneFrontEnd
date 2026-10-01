import React, { useEffect, useMemo, useState } from "react";
import { BACKEND_URL } from "../Services/eventUtils";

const SOURCES = [
  { value: "google", label: "Google" },
  { value: "eventbrite", label: "Eventbrite" },
  { value: "meetup", label: "Meetup" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

const EMPTY = { name: "", event: "", rating: 5, text: "", source: "google", featured: false };

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("gfc_token") || ""}`,
});

const api = async (path, options = {}) => {
  const res = await fetch(`${BACKEND_URL}/api/reviews${path}`, {
    ...options,
    headers: authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [form, setForm] = useState(EMPTY);
  const [showAdd, setShowAdd] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setReviews(await api("/admin"));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(
    () => ({
      pending: reviews.filter((r) => r.status === "pending").length,
      approved: reviews.filter((r) => r.status === "approved").length,
      hidden: reviews.filter((r) => r.status === "hidden").length,
      all: reviews.length,
    }),
    [reviews]
  );

  const shown = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  const change = async (id, updates) => {
    setBusyId(id);
    try {
      await api(`/admin/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
      await load(); // reload so "only one featured" stays in sync
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this review for good?")) return;
    setBusyId(id);
    try {
      await api(`/admin/${id}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const addReview = async (e) => {
    e.preventDefault();
    try {
      await api("/admin", {
        method: "POST",
        body: JSON.stringify({ ...form, rating: Number(form.rating), status: "approved" }),
      });
      setForm(EMPTY);
      setShowAdd(false);
      setFilter("approved");
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  return (
    <div className="reviews-admin">
      <div className="section-row">
        <h3 className="section-heading">Guest Reviews</h3>
        <button type="button" className="export-btn" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? "Close" : "＋ Add a review from Google, Eventbrite…"}
        </button>
      </div>
      <p className="td-muted reviews-admin-help">
        Approved reviews show on the home page. The ★ Featured one is the big card; the next 3
        newest show underneath. New reviews from the website wait here as Pending.
      </p>

      {showAdd && (
        <form className="sub-card reviews-admin-form" onSubmit={addReview}>
          <div className="reviews-admin-row">
            <label>
              Name (first name or initial)
              <input className="search-input" name="name" value={form.name} onChange={update} required maxLength={60} />
            </label>
            <label>
              Event
              <input className="search-input" name="event" value={form.event} onChange={update} maxLength={80} placeholder="Game Night" />
            </label>
            <label>
              Stars
              <select className="filter-select" name="rating" value={form.rating} onChange={update}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{"★".repeat(n)}</option>
                ))}
              </select>
            </label>
            <label>
              From
              <select className="filter-select" name="source" value={form.source} onChange={update}>
                {SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Review (paste it in)
            <textarea className="search-input" name="text" value={form.text} onChange={update} rows={5} required maxLength={1500} />
          </label>
          <label className="checkbox-label">
            <input type="checkbox" name="featured" checked={form.featured} onChange={update} />
            Make this the featured review
          </label>
          <button type="submit" className="gold-fill-btn">Post to home page</button>
        </form>
      )}

      <div className="table-toolbar">
        {["pending", "approved", "hidden", "all"].map((f) => (
          <button
            key={f}
            type="button"
            className={`admin-tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f[0].toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {error && <p className="dot-red">{error}</p>}
      {loading ? (
        <p className="td-muted">Loading reviews…</p>
      ) : shown.length === 0 ? (
        <p className="empty-hint">Nothing here yet.</p>
      ) : (
        <div className="reviews-admin-list">
          {shown.map((r) => (
            <article key={r._id} className="sub-card reviews-admin-card">
              <div className="reviews-admin-meta">
                <strong>{r.name}</strong>
                {r.event && <span className="td-muted"> · {r.event}</span>}
                <span className="reviews-admin-stars"> {"★".repeat(r.rating)}</span>
                <span className={`status-pill status-${r.status === "approved" ? "accepted" : r.status === "pending" ? "pending" : "draft"}`}>
                  {r.status}
                </span>
                {r.featured && <span className="luxe-badge">★ Featured</span>}
                <span className="td-muted">
                  {" "}· {r.source} · {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              {r.email && <div className="td-muted">{r.email}</div>}
              {r.canShare === false && (
                <div className="dot-red">Guest asked NOT to post this publicly.</div>
              )}
              <p className="reviews-admin-text">{r.text}</p>
              <div className="reviews-admin-actions">
                {r.status !== "approved" && (
                  <button type="button" className="gold-fill-btn" disabled={busyId === r._id} onClick={() => change(r._id, { status: "approved" })}>
                    Approve
                  </button>
                )}
                {!r.featured && (
                  <button type="button" className="export-btn" disabled={busyId === r._id} onClick={() => change(r._id, { featured: true })}>
                    ★ Feature
                  </button>
                )}
                {r.status !== "hidden" && (
                  <button type="button" className="export-btn" disabled={busyId === r._id} onClick={() => change(r._id, { status: "hidden" })}>
                    Hide
                  </button>
                )}
                <button type="button" className="btn-delete" disabled={busyId === r._id} onClick={() => remove(r._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
