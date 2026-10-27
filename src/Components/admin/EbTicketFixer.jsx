import React, { useState } from 'react';
import { BACKEND_URL } from '../../Services/eventUtils';

// "Update Eventbrite tickets": checks the 8 upcoming non-food events on Eventbrite,
// shows exactly what would change, and only changes things after you approve.
const call = async (path, method = 'GET') => {
  const res = await fetch(`${BACKEND_URL}/api/events/admin/eb-tickets/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('gfc_token') || ''}` },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 || res.status === 403) throw new Error('Your login expired. Please log out and log back in.');
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
};

const day = (ymd) => new Date(`${ymd}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

const EbTicketFixer = ({ onDone }) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState('');
  const [planRows, setPlanRows] = useState(null);
  const [result, setResult] = useState(null);
  const [faq, setFaq] = useState(null);
  const [error, setError] = useState('');

  const check = async () => {
    setOpen(true); setBusy('check'); setError(''); setResult(null);
    try {
      const d = await call('plan');
      setPlanRows(d.events); setFaq(d.faq);
    } catch (e) { setError(e.message); }
    setBusy('');
  };

  const applyAll = async () => {
    if (!window.confirm('Make these changes on Eventbrite now?')) return;
    setBusy('apply'); setError('');
    try {
      const d = await call('apply', 'POST');
      setResult(d.events); setFaq(d.faq);
      onDone?.();
    } catch (e) { setError(e.message); }
    setBusy('');
  };

  const total = (planRows || []).reduce((n, r) => n + (r.changes?.length || 0), 0);
  const rows = result || planRows;

  return (
    <div className="eb-fix">
      <button type="button" className="ga-btn ga-btn-sm ga-btn-navy" disabled={!!busy} onClick={check}>
        {busy === 'check' ? 'Checking Eventbrite…' : 'Update Eventbrite tickets'}
      </button>

      {open && (
        <div className="eb-fix-panel">
          {error && <p className="ga-note err">{error}</p>}
          {rows && (
            <>
              <p className="ga-small">
                {result
                  ? 'Done. Here is what happened on each event.'
                  : total
                    ? `${total} change${total === 1 ? '' : 's'} to make. Nothing has changed yet.`
                    : 'Everything already matches. Nothing to change.'}
              </p>

              {rows.map((r) => (
                <div key={r.date} className="eb-fix-row">
                  <strong>{day(r.date)}: {r.name || r.label}</strong>
                  {r.verifyOnly && <span className="ga-small ga-muted"> · check only</span>}
                  {r.error && <p className="ga-note err">{r.error}</p>}
                  {r.skip && <p className="ga-small">{r.notes?.[0]}</p>}

                  {!result && !r.error && !r.skip && (
                    r.changes?.length
                      ? <ul>{r.changes.map((c) => <li key={c.text}>{c.text}</li>)}</ul>
                      : <p className="ga-small">Already right. No changes needed.</p>
                  )}

                  {result && !r.error && !r.skip && (
                    <>
                      <p className="ga-small">{r.result}</p>
                      {r.done?.length > 0 && <ul>{r.done.map((t) => <li key={t}>Done: {t}</li>)}</ul>}
                      {r.failed?.length > 0 && <ul className="err">{r.failed.map((t) => <li key={t}>Didn't work: {t}</li>)}</ul>}
                      {r.after && (
                        <p className="ga-small">Now on Eventbrite: {r.after.map((t) => `${t.name} $${Number(t.price).toFixed(2)} (${t.quantity})`).join(' · ')}</p>
                      )}
                      {r.siteFaq && <p className="ga-small">{r.siteFaq}</p>}
                    </>
                  )}

                  {r.guards?.length > 0 && (
                    <p className="ga-small">
                      Guard rule: {r.guards.map((g) => `${g.ticket} already sold ${g.sold}, so its quantity is ${g.sold} instead of ${g.planned}`).join('; ')}.
                    </p>
                  )}
                  {r.notes?.length > 0 && !r.skip && r.notes.map((n) => <p key={n} className="ga-small ga-muted">{n}</p>)}
                  {r.url && <p className="ga-small"><a href={r.url} target="_blank" rel="noreferrer">Open public page</a></p>}
                </div>
              ))}

              {!result && total > 0 && (
                <button type="button" className="gold-fill-btn" disabled={!!busy} onClick={applyAll}>
                  {busy === 'apply' ? 'Updating Eventbrite…' : `Make these ${total} changes`}
                </button>
              )}

              {faq && (
                <div className="eb-fix-faq">
                  <p className="ga-small"><strong>One thing to do by hand:</strong> on the Oct 30, Nov 6 and Dec 4 Eventbrite descriptions, replace the door FAQ answer with this. Eventbrite doesn't let the website edit descriptions.</p>
                  <textarea readOnly rows={4} value={`Q: ${faq.question}\nA: ${faq.answer}`} onFocus={(e) => e.target.select()} />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EbTicketFixer;
