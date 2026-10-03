import React, { useEffect, useMemo, useState } from "react";
import { BACKEND_URL } from "../Services/eventUtils";
import AdminSelectDoors from "./AdminSelectDoors.jsx";
import SelectEmailVersions, { emailPayload, hasPlaceholder } from "./SelectEmailVersions.jsx";
import {
  VALUES, LOVE, CONNECT, KIDS_HAVE, KIDS_WANT, NIGHT_GOAL, compatibility, labelOf,
} from "../Services/selectQuestions";

// Admin: GFC Select™ applications — review, approve, and email in bulk.

const STATUS_LABEL = {
  new: "New",
  selected: "Selected",
  waitlist: "Waitlist",
  not_this_time: "Not this time",
};
const STATUS_PILL = {
  new: "status-pending",
  selected: "status-accepted",
  waitlist: "status-waitlisted",
  not_this_time: "status-draft",
};
const AGE_GROUPS = [
  { id: "all", label: "All ages", test: () => true },
  { id: "30s", label: "30–39", test: (a) => a >= 30 && a <= 39 },
  { id: "40s", label: "40–49", test: (a) => a >= 40 && a <= 49 },
  { id: "50s", label: "50+", test: (a) => a >= 50 },
];

const DEFAULT_SUBJECT = "{firstName}, you've been selected for GFC Select™";
const DEFAULT_MESSAGE = `Hi {firstName},

Congratulations. Out of everyone who requested a seat, you've been selected for GFC Select™.

Date: [DATE]
Time: [TIME]
Dress code: [DRESS CODE]

The location will be shared with you 48 hours before the evening. Please keep this invitation private.

Next step: [HOW TO RESERVE YOUR SEAT]

We can't wait to see you behind the mask.`;

const DEFAULT_MEN = {
  subject: "{firstName}, you've been selected.",
  message: `{firstName},

Out of every man who requested a seat, you were selected for GFC Select™.

Date: [DATE]
Time: [TIME]
Dress code: [DRESS CODE]

Twenty women, all 30+, all vetted, and every one there to meet a good man. Your picks stay private. The location is shared 48 hours before. Keep this invitation to yourself.

Your seat is held for 48 hours: [HOW TO RESERVE YOUR SEAT]

See you behind the mask.`,
};

const DEFAULT_WOMEN = {
  subject: "{firstName}, your invitation has arrived",
  message: `{firstName},

It's our pleasure to tell you: you've been selected for GFC Select™.

Date: [DATE]
Time: [TIME]
Dress code: [DRESS CODE]

Every man in the room was chosen with the same care we took choosing you. A host will welcome you, the location is shared 48 hours before, and your information is never shared unless you both choose each other. Please keep this invitation private.

Your seat is held for 48 hours: [HOW TO RESERVE YOUR SEAT]

We can't wait to welcome you behind the mask.`,
};

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

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

const Detail = ({ label, value }) =>
  value ? (
    <div className="sel-adm-detail">
      <span className="sel-adm-detail-label">{label}</span>
      <span className="sel-adm-detail-value">{value}</span>
    </div>
  ) : null;

// 1–5 shown as dots: ●●●○○
const Dots = ({ n }) => (
  <span className="sel-adm-dots" aria-label={`${n} of 5`}>
    {"●".repeat(n || 0)}<span className="sel-adm-dots-off">{"○".repeat(5 - (n || 0))}</span>
  </span>
);

const topValues = (a) =>
  VALUES.filter((v) => (a.values?.[v.key] || 0) >= 5).map((v) => v.label.split(" ")[0]).slice(0, 3).join(", ");

const AdminSelect = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("new");
  const [genderFilter, setGenderFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState(new Set());
  const [openId, setOpenId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notesDraft, setNotesDraft] = useState({});
  const [composer, setComposer] = useState(false);
  const [split, setSplit] = useState(true);
  const [versions, setVersions] = useState({
    base: { subject: DEFAULT_SUBJECT, message: DEFAULT_MESSAGE },
    man: DEFAULT_MEN,
    woman: DEFAULT_WOMEN,
  });
  const [notice, setNotice] = useState("");
  const [view, setView] = useState("apps"); // "apps" | "doors"

  const load = async () => {
    setLoading(true);
    try {
      setApps(await api("/admin"));
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

  const counts = useMemo(() => {
    const c = { new: 0, selected: 0, waitlist: 0, not_this_time: 0, menSel: 0, womenSel: 0 };
    apps.forEach((a) => {
      c[a.status] = (c[a.status] || 0) + 1;
      if (a.status === "selected" && a.gender === "man") c.menSel++;
      if (a.status === "selected" && a.gender === "woman") c.womenSel++;
    });
    return c;
  }, [apps]);

  const shown = useMemo(() => {
    const ageTest = AGE_GROUPS.find((g) => g.id === ageFilter).test;
    const q = search.trim().toLowerCase();
    return apps.filter(
      (a) =>
        (statusFilter === "all" || a.status === statusFilter) &&
        (genderFilter === "all" || a.gender === genderFilter) &&
        ageTest(a.age) &&
        (!q || `${a.firstName} ${a.lastName} ${a.email}`.toLowerCase().includes(q))
    );
  }, [apps, statusFilter, genderFilter, ageFilter, search]);

  const checkedApps = apps.filter((a) => checked.has(a._id));
  const allShownChecked = shown.length > 0 && shown.every((a) => checked.has(a._id));

  const toggle = (id) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAllShown = () =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (allShownChecked) shown.forEach((a) => next.delete(a._id));
      else shown.forEach((a) => next.add(a._id));
      return next;
    });

  const setStatus = async (ids, status) => {
    setBusy(true);
    setNotice("");
    try {
      await api("/admin/bulk-status", { method: "POST", body: JSON.stringify({ ids, status }) });
      setApps((prev) => prev.map((a) => (ids.includes(a._id) ? { ...a, status } : a)));
      setNotice(`${ids.length} marked "${STATUS_LABEL[status]}".`);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveNotes = async (id) => {
    try {
      await api(`/admin/${id}`, { method: "PATCH", body: JSON.stringify({ notes: notesDraft[id] ?? "" }) });
      setApps((prev) => prev.map((a) => (a._id === id ? { ...a, notes: notesDraft[id] ?? "" } : a)));
      setNotice("Notes saved.");
    } catch (err) {
      alert(err.message);
    }
  };

  const sendEmail = async (test) => {
    const ids = checkedApps.map((a) => a._id);
    if (!ids.length) return;
    if (hasPlaceholder(split, versions, /\[(DATE|TIME|DRESS CODE|HOW TO RESERVE YOUR SEAT)\]/) && !test) {
      if (!window.confirm("Your message still has a [PLACEHOLDER] in it. Send anyway?")) return;
    }
    if (!test && !window.confirm(`Send this email to ${ids.length} ${ids.length === 1 ? "person" : "people"}?`)) return;
    setBusy(true);
    setNotice("");
    try {
      const r = await api("/admin/email", {
        method: "POST",
        body: JSON.stringify({ ids, ...emailPayload(split, versions), test }),
      });
      if (r.test) setNotice(`Test sent to ${r.sentTo} (${(r.versions || []).join(", ")}). Check that inbox.`);
      else {
        setNotice(
          r.failed?.length
            ? `Sent ${r.sent}. Couldn't send to: ${r.failed.join(", ")}`
            : `Sent to ${r.sent} ${r.sent === 1 ? "person" : "people"}.`
        );
        setComposer(false);
        await load();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const previewName = checkedApps[0]?.firstName || "Jordan";

  return (
    <div className="sel-adm">
      <div className="section-row">
        <h3 className="section-heading">GFC Select™</h3>
        <button type="button" className="export-btn" onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      <div className="table-toolbar">
        <button type="button" className={`admin-tab ${view === "apps" ? "active" : ""}`} onClick={() => setView("apps")}>
          Applications ({apps.length})
        </button>
        <button type="button" className={`admin-tab ${view === "doors" ? "active" : ""}`} onClick={() => setView("doors")}>
          The doors &amp; notify list
        </button>
      </div>

      {view === "doors" ? <AdminSelectDoors /> : (
      <>

      {/* The room */}
      <div className="sel-adm-room">
        <div className="sel-adm-stat">
          <span className="sel-adm-stat-num">{counts.menSel}<small>/20</small></span>
          <span className="sel-adm-stat-label">Men selected</span>
        </div>
        <div className="sel-adm-stat">
          <span className="sel-adm-stat-num">{counts.womenSel}<small>/20</small></span>
          <span className="sel-adm-stat-label">Women selected</span>
        </div>
        <div className="sel-adm-stat">
          <span className="sel-adm-stat-num">{counts.new}</span>
          <span className="sel-adm-stat-label">New to review</span>
        </div>
        <div className="sel-adm-stat">
          <span className="sel-adm-stat-num">{counts.waitlist}</span>
          <span className="sel-adm-stat-label">Waitlist</span>
        </div>
      </div>

      {/* Filters */}
      <div className="table-toolbar sel-adm-filters">
        {["new", "selected", "waitlist", "not_this_time", "all"].map((s) => (
          <button
            key={s}
            type="button"
            className={`admin-tab ${statusFilter === s ? "active" : ""}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === "all" ? `All (${apps.length})` : `${STATUS_LABEL[s]} (${counts[s] || 0})`}
          </button>
        ))}
      </div>
      <div className="table-toolbar">
        <select className="filter-select" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} aria-label="Man or woman">
          <option value="all">Men & women</option>
          <option value="man">Men</option>
          <option value="woman">Women</option>
        </select>
        <select className="filter-select" value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)} aria-label="Age group">
          {AGE_GROUPS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
        </select>
        <input
          className="search-input"
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search applications"
        />
      </div>

      {/* Bulk actions */}
      {checked.size > 0 && (
        <div className="sel-adm-bulk" role="region" aria-label="Bulk actions">
          <strong>{checked.size} checked</strong>
          <button type="button" className="gold-fill-btn" disabled={busy} onClick={() => setStatus([...checked], "selected")}>
            Approve (Selected)
          </button>
          <button type="button" className="export-btn" disabled={busy} onClick={() => setStatus([...checked], "waitlist")}>
            Waitlist
          </button>
          <button type="button" className="export-btn" disabled={busy} onClick={() => setStatus([...checked], "not_this_time")}>
            Not this time
          </button>
          <button type="button" className="gold-fill-btn" disabled={busy} onClick={() => setComposer(true)}>
            ✉ Email {checked.size}
          </button>
          <button type="button" className="sel-adm-clear" onClick={() => setChecked(new Set())}>
            Clear
          </button>
        </div>
      )}

      {notice && <p className="sel-adm-notice" role="status">{notice}</p>}
      {error && <p className="dot-red">{error}</p>}

      {/* Email composer */}
      {composer && (
        <div className="sub-card sel-adm-composer">
          <div className="section-row">
            <h4 className="sel-adm-composer-title">Email {checked.size} {checked.size === 1 ? "person" : "people"}</h4>
            <button type="button" className="sel-adm-clear" onClick={() => setComposer(false)}>Close</button>
          </div>
          <p className="td-muted">
            Each person gets their own private email. <code>{"{firstName}"}</code> becomes their first name.
            Replies go to community@.
          </p>
          <p className="td-muted sel-adm-to">
            To: {checkedApps.map((a) => `${a.firstName} ${a.lastName.charAt(0)}.`).join(", ")}
          </p>
          <SelectEmailVersions
            split={split}
            setSplit={setSplit}
            versions={versions}
            setVersions={setVersions}
            names={{
              any: previewName,
              man: checkedApps.find((a) => a.gender === "man")?.firstName,
              woman: checkedApps.find((a) => a.gender === "woman")?.firstName,
            }}
            counts={{
              man: checkedApps.filter((a) => a.gender === "man").length,
              woman: checkedApps.filter((a) => a.gender === "woman").length,
              other: 0,
            }}
          />
          <div className="sel-adm-actions">
            <button type="button" className="export-btn" disabled={busy} onClick={() => sendEmail(true)}>
              Send me a test first
            </button>
            <button type="button" className="gold-fill-btn" disabled={busy} onClick={() => sendEmail(false)}>
              {busy ? "Sending…" : `Send to ${checked.size}`}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="td-muted">Loading applications…</p>
      ) : shown.length === 0 ? (
        <p className="empty-hint">No applications here.</p>
      ) : (
        <div className="sel-adm-list">
          <label className="sel-adm-checkall">
            <input type="checkbox" checked={allShownChecked} onChange={toggleAllShown} />
            Check all {shown.length} shown
          </label>

          {shown.map((a) => {
            const open = openId === a._id;
            const lastEmail = a.emailLog?.length ? a.emailLog[a.emailLog.length - 1] : null;
            return (
              <article key={a._id} className={`sub-card sel-adm-card ${checked.has(a._id) ? "is-checked" : ""}`}>
                <div className="sel-adm-row">
                  <input
                    type="checkbox"
                    checked={checked.has(a._id)}
                    onChange={() => toggle(a._id)}
                    aria-label={`Check ${a.firstName} ${a.lastName}`}
                  />
                  <button
                    type="button"
                    className="sel-adm-name"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : a._id)}
                  >
                    <strong>{a.firstName} {a.lastName}</strong>
                    <span className="td-muted">
                      {a.gender === "man" ? "Man" : "Woman"} · {a.age} · {a.area || "—"}
                      {topValues(a) && <> · ★ {topValues(a)}</>}
                    </span>
                  </button>
                  <span className={`status-pill ${STATUS_PILL[a.status]}`}>{STATUS_LABEL[a.status]}</span>
                  <span className="td-muted sel-adm-date">
                    {fmtDate(a.createdAt)}
                    {lastEmail && <><br />✉ {fmtDate(lastEmail.sentAt)}</>}
                  </span>
                </div>

                {open && (
                  <div className="sel-adm-body">
                    <div className="sel-adm-grid">
                      <Detail label="Email" value={a.email} />
                      <Detail label="Phone" value={a.phone} />
                      <Detail label="Birthdate" value={`${new Date(a.birthdate).toLocaleDateString("en-US", { timeZone: "UTC" })} (${a.age})`} />
                      <Detail label="Side of town" value={a.area} />
                      <Detail label="Work" value={a.occupation} />
                      <Detail label="Instagram" value={a.instagram} />
                      <Detail label="Heard about it" value={a.heardFrom} />
                      <Detail label="Referred by" value={a.referredBy} />
                      <Detail
                        label="Applying with"
                        value={a.friendName ? `${a.friendName}${a.friendEmail ? ` (${a.friendGender === "woman" ? "woman" : "man"}, ${a.friendEmail}, invited)` : ""}` : ""}
                      />
                      <Detail label="Source link" value={a.source} />
                    </div>

                    <h5 className="sel-adm-sub">Their heart</h5>
                    <Detail label="Looking for" value={a.lookingFor} />
                    <Detail label="A great night would be" value={labelOf(NIGHT_GOAL, a.nightGoal)} />
                    <Detail
                      label="Kids"
                      value={a.hasKids ? `Has kids: ${labelOf(KIDS_HAVE, a.hasKids)} · Wants kids: ${labelOf(KIDS_WANT, a.wantsKids)}` : ""}
                    />
                    <Detail label="Would like to meet ages" value={a.ageMin ? `${a.ageMin} to ${a.ageMax}` : ""} />
                    <Detail label="Why now" value={a.whyNow} />
                    <Detail label="Ideal first date" value={a.firstDate} />
                    <Detail label="Matters most in a partner" value={a.matters} />
                    <Detail label="People learn later" value={a.learnLater} />

                    {a.values && Object.keys(a.values).length > 0 && (
                      <>
                        <h5 className="sel-adm-sub">What they value (1 to 5)</h5>
                        <ul className="sel-adm-values">
                          {[...VALUES]
                            .sort((x, y) => (a.values[y.key] || 0) - (a.values[x.key] || 0))
                            .map((v) => (
                              <li key={v.key}><span>{v.label}</span><Dots n={a.values[v.key]} /></li>
                            ))}
                        </ul>
                        <Detail label="Why" value={a.valuesWhy} />
                      </>
                    )}

                    {a.social && (
                      <>
                        <h5 className="sel-adm-sub">How they connect</h5>
                        {CONNECT.map((q) => (
                          <Detail key={q.key} label={q.ask(a.gender)} value={labelOf(q.options, a[q.key])} />
                        ))}
                        <Detail label="Shows love by" value={(a.giveLove || []).map((k) => labelOf(LOVE, k)).join(" · ")} />
                        <Detail label="Feels loved by" value={(a.receiveLove || []).map((k) => labelOf(LOVE, k)).join(" · ")} />
                      </>
                    )}

                    {a.values && Object.keys(a.values).length > 0 && (() => {
                      const matches = apps
                        .filter((b) => b.gender !== a.gender && b.status !== "not_this_time" && b.values && Object.keys(b.values).length)
                        .map((b) => ({ b, ...compatibility(a, b) }))
                        .sort((x, y) => y.score - x.score)
                        .slice(0, 5);
                      if (!matches.length) return null;
                      return (
                        <>
                          <h5 className="sel-adm-sub">Best matches in the room</h5>
                          <ul className="sel-adm-matches">
                            {matches.map(({ b, score, flags }) => (
                              <li key={b._id}>
                                <button type="button" className="sel-adm-match-name" onClick={() => setOpenId(b._id)}>
                                  {b.firstName} {b.lastName?.charAt(0)}. · {b.age}
                                </button>
                                <span className={`sel-adm-score ${score >= 75 ? "high" : score >= 55 ? "mid" : "low"}`}>{score}%</span>
                                <span className={`status-pill ${STATUS_PILL[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                                {flags.length > 0 && <span className="sel-adm-flags">⚠ {flags.join(" · ")}</span>}
                              </li>
                            ))}
                          </ul>
                          <p className="td-muted sel-adm-score-note">
                            Score: values 50%, how they give and receive love 20%, personality 15%, goals and kids 15%.
                          </p>
                        </>
                      );
                    })()}

                    <h5 className="sel-adm-sub">Fun facts (bingo)</h5>
                    <ul className="sel-adm-bingo">
                      {(a.bingo || []).map((b) => (
                        <li key={b.prompt}><span className="td-muted">{b.prompt}:</span> {b.answer}</li>
                      ))}
                    </ul>

                    <h5 className="sel-adm-sub">At the table</h5>
                    <Detail
                      label="Allergies"
                      value={[...(a.allergies || []), a.allergyOther].filter(Boolean).join(", ") || "None"}
                    />
                    <Detail label="Diet" value={(a.diet || []).join(", ") || "None"} />

                    {a.emailLog?.length > 0 && (
                      <>
                        <h5 className="sel-adm-sub">Emails sent</h5>
                        <ul className="sel-adm-bingo">
                          {a.emailLog.map((e, i) => (
                            <li key={i}>{fmtDate(e.sentAt)}: {e.subject}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    <label className="sel-adm-label">
                      Private notes
                      <textarea
                        className="search-input"
                        rows={3}
                        value={notesDraft[a._id] ?? a.notes ?? ""}
                        onChange={(e) => setNotesDraft((p) => ({ ...p, [a._id]: e.target.value }))}
                      />
                    </label>

                    <div className="sel-adm-actions">
                      <button type="button" className="export-btn" onClick={() => saveNotes(a._id)}>Save notes</button>
                      {a.status !== "selected" && (
                        <button type="button" className="gold-fill-btn" disabled={busy} onClick={() => setStatus([a._id], "selected")}>Approve</button>
                      )}
                      {a.status !== "waitlist" && (
                        <button type="button" className="export-btn" disabled={busy} onClick={() => setStatus([a._id], "waitlist")}>Waitlist</button>
                      )}
                      {a.status !== "not_this_time" && (
                        <button type="button" className="export-btn" disabled={busy} onClick={() => setStatus([a._id], "not_this_time")}>Not this time</button>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default AdminSelect;
