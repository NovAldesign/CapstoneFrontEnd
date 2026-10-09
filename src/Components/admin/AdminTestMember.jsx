import React, { useState } from 'react';
import { BACKEND_URL } from '../../Services/eventUtils';

// Make a fake, never-billed member so you can log in at /login and click through
// the member dashboard. Uses /api/member/admin/test-member.
const call = async (method, body) => {
  const res = await fetch(`${BACKEND_URL}/api/member/admin/test-member`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('gfc_token') || ''}` },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
};

const AdminTestMember = () => {
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState('Founding');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);

  const run = async (method) => {
    setBusy(true);
    setNote(null);
    try {
      if (method === 'POST') {
        const d = await call('POST', { email, tier });
        setNote({ ok: true, text: `Ready. ${d.email} is an active ${d.tier} member with $${(d.summary.balanceCents / 100).toFixed(0)} in test credit. Go to /login, enter that email, and open the link it sends. Refresh this page to see it in the list.` });
      } else {
        await call('DELETE', { email });
        setNote({ ok: true, text: 'Test member deleted. Refresh this page to update the list.' });
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
          <h2 className="ga-card-title">Test member</h2>
        </div>
      </div>
      <p className="ga-small ga-muted" style={{ marginTop: -6 }}>
        Makes a fake active member ("Test Member") that is never billed and starts with one month of credit.
        Use an inbox you can open that isn't a real member's email, since the login link is sent there.
        Clicking Create again resets it.
      </p>
      <div className="ga-row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <input className="ga-input" style={{ maxWidth: 280 }} type="email" placeholder="test inbox, e.g. you+test@gmail.com"
          aria-label="Test member email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <select className="ga-select" style={{ maxWidth: 160 }} aria-label="Tier" value={tier} onChange={(e) => setTier(e.target.value)}>
          <option value="Founding">Founding</option>
          <option value="Social">Social</option>
        </select>
        <button type="button" className="ga-btn ga-btn-gold" disabled={busy || !email.trim()} onClick={() => run('POST')}>
          {busy ? 'Working…' : 'Create / reset'}
        </button>
        <button type="button" className="ga-btn ga-btn-danger" disabled={busy || !email.trim()} onClick={() => run('DELETE')}>
          Delete
        </button>
      </div>
      {note && <p className={`ga-note ${note.ok ? '' : 'err'}`} role="status" style={{ marginTop: 10 }}>{note.text}</p>}
    </section>
  );
};

export default AdminTestMember;
