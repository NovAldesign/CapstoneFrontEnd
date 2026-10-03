import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BACKEND_URL } from "../Services/eventUtils";
import { SelectTopbar, SelectFooter } from "../Components/SelectFrame";
import "../Styles/Select.css";

// /select/nominate: nominate a good man or a great woman for GFC Select™
const RELATIONSHIPS = {
  man: ["Brother", "Cousin", "Friend", "Coworker", "Church family", "Neighbor", "Other"],
  woman: ["Sister", "Cousin", "Friend", "Coworker", "Church family", "Neighbor", "Other"],
};

// Wording for him or her
const W = {
  man: {
    he: "he", him: "him", his: "His", hisL: "his", hes: "He's",
    kicker: "Nominate a good man",
    title: "Know a good man who belongs in the room?",
    body: "We hold twenty seats for men at every GFC Select™ evening, and we only fill them with the right ones. If you know a single man, 30 or older, who has his life together and is done with the apps, nominate him. We'll send him a personal invitation.",
    button: "Send His Invitation",
    again: "Nominate Another",
  },
  woman: {
    he: "she", him: "her", his: "Her", hisL: "her", hes: "She's",
    kicker: "Nominate a great woman",
    title: "Know a great woman who deserves this room?",
    body: "Every man at GFC Select™ is vetted and selected, and every woman deserves a room like that. If you know a single woman, 30 or older, who's ready to meet someone worthy of her, nominate her. We'll send her a personal invitation.",
    button: "Send Her Invitation",
    again: "Nominate Another",
  },
};

const EMPTY = {
  nomineeFirstName: "",
  nomineeEmail: "",
  nomineePhone: "",
  relationship: "",
  note: "",
  nominatorName: "",
  nominatorEmail: "",
  confirmed: false,
  shareName: false,
  website: "", // bots only
};

const OUTCOME = {
  invited: (n) => `We just sent ${n} a personal invitation. Check your inbox for a thank-you from us.`,
  text: (n) => `We'll reach out to ${n} personally by text.`,
  already: (n) => `Good news: ${n} is already on our list.`,
  repeat: (n, w) => `Someone else nominated ${n} recently too, so ${w.he}'s already heard from us. Clearly ${w.he}'s a good one.`,
};

const SelectNominate = () => {
  const [params] = useSearchParams();
  const [gender, setGender] = useState(params.get("g") === "woman" ? "woman" : "man");
  const w = W[gender];
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null); // { name, status }
  const [error, setError] = useState("");

  const update = (e) => {
    if (error) setError("");
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nomineeFirstName.trim()) return setError(`Please add ${w.hisL} first name.`);
    if (!form.nomineeEmail.trim() && !form.nomineePhone.trim()) {
      return setError(`Please add ${w.hisL} email or phone so we can reach ${w.him}.`);
    }
    if (!form.nominatorName.trim() || !form.nominatorEmail.trim()) {
      return setError("Please add your first name and email.");
    }
    if (!form.confirmed) return setError(`Please confirm ${w.he}'s single and 30 or older.`);

    setSending(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/select/nominate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, nomineeGender: gender, source: params.get("src") || "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setDone({ name: form.nomineeFirstName.trim(), gender, status: data.status || "invited" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const another = () => {
    setForm((p) => ({ ...EMPTY, nominatorName: p.nominatorName, nominatorEmail: p.nominatorEmail }));
    setDone(null);
  };

  return (
    <div className="select-page">
      <Helmet>
        <title>Nominate Someone | GFC Select™</title>
        <meta
          name="description"
          content="Know a single man or woman, 30 or older, who belongs in the room? Nominate them for GFC Select™, a private masquerade evening for Atlanta singles. We'll send a personal invitation."
        />
        <link rel="canonical" href="https://www.grownfolkscollective.com/select/nominate" />
      </Helmet>

      <SelectTopbar back={{ to: "/select", label: "GFC Select™" }} />

      <section className="select-section select-nominate" aria-labelledby="nominate-title">
        {done ? (
          <div className="select-sent" role="status">
            <p className="select-sent-seal" aria-hidden="true">GFC</p>
            <h3>Thank you.</h3>
            <p>{(OUTCOME[done.status] || OUTCOME.invited)(done.name, W[done.gender] || w)}</p>
            <p className="select-sent-small">Good rooms are built by people who know good people.</p>
            <button type="button" className="select-btn select-nominate-again" onClick={another}>
              {w.again}
            </button>
          </div>
        ) : (
          <>
            <div className="select-nominate-switch" role="radiogroup" aria-label="Who are you nominating?">
              {[["man", "A good man"], ["woman", "A great woman"]].map(([v, l]) => (
                <label key={v} className={`select-nominate-tab ${gender === v ? "on" : ""}`}>
                  <input type="radio" name="nomineeGender" value={v} checked={gender === v} onChange={() => { setGender(v); setForm((p) => ({ ...p, relationship: "" })); if (error) setError(""); }} />
                  {l}
                </label>
              ))}
            </div>
            <p className="select-kicker">{w.kicker}</p>
            <h1 id="nominate-title" className="select-h2">{w.title}</h1>
            <p className="select-body">{w.body}</p>

            <form className="select-form select-nominate-form" onSubmit={submit} noValidate>
              <fieldset>
                <legend>About {w.him}</legend>
                <div className="select-grid">
                  <label>
                    <span>{w.his} first name</span>
                    <input name="nomineeFirstName" value={form.nomineeFirstName} onChange={update} maxLength={40} required />
                  </label>
                  <label>
                    <span>How do you know {w.him}?</span>
                    <select name="relationship" value={form.relationship} onChange={update}>
                      <option value="">Select...</option>
                      {RELATIONSHIPS[gender].map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>{w.his} email</span>
                    <input type="email" name="nomineeEmail" value={form.nomineeEmail} onChange={update} maxLength={120} />
                  </label>
                  <label>
                    <span>{w.his} phone <span className="select-opt">(if you don't have {w.hisL} email)</span></span>
                    <input type="tel" name="nomineePhone" value={form.nomineePhone} onChange={update} maxLength={30} />
                  </label>
                  <label className="select-span-2">
                    <span>Why {w.he}'d be a great fit <span className="select-opt">(optional, only we see this)</span></span>
                    <textarea name="note" value={form.note} onChange={update} rows={3} maxLength={400} />
                  </label>
                </div>
              </fieldset>

              <fieldset>
                <legend>About you</legend>
                <div className="select-grid">
                  <label>
                    <span>Your first name</span>
                    <input name="nominatorName" value={form.nominatorName} onChange={update} maxLength={60} autoComplete="given-name" required />
                  </label>
                  <label>
                    <span>Your email</span>
                    <input type="email" name="nominatorEmail" value={form.nominatorEmail} onChange={update} maxLength={120} autoComplete="email" required />
                  </label>
                </div>
                <label className="select-check">
                  <input type="checkbox" name="confirmed" checked={form.confirmed} onChange={update} />
                  <span>{w.hes} single and 30 or older.</span>
                </label>
                <label className="select-check">
                  <input type="checkbox" name="shareName" checked={form.shareName} onChange={update} />
                  <span>It's okay to tell {w.him} I nominated {w.him}. <span className="select-opt">(Otherwise we'll just say someone who thinks highly of {w.him}.)</span></span>
                </label>
              </fieldset>

              <input type="text" name="website" value={form.website} onChange={update} className="select-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />

              {error && <p className="select-error" role="alert">{error}</p>}

              <button type="submit" className="select-btn" disabled={sending}>
                {sending ? "Sending..." : w.button}
              </button>
              <p className="select-private">We send {w.him} one personal note. No spam, and {w.he}'s never added to anything without {w.hisL} say.</p>
            </form>
          </>
        )}
      </section>

      <SelectFooter />
    </div>
  );
};

export default SelectNominate;
