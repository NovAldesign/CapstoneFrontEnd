import React, { useEffect, useMemo, useState } from "react";
import { BACKEND_URL } from "../Services/eventUtils";
import SelectEmailVersions, { emailPayload, hasPlaceholder } from "./SelectEmailVersions.jsx";

// Admin: GFC Select™ "the doors" (application window) + notify list

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("gfc_token") || ""}`,
});

const api = async (path, options = {}) => {
  const res = await fetch(`${BACKEND_URL}/api/select${path}`, { ...options, headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

// ISO -> value for <input type="datetime-local"> in the viewer's time zone
const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (v) => (v ? new Date(v).toISOString() : null);

const STATE_LABEL = {
  soon: "Not open yet: visitors see “Notify me”",
  open: "OPEN: the application form is live",
  closed: "Closed: visitors see “Notify me” for next time",
};

const DEFAULT_SUBJECT = "{firstName}, the doors to GFC Select™ are open";
const DEFAULT_MESSAGE = `Hi {firstName},

The doors to GFC Select™ are officially open, and they stay open for two weeks only.

Forty seats. Twenty men, twenty women. Every guest hand-selected.

Request your seat here: grownfolkscollective.com/select

Doors close [CLOSING DATE]. Don't wait on this one.`;

const DEFAULT_MEN = {
  subject: "{firstName}, the doors are open. 20 seats for men.",
  message: `{firstName},

The doors to GFC Select™ are open. Two weeks only.

Twenty seats for men. Every woman in the room is 30+, vetted, and there to meet a good man. Your picks stay private. Camera-free.

Request your seat: grownfolkscollective.com/select/gentlemen

Doors close [CLOSING DATE]. The seats go to the men who show up for them.`,
};

const DEFAULT_WOMEN = {
  subject: "{firstName}, the doors are open",
  message: `{firstName},

The moment you've been waiting for: the doors to GFC Select™ are open, for two weeks only.

Every man in the room will be chosen with care. A host welcomes you, the location stays private, and your information is never shared unless you both choose each other.

Request your seat: grownfolkscollective.com/select/ladies

Doors close [CLOSING DATE]. We'd love to see you there.`,
};

const AdminSelectDoors = () => {
  const [round, setRound] = useState({ name: "", opensAt: "", closesAt: "", eventDate: "" });
  const [state, setState] = useState("soon");
  const [list, setList] = useState([]);
  const [showList, setShowList] = useState(false);
  const [noms, setNoms] = useState([]);
  const [showNoms, setShowNoms] = useState(false);
  const [composer, setComposer] = useState(false);
  const [split, setSplit] = useState(true);
  const [versions, setVersions] = useState({
    base: { subject: DEFAULT_SUBJECT, message: DEFAULT_MESSAGE },
    man: DEFAULT_MEN,
    woman: DEFAULT_WOMEN,
  });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [r, l, n] = await Promise.all([
        api("/admin/round"),
        api("/admin/notify"),
        api("/admin/nominations").catch(() => []),
      ]);
      setNoms(Array.isArray(n) ? n : []);
      setState(r.state);
      setRound({
        name: r.round?.name || "",
        opensAt: toLocalInput(r.round?.opensAt),
        closesAt: toLocalInput(r.round?.closesAt),
        eventDate: toLocalInput(r.round?.eventDate),
      });
      setList(l);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(
    () => ({
      total: list.length,
      men: list.filter((p) => p.gender === "man").length,
      women: list.filter((p) => p.gender === "woman").length,
      texts: list.filter((p) => p.textOk).length,
      newsletter: list.filter((p) => p.newsletter).length,
    }),
    [list]
  );

  const saveRound = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const r = await api("/admin/round", {
        method: "PUT",
        body: JSON.stringify({
          name: round.name,
          opensAt: fromLocalInput(round.opensAt),
          closesAt: fromLocalInput(round.closesAt),
          eventDate: fromLocalInput(round.eventDate),
        }),
      });
      setState(r.state);
      setNotice("Dates saved.");
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const closeNow = async () => {
    if (!window.confirm("Close the doors right now? The application form will disappear.")) return;
    const now = new Date();
    const opens = round.opensAt && new Date(round.opensAt) < now ? round.opensAt : toLocalInput(new Date(now - 60000).toISOString());
    setRound((p) => ({ ...p, opensAt: opens, closesAt: toLocalInput(now.toISOString()) }));
    try {
      const r = await api("/admin/round", {
        method: "PUT",
        body: JSON.stringify({ ...round, opensAt: fromLocalInput(opens), closesAt: now.toISOString(), eventDate: fromLocalInput(round.eventDate) }),
      });
      setState(r.state);
      setNotice("The doors are closed.");
    } catch (err) {
      alert(err.message);
    }
  };

  const sendEmail = async (test) => {
    if (!test && hasPlaceholder(split, versions, /\[CLOSING DATE\]/) && !window.confirm("Your message still says [CLOSING DATE]. Send anyway?")) return;
    if (!test && !window.confirm(`Email all ${counts.total} people on the notify list?`)) return;
    setBusy(true);
    setNotice("");
    try {
      const r = await api("/admin/notify/email", { method: "POST", body: JSON.stringify({ ...emailPayload(split, versions), test }) });
      if (r.test) setNotice(`Test sent to ${r.sentTo} (${(r.versions || []).join(", ")}).`);
      else {
        setNotice(r.failed?.length ? `Sent ${r.sent}. Couldn't send to: ${r.failed.join(", ")}` : `Sent to ${r.sent} people.`);
        setComposer(false);
        load();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = () => {
    const rows = [["First name", "Email", "Phone", "Man/Woman", "OK to text", "Newsletter", "Applying with", "Joined"]].concat(
      list.map((p) => [p.firstName, p.email, p.phone, p.gender, p.textOk ? "yes" : "", p.newsletter ? "yes" : "", p.friendName || "", new Date(p.createdAt).toLocaleDateString()])
    );
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "gfc-select-notify-list.csv";
    a.click();
  };

  const closesNice = round.closesAt
    ? new Date(round.closesAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : "";

  return (
    <div className="sel-adm-doors">
      {error && <p className="dot-red">{error}</p>}
      {notice && <p className="sel-adm-notice" role="status">{notice}</p>}

      {/* THE DOORS */}
      <form className="sub-card sel-adm-card sel-adm-doors-card" onSubmit={saveRound}>
        <div className="section-row">
          <h4 className="sel-adm-composer-title">The doors</h4>
          <span className={`status-pill ${state === "open" ? "status-accepted" : "status-pending"}`}>{STATE_LABEL[state]}</span>
        </div>
        <p className="td-muted">
          Set when applications open and close. Before and after, the page shows “Notify me” and the form is hidden.
          Times are in your time zone.
        </p>
        <div className="sel-adm-doors-grid">
          <label className="sel-adm-label">
            Round name
            <input className="search-input" value={round.name} onChange={(e) => setRound({ ...round, name: e.target.value })} placeholder="January 2027" />
          </label>
          <label className="sel-adm-label">
            Doors open
            <input className="search-input" type="datetime-local" value={round.opensAt} onChange={(e) => setRound({ ...round, opensAt: e.target.value })} />
          </label>
          <label className="sel-adm-label">
            Doors close
            <input className="search-input" type="datetime-local" value={round.closesAt} onChange={(e) => setRound({ ...round, closesAt: e.target.value })} />
          </label>
          <label className="sel-adm-label">
            Event date
            <input className="search-input" type="datetime-local" value={round.eventDate} onChange={(e) => setRound({ ...round, eventDate: e.target.value })} />
          </label>
        </div>
        <div className="sel-adm-actions">
          <button type="submit" className="gold-fill-btn" disabled={busy}>Save dates</button>
          {state === "open" && (
            <button type="button" className="export-btn" onClick={closeNow}>Close the doors now</button>
          )}
        </div>
      </form>

      {/* NOTIFY LIST */}
      <div className="sub-card sel-adm-card">
        <div className="section-row">
          <h4 className="sel-adm-composer-title">Notify list</h4>
          <div className="sel-adm-actions">
            <button type="button" className="export-btn" onClick={() => setShowList((v) => !v)}>
              {showList ? "Hide list" : "See list"}
            </button>
            <button type="button" className="export-btn" onClick={exportCsv} disabled={!list.length}>Download CSV</button>
            <button type="button" className="gold-fill-btn" onClick={() => setComposer(true)} disabled={!list.length}>
              ✉ Email the list
            </button>
          </div>
        </div>
        <div className="sel-adm-room">
          <div className="sel-adm-stat"><span className="sel-adm-stat-num">{counts.total}</span><span className="sel-adm-stat-label">On the list</span></div>
          <div className="sel-adm-stat"><span className="sel-adm-stat-num">{counts.men}</span><span className="sel-adm-stat-label">Men</span></div>
          <div className="sel-adm-stat"><span className="sel-adm-stat-num">{counts.women}</span><span className="sel-adm-stat-label">Women</span></div>
          <div className="sel-adm-stat"><span className="sel-adm-stat-num">{counts.texts}</span><span className="sel-adm-stat-label">OK to text</span></div>
          <div className="sel-adm-stat"><span className="sel-adm-stat-num">{counts.newsletter}</span><span className="sel-adm-stat-label">Joined newsletter</span></div>
        </div>

        {showList && (
          <table className="admin-table sel-adm-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Man/Woman</th><th>Newsletter</th><th>With</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p._id}>
                  <td>{p.firstName}</td>
                  <td>{p.email}</td>
                  <td>{p.phone}{p.textOk ? " · text OK" : ""}</td>
                  <td>{p.gender || "—"}</td>
                  <td>{p.newsletter ? "Yes" : "—"}</td>
                  <td>{p.friendName || "—"}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* NOMINATIONS + FRIEND INVITES */}
      <div className="sub-card sel-adm-card">
        <div className="section-row">
          <h4 className="sel-adm-composer-title">Nominations and friend invites</h4>
          <button type="button" className="export-btn" onClick={() => setShowNoms((v) => !v)} disabled={!noms.length}>
            {showNoms ? "Hide nominations" : "See nominations"}
          </button>
        </div>
        <div className="sel-adm-room">
          <div className="sel-adm-stat"><span className="sel-adm-stat-num">{noms.filter((x) => x.kind !== "friend" && x.nomineeGender !== "woman").length}</span><span className="sel-adm-stat-label">Men nominated</span></div>
          <div className="sel-adm-stat"><span className="sel-adm-stat-num">{noms.filter((x) => x.kind !== "friend" && x.nomineeGender === "woman").length}</span><span className="sel-adm-stat-label">Women nominated</span></div>
          <div className="sel-adm-stat"><span className="sel-adm-stat-num">{noms.filter((x) => x.kind === "friend").length}</span><span className="sel-adm-stat-label">Friends invited</span></div>
          <div className="sel-adm-stat"><span className="sel-adm-stat-num">{noms.filter((x) => x.status === "invited").length}</span><span className="sel-adm-stat-label">Invites emailed</span></div>
          <div className="sel-adm-stat"><span className="sel-adm-stat-num">{noms.filter((x) => x.status === "text").length}</span><span className="sel-adm-stat-label">To text</span></div>

        </div>
        <p className="td-muted">Share the link: grownfolkscollective.com/go/nominate</p>
        {showNoms && (
          <table className="admin-table sel-adm-table">
            <thead>
              <tr><th>Who</th><th>Contact</th><th>From</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {noms.map((x) => (
                <tr key={x._id}>
                  <td>
                    {x.nomineeFirstName}
                    <div className="td-muted">
                      {x.nomineeGender === "woman" ? "Woman" : "Man"} · {x.kind === "friend" ? "Friend invite" : "Nominated"}
                    </div>
                    {x.note ? <div className="td-muted">{x.note}</div> : null}
                  </td>
                  <td>{x.nomineeEmail || x.nomineePhone}</td>
                  <td>{x.nominatorName}{x.relationship ? ` (${x.relationship.toLowerCase()})` : ""}{x.shareName ? "" : " · keep private"}</td>
                  <td>{{ invited: "Invite emailed", text: x.nomineeGender === "woman" ? "Text her" : "Text him", already: "Already on list", repeat: "Already invited" }[x.status] || x.status}</td>
                  <td>{new Date(x.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {composer && (
        <div className="sub-card sel-adm-composer">
          <div className="section-row">
            <h4 className="sel-adm-composer-title">Email all {counts.total} on the notify list</h4>
            <button type="button" className="sel-adm-clear" onClick={() => setComposer(false)}>Close</button>
          </div>
          <p className="td-muted">
            Each person gets their own private email. <code>{"{firstName}"}</code> becomes their first name.
            {closesNice && <> Doors close <strong>{closesNice}</strong>.</>}
          </p>
          <SelectEmailVersions
            split={split}
            setSplit={setSplit}
            versions={versions}
            setVersions={setVersions}
            names={{
              any: list[0]?.firstName,
              man: list.find((p) => p.gender === "man")?.firstName,
              woman: list.find((p) => p.gender === "woman")?.firstName,
              other: list.find((p) => !p.gender)?.firstName,
            }}
            counts={{ man: counts.men, woman: counts.women, other: counts.total - counts.men - counts.women }}
          />
          <div className="sel-adm-actions">
            <button type="button" className="export-btn" disabled={busy} onClick={() => sendEmail(true)}>Send me a test first</button>
            <button type="button" className="gold-fill-btn" disabled={busy} onClick={() => sendEmail(false)}>
              {busy ? "Sending…" : `Send to ${counts.total}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSelectDoors;
