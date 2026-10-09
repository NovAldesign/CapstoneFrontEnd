import React, { useState } from 'react';
import { BACKEND_URL } from '../../Services/eventUtils';

// Make a fake sponsor or Member Perk under your email so you can click through
// the partner portal. Uses /api/partner/admin/test. Test perks never show to members.
const call = async (method, body) => {
  const res = await fetch(`${BACKEND_URL}/api/partner/admin/test`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('gfc_token') || ''}` },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
};

const AdminTestPartner = () => {
  const [email, setEmail] = useState('');
  const [type, setType] = useState('Silver'); // Bronze | Silver | Gold | perk
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);

  const run = async (method) => {
    setBusy(true);
    setNote(null);
    try {
      if (method === 'POST') {
        const kind = type === 'perk' ? 'perk' : 'sponsor';
        const d = await call('POST', { email, kind, tier: kind === 'sponsor' ? type : undefined });
        setNote({
          ok: true,
          link: d.link,
          text: kind === 'perk'
            ? `Ready. "Test Perk Shop" is approved under ${d.email} (members never see it).${d.emailed ? ' The welcome email is in that inbox too.' : ''}`
            : `Ready. "Test Sponsor Co (${type})" is approved under ${d.email}, set to the next event, with a $1 payment to try Stripe (refund it in Stripe after).${d.emailed ? ' The welcome email is in that inbox too.' : ''}`,
        });
      } else {
        await call('DELETE', { email });
        setNote({ ok: true, text: 'Test partner deleted. Refresh this page to update the list.' });
      }
    } catch (e) {
      setNote({ ok: false, text: e.message });
    }
    setBusy(false);
  };

  return (
    <section className="ga-card" style={{ marginTop: 16 }}>
      <div className="ga-card-head">
        <div>
          <p className="ga-kicker">For testing</p>
          <h2 className="ga-card-title">Test partner</h2>
        </div>
      </div>
      <p className="ga-small ga-muted" style={{ marginTop: -6 }}>
        Makes a fake approved sponsor or Member Perk under an email you can open, and gives you its portal link.
        Clicking Create again resets it to a fresh start. No reminder emails go to test partners.
      </p>
      <div className="ga-row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <input className="ga-input" style={{ maxWidth: 280 }} type="email" placeholder="test inbox, e.g. you+partner@gmail.com"
          aria-label="Test partner email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <select className="ga-select" style={{ maxWidth: 190 }} aria-label="Type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Bronze">Sponsor · Bronze</option>
          <option value="Silver">Sponsor · Silver</option>
          <option value="Gold">Sponsor · Gold</option>
          <option value="perk">Member Perk</option>
        </select>
        <button type="button" className="ga-btn ga-btn-gold" disabled={busy || !email.trim()} onClick={() => run('POST')}>
          {busy ? 'Working…' : 'Create / reset'}
        </button>
        <button type="button" className="ga-btn ga-btn-danger" disabled={busy || !email.trim()} onClick={() => run('DELETE')}>
          Delete
        </button>
      </div>
      {note && (
        <div className={`ga-note ${note.ok ? '' : 'err'}`} role="status" style={{ marginTop: 10 }}>
          {note.text}
          {note.link && (
            <div style={{ marginTop: 8 }}>
              <a className="ga-btn ga-btn-sm ga-btn-navy" href={note.link} target="_blank" rel="noopener noreferrer">Open the portal</a>
              <span className="ga-small ga-muted" style={{ marginLeft: 8 }}>Opens in a new tab. The link works once; click Create again for a new one.</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default AdminTestPartner;
