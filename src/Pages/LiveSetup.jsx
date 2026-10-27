import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BACKEND_URL } from '../Services/eventUtils';
import '../Styles/Shop.css';
import '../Styles/LiveSetup.css';

// /live-setup/:id?t=TOKEN — a booked artist picks their Live date. The platform (TikTok, Instagram or Facebook) is set in the dashboard.
// The questions stay on the page, in their confirmation email, and in the dashboard.
const PLATFORM_LABELS = { tiktok: 'TikTok', instagram: 'Instagram', facebook: 'Facebook' };

const liveApi = async (id, token, body) => {
  const res = await fetch(`${BACKEND_URL}/api/lives/${id}?t=${encodeURIComponent(token)}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
};

const showDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { timeZone: 'America/New_York', weekday: 'long', month: 'long', day: 'numeric' }) : '';

const LiveSetup = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const token = params.get('t') || '';
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);
  const [editing, setEditing] = useState(false);

  const load = (data) => {
    setInfo(data);
    const a = data.answers;
    const platform = PLATFORM_LABELS[a.platform] ? a.platform : 'tiktok';
    setForm({
      date: a.customRequest ? 'other' : a.date || '',
      customRequest: a.customRequest,
      platform,
      handle: a.handle || (platform === 'facebook' ? '' : data.handles[platform]) || '',
      phone: a.phone,
      plug: a.plug,
      extraQuestion: a.extraQuestion,
      notes: data.questions.map((_, i) => a.notes[i] || ''),
    });
  };

  // ?approve=1 comes from the "Yes, this time works" button in their email
  const approving = params.get('approve') === '1';
  const [approvedNow, setApprovedNow] = useState(false);
  useEffect(() => {
    const go = approving
      ? fetch(`${BACKEND_URL}/api/lives/${id}/approve?t=${encodeURIComponent(token)}`, { method: 'POST' })
          .then(async (r) => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'Something went wrong.'); setApprovedNow(true); return d; })
          .catch(() => liveApi(id, token))
      : liveApi(id, token);
    go.then(load).catch((e) => setError(e.message));
  }, [id, token, approving]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.date) return setError('Pick a date for your Live.');
    if (!form.handle.trim()) return setError(`Add your ${PLATFORM_LABELS[form.platform] || 'TikTok'} ${form.platform === 'facebook' ? 'name' : 'handle'} so we can invite you.`);
    setSaving(true);
    try {
      const data = await liveApi(id, token, form);
      load(data);
      setDone(data);
      setEditing(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const confirmed = info?.status === 'confirmed' && info.answers.date;
  const showForm = info && form && !info.past && (editing || (!done && !confirmed && info.status !== 'needs-date'));
  const platformName = PLATFORM_LABELS[info?.answers.platform] || 'TikTok';

  return (
    <div className="shop-page">
      <Helmet>
        <title>Your Live | Grown Folks™ Collective</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <main className="shop-main live-main">
        <p className="shop-label">Grown Folks™ Collective Live</p>
        <h1 className="playfair shop-h2">
          {info ? `Let's go Live, ${String(info.artistName || info.firstName).split(/\s+/)[0]}!` : 'Your Live'}
        </h1>
        {!info && !error && <p className="shop-muted">Loading…</p>}
        {error && !info && <p className="shop-error" role="alert">{error}</p>}

        {info && (
          <p className="shop-sub">
            A quick {info.role === 'host' ? 'chat' : 'chat (and maybe a little taste of your talent)'} so our community can meet you
            {info.event ? <> before <strong>{info.event.name}</strong> on {showDate(info.event.date)}</> : ' before the show'}.
            About 20 minutes.
          </p>
        )}

        {info?.past && <div className="shop-card live-card"><p className="shop-muted">This Live has already happened. Thank you!</p></div>}

        {/* Confirmed (or saved) */}
        {info && !info.past && !showForm && (
          <div className="shop-card live-card live-done" role="status">
            {confirmed ? (
              <>
                <div className="live-check" aria-hidden="true">✓</div>
                <h2 className="playfair shop-h3">{approvedNow ? 'Thank you! Your time is confirmed.' : "You're set!"}</h2>
                <p className="live-when">{info.answers.dateLabel}</p>
                <p className="shop-muted">
                  On {platformName}, with {info?.answers.platform === 'facebook' ? 'the Grown Folks Collective Page' : '@grownfolkscollective'}. {done?.emailSent !== false ? 'We emailed you a confirmation with everything below.' : ''}
                </p>
              </>
            ) : (
              <>
                <h2 className="playfair shop-h3">Got it. We'll find a time.</h2>
                <p className="shop-muted">You told us: "{info.answers.customRequest}". Vaughn will email you the date.</p>
              </>
            )}
            <button type="button" className="shop-btn shop-btn-ghost" onClick={() => { setEditing(true); setDone(null); }}>
              Change my answers
            </button>
          </div>
        )}

        {/* The form */}
        {showForm && (
          <form className="live-form" onSubmit={submit} noValidate>
            <fieldset className="shop-card live-card">
              <legend className="playfair shop-h3">1. Pick a date</legend>
              <p className="shop-fine">All times are Atlanta time (ET).</p>
              <div className="live-choices">
                {info.options.map((o) => (
                  <label key={o.value} className={`live-choice ${form.date === o.value ? 'on' : ''}`}>
                    <input type="radio" name="date" value={o.value} checked={form.date === o.value} onChange={set('date')} />
                    <span>{o.label}</span>
                  </label>
                ))}
                <label className={`live-choice ${form.date === 'other' ? 'on' : ''}`}>
                  <input type="radio" name="date" value="other" checked={form.date === 'other'} onChange={set('date')} />
                  <span>None of these work</span>
                </label>
              </div>
              {form.date === 'other' && (
                <label className="live-field">
                  Tell us a few days and times that work for you
                  <textarea rows={2} maxLength={400} value={form.customRequest} onChange={set('customRequest')} placeholder="Example: Wednesday or Thursday after 6 PM" />
                </label>
              )}
            </fieldset>

            <fieldset className="shop-card live-card">
              <legend className="playfair shop-h3">2. Your {platformName}</legend>
              <p className="shop-fine">This Live is on {platformName}, on {info?.answers.platform === 'facebook' ? 'the Grown Folks Collective Page' : '@grownfolkscollective'}.</p>
              {form.platform && (
                <div className="shop-fields live-two">
                  <label>
                    Your {platformName} {form.platform === 'facebook' ? 'name or profile link' : 'handle'}
                    <input value={form.handle} onChange={set('handle')} maxLength={120} placeholder={form.platform === 'facebook' ? 'Name or facebook.com/…' : '@yourname'} required />
                    <small>So we can invite you into the Live.</small>
                  </label>
                  <label>
                    Best number to text that day
                    <input type="tel" value={form.phone} onChange={set('phone')} maxLength={40} />
                    <small>Only if we need to reach you.</small>
                  </label>
                </div>
              )}
            </fieldset>

            <fieldset className="shop-card live-card">
              <legend className="playfair shop-h3">3. What we'll talk about</legend>
              <p className="shop-fine">Here's what Vaughn plans to ask. Jot a quick note under any question if you'd like (optional). It helps us tee you up.</p>
              <ol className="live-questions">
                {info.questions.map((q, i) => (
                  <li key={q}>
                    <span className="live-q">{q}</span>
                    <input
                      aria-label={`Your note for question ${i + 1}`}
                      value={form.notes[i] || ''}
                      maxLength={400}
                      placeholder="Your note (optional)"
                      onChange={(e) => setForm((f) => {
                        const notes = [...f.notes];
                        notes[i] = e.target.value;
                        return { ...f, notes };
                      })}
                    />
                  </li>
                ))}
              </ol>
              <label className="live-field">
                Anything you'd love us to ask? (optional)
                <input value={form.extraQuestion} onChange={set('extraQuestion')} maxLength={300} />
              </label>
              <label className="live-field">
                Anything you want to plug? (optional)
                <input value={form.plug} onChange={set('plug')} maxLength={400} placeholder="A new single, your next show, your merch…" />
              </label>
            </fieldset>

            {error && <p className="shop-error" role="alert">{error}</p>}
            <div className="live-actions">
              <button type="submit" className="shop-btn shop-btn-gold" disabled={saving}>
                {saving ? 'Saving…' : form.date === 'other' ? 'Send my times' : 'Confirm my Live'}
              </button>
              {editing && (
                <button type="button" className="shop-btn shop-btn-ghost" disabled={saving} onClick={() => { setEditing(false); load(info); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {/* Questions stay attached after confirming */}
        {info && !info.past && !showForm && confirmed && (
          <div className="shop-card live-card">
            <h2 className="playfair shop-h3">What we'll talk about</h2>
            <ol className="live-questions live-questions-read">
              {info.questions.map((q, i) => (
                <li key={q}>
                  <span className="live-q">{q}</span>
                  {info.answers.notes[i] && <small>Your note: {info.answers.notes[i]}</small>}
                </li>
              ))}
              {info.answers.extraQuestion && (
                <li><span className="live-q">{info.answers.extraQuestion}</span><small>Your idea</small></li>
              )}
            </ol>
            {info.answers.plug && <p className="shop-muted"><strong>You'd like to plug:</strong> {info.answers.plug}</p>}
            <h3 className="live-h4">How to join</h3>
            <ol className="live-steps">
              <li>Follow {info.answers.platform === 'facebook' ? 'the Grown Folks Collective Page' : '@grownfolkscollective'} on {platformName} if you haven't yet.</li>
              <li>Open {platformName} a few minutes before start time and join our Live when it starts.</li>
              <li>Vaughn will invite you in. Accept and you're on!</li>
            </ol>
          </div>
        )}

        <p className="shop-fine live-help">Questions? Email <strong>events@grownfolkscollective.com</strong>.</p>
        <div className="shop-actions">
          <Link to="/events" className="shop-btn shop-btn-navy">See upcoming events</Link>
        </div>
        <p className="shop-tagline playfair">Where grown folks come out to play.™</p>
      </main>
    </div>
  );
};

export default LiveSetup;
