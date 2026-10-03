import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BACKEND_URL } from "../Services/eventUtils";

// GFC Select™: shared helpers for "the doors" (application window)

export const useSelectStatus = () => {
  const [status, setStatus] = useState({ state: "loading" });
  useEffect(() => {
    let alive = true;
    fetch(`${BACKEND_URL}/api/select/status`)
      .then((r) => (r.ok ? r.json() : { state: "soon" }))
      .then((d) => alive && setStatus(d))
      .catch(() => alive && setStatus({ state: "soon" }));
    return () => {
      alive = false;
    };
  }, []);
  return status;
};

export const fmtDoorDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : "";

export const daysLeft = (iso) => {
  if (!iso) return null;
  const ms = new Date(iso) - new Date();
  return Math.max(0, Math.ceil(ms / 86400000));
};

const EMPTY = { firstName: "", email: "", phone: "", gender: "", textOk: false, newsletter: false, friendName: "", friendEmail: "", friendGender: "", website: "" };

// "Notify me when the doors open" form
// gender: preset "man" | "woman" (hides the Man/Woman choice) · source: default tracking tag
const SelectNotify = ({ compact = false, gender = "", source = "" }) => {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ ...EMPTY, gender });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null); // null | "new" | "already"
  const [error, setError] = useState("");

  const update = (e) => {
    if (error) setError("");
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.email.trim()) {
      return setError("Please add your first name and email.");
    }
    if (form.friendEmail.trim() && !form.friendGender) {
      return setError("Let us know if your friend is a man or a woman.");
    }
    setSending(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/select/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: params.get("src") || source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setDone(data.already ? "already" : "new");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className={`select-notify-done ${compact ? "is-compact" : ""}`} role="status">
        <p className="select-notify-done-title">
          {done === "already" ? "You're already on the list." : "You're on the list."}
        </p>
        <p>When the doors open, you'll be among the first to know. Keep an eye on your inbox.</p>
      </div>
    );
  }

  return (
    <form className={`select-notify ${compact ? "is-compact" : ""}`} onSubmit={submit} noValidate>
      <div className="select-notify-row">
        <label>
          <span className="select-sr">First name</span>
          <input name="firstName" value={form.firstName} onChange={update} placeholder="First name" maxLength={40} autoComplete="given-name" required />
        </label>
        <label>
          <span className="select-sr">Email</span>
          <input type="email" name="email" value={form.email} onChange={update} placeholder="Email" maxLength={120} autoComplete="email" required />
        </label>
      </div>
      <div className={`select-notify-row ${gender ? "is-single" : ""}`}>
        {!gender && (
        <div className="select-notify-pills" role="radiogroup" aria-label="I am a">
          {[["man", "Man"], ["woman", "Woman"]].map(([v, l]) => (
            <label key={v} className={`select-notify-pill ${form.gender === v ? "on" : ""}`}>
              <input type="radio" name="gender" value={v} checked={form.gender === v} onChange={update} />
              {l}
            </label>
          ))}
        </div>
        )}
        <label>
          <span className="select-sr">Phone (optional)</span>
          <input type="tel" name="phone" value={form.phone} onChange={update} placeholder="Phone (optional)" maxLength={30} autoComplete="tel" />
        </label>
      </div>
      {form.gender && (
        <label className="select-notify-friend">
          <span className="select-sr">Applying with a friend? (their name, optional)</span>
          <input name="friendName" value={form.friendName} onChange={update} placeholder="Applying with a friend? Their name (optional)" maxLength={80} />
        </label>
      )}
      {form.gender && form.friendName.trim() && (
        <div className="select-notify-friend-more">
          <label>
            <span className="select-sr">Their email (optional, we'll send them an invite)</span>
            <input type="email" name="friendEmail" value={form.friendEmail} onChange={update} placeholder="Their email (we'll invite them)" maxLength={120} />
          </label>
          {form.friendEmail.trim() && (
            <div className="select-notify-pills select-notify-pills-sm" role="radiogroup" aria-label="Your friend is a">
              {[["man", "Man"], ["woman", "Woman"]].map(([v, l]) => (
                <label key={v} className={`select-notify-pill ${form.friendGender === v ? "on" : ""}`}>
                  <input type="radio" name="friendGender" value={v} checked={form.friendGender === v} onChange={update} />
                  {l}
                </label>
              ))}
            </div>
          )}
        </div>
      )}
      {form.phone.trim() && (
        <label className="select-notify-check">
          <input type="checkbox" name="textOk" checked={form.textOk} onChange={update} />
          <span>Text me when the doors open. Msg &amp; data rates may apply. Reply STOP to opt out.</span>
        </label>
      )}
      <label className="select-notify-check">
        <input type="checkbox" name="newsletter" checked={form.newsletter} onChange={update} />
        <span>Also send me the Grown Folks™ Collective newsletter with upcoming events.</span>
      </label>
      <input type="text" name="website" value={form.website} onChange={update} className="select-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {error && <p className="select-error" role="alert">{error}</p>}
      <button type="submit" className="select-btn" disabled={sending}>
        {sending ? "Adding you…" : "Notify Me When the Doors Open"}
      </button>
    </form>
  );
};

export default SelectNotify;
