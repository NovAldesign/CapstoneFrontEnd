import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import memberApi, { SessionExpired } from '../Services/memberApi';
import '../Styles/MemberDashboard.css';

// Paying with credit at checkout is the next build. Flip this to true when it ships.
const CREDIT_AT_CHECKOUT = false;
const TEAM_EMAIL = 'community@grownfolkscollective.com';

const money = (cents = 0) => {
  const d = Math.abs(cents) / 100;
  return `$${Number.isInteger(d) ? d : d.toFixed(2)}`;
};
const longDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { timeZone: 'America/New_York', month: 'long', day: 'numeric', year: 'numeric' }) : '';
const shortDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric' }) : '';

const HISTORY_LABEL = { earned: 'Monthly credit', bonus: 'Bonus', used: 'Used', expired: 'Expired' };

const TIER_PERKS = {
  Social: [
    ['Member pricing', '$5 off every ticket, and 10% off food events'],
    ['Early access', 'Tickets 48 hours before the public, plus priority waitlist for sold-out events'],
    ['Birthday bonus', '$25 extra event credit in your birthday month'],
    ['Private member group chat', 'Your people between events'],
  ],
  Founding: [
    ['Member pricing', '$7 off every ticket, and 15% off food events'],
    ['Early access', 'Tickets 72 hours before the public, plus first dibs on group travel'],
    ['Guest pass', 'Bring a friend free once every quarter'],
    ['Birthday bonus', '$25 extra event credit, and your guest gets in free'],
    ['Private member group chat', 'Your people between events'],
  ],
};

const REDEEM_TEXT = {
  'show-membership': 'Show your GFC membership when you pay.',
  mention: 'Mention Grown Folks™ Collective when you pay.',
  'promo-code': 'Use the code below.',
  other: 'Ask about the GFC member offer.',
};
const perkLink = (url) =>
  !url ? '' : /^https?:\/\//i.test(url) ? url : url.startsWith('@') ? `https://instagram.com/${url.slice(1)}` : `https://${url}`;

/* ---------------- Event credit ---------------- */
const CreditCard = ({ member, credit }) => {
  const [showAll, setShowAll] = useState(false);
  const history = credit.history || [];
  const shown = showAll ? history : history.slice(0, 5);
  return (
    <section className="md-card md-credit" aria-labelledby="md-credit-title">
      <span className="md-eyebrow">Event credit</span>
      <h2 id="md-credit-title" className="md-sr">Event credit</h2>
      <div className="md-balance">{money(credit.balanceCents)}</div>
      <p className="md-balance-sub">
        available now · {money(member.monthlyCreditCents)} added every paid month
      </p>

      {credit.nextExpiring && (
        <p className="md-expiring">
          <strong>{money(credit.nextExpiring.cents)}</strong> expires {longDate(credit.nextExpiring.date)}. Use it before then.
        </p>
      )}

      <p className="md-note">
        Works on Game Nights, Karaoke Bingo and Acoustic &amp; Infused, and can cover the whole ticket.
        Food events get your member discount instead. Unused credit rolls over one month, then expires,
        and your oldest credit is always used first.
      </p>
      {!CREDIT_AT_CHECKOUT && credit.balanceCents > 0 && (
        <p className="md-note md-note-gold">
          Paying with credit at checkout is coming soon. Until then, email{' '}
          <a href={`mailto:${TEAM_EMAIL}?subject=Use my event credit`}>{TEAM_EMAIL}</a> with the event you want, and we'll book it with your credit.
        </p>
      )}

      <h3 className="md-subhead">History</h3>
      {history.length === 0 ? (
        <p className="md-muted">Your credit shows up here after your next membership payment.</p>
      ) : (
        <>
          <ul className="md-history">
            {shown.map((h) => (
              <li key={h._id} className={`md-history-row md-${h.type}`}>
                <div>
                  <span className="md-history-type">{HISTORY_LABEL[h.type] || h.type}</span>
                  <span className="md-history-note">{h.note}</span>
                </div>
                <div className="md-history-right">
                  <span className="md-history-amt">{h.cents > 0 ? '+' : '−'}{money(h.cents)}</span>
                  <span className="md-history-date">{shortDate(h.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
          {history.length > 5 && (
            <button type="button" className="md-link-btn" onClick={() => setShowAll((s) => !s)}>
              {showAll ? 'Show less' : `Show all ${history.length}`}
            </button>
          )}
        </>
      )}
    </section>
  );
};

/* ---------------- Membership + pause/cancel ---------------- */
const MembershipCard = ({ member, onChange, busy, run }) => {
  const [panel, setPanel] = useState(''); // '', 'pause', 'cancel'
  const [months, setMonths] = useState(1);
  const [reason, setReason] = useState('');

  const status = member.cancelAtPeriodEnd ? 'ending' : member.status;
  const statusText = {
    active: 'Active',
    paused: 'Paused',
    ending: 'Ending',
    canceled: 'Ended',
  }[status];

  const act = (fn) => run(async () => { const r = await fn(); onChange(r); setPanel(''); setReason(''); });

  return (
    <section className="md-card md-membership" aria-labelledby="md-membership-title">
      <div className="md-card-head">
        <h2 id="md-membership-title" className="playfair md-card-title">Your membership</h2>
        <span className={`md-pill md-pill-${status}`}>{statusText}</span>
      </div>

      <dl className="md-facts">
        <div><dt>Plan</dt><dd>{member.tier === 'Founding' ? 'Founding Member · $69.99/mo' : 'Social Pass · $39.99/mo'}</dd></div>
        {member.memberSince && <div><dt>Member since</dt><dd>{longDate(member.memberSince)}</dd></div>}
        {status === 'active' && member.nextBillingDate && <div><dt>Next billing date</dt><dd>{longDate(member.nextBillingDate)}</dd></div>}
        {status === 'paused' && member.pausedUntil && <div><dt>Billing restarts</dt><dd>{longDate(member.pausedUntil)}</dd></div>}
        {status === 'ending' && member.currentPeriodEnd && <div><dt>Membership ends</dt><dd>{longDate(member.currentPeriodEnd)}</dd></div>}
      </dl>
      {member.tier === 'Founding' && status !== 'canceled' && (
        <p className="md-badge">★ Founding rate locked for life</p>
      )}

      {status === 'paused' && (
        <p className="md-note">You're taking a break. You won't earn new credit while paused, but the credit you have still works until it expires.</p>
      )}
      {status === 'ending' && (
        <p className="md-note">You keep your perks and credit until {longDate(member.currentPeriodEnd)}. Changed your mind? You can keep your membership below.</p>
      )}
      {status === 'canceled' && (
        <p className="md-note">Your membership has ended. We'd love to have you back anytime.</p>
      )}

      {!member.canManageBilling && status !== 'canceled' ? (
        <p className="md-muted">To change your membership, email <a href={`mailto:${TEAM_EMAIL}`}>{TEAM_EMAIL}</a>.</p>
      ) : (
        <div className="md-actions">
          {status === 'active' && !panel && (
            <>
              <button type="button" className="md-btn md-btn-outline" onClick={() => setPanel('pause')}>Take a break</button>
              <button type="button" className="md-link-btn md-danger" onClick={() => setPanel('cancel')}>Cancel membership</button>
            </>
          )}
          {status === 'paused' && !panel && (
            <>
              <button type="button" className="md-btn md-btn-gold" disabled={busy} onClick={() => act(memberApi.resume)}>Resume now</button>
              <button type="button" className="md-link-btn md-danger" onClick={() => setPanel('cancel')}>Cancel membership</button>
            </>
          )}
          {status === 'ending' && (
            <button type="button" className="md-btn md-btn-gold" disabled={busy} onClick={() => act(memberApi.keep)}>Keep my membership</button>
          )}
          {status === 'canceled' && <Link to="/membership" className="md-btn md-btn-gold">Rejoin</Link>}
        </div>
      )}

      {panel === 'pause' && (
        <div className="md-panel">
          <h3 className="md-subhead">Take a break</h3>
          <p className="md-note">This month is already paid, so you keep everything until {longDate(member.nextBillingDate) || 'your next billing date'}. Then we skip your bill and billing restarts on its own.</p>
          <div className="md-choice" role="radiogroup" aria-label="How long">
            {[1, 2].map((n) => (
              <label key={n} className={`md-choice-opt ${months === n ? 'is-on' : ''}`}>
                <input type="radio" name="months" value={n} checked={months === n} onChange={() => setMonths(n)} />
                {n} month{n === 2 ? 's' : ''}
              </label>
            ))}
          </div>
          <div className="md-actions">
            <button type="button" className="md-btn md-btn-gold" disabled={busy} onClick={() => act(() => memberApi.pause(months))}>
              {busy ? 'Pausing…' : `Pause for ${months} month${months === 2 ? 's' : ''}`}
            </button>
            <button type="button" className="md-link-btn" onClick={() => setPanel('')}>Never mind</button>
          </div>
        </div>
      )}

      {panel === 'cancel' && (
        <div className="md-panel">
          <h3 className="md-subhead">Cancel your membership?</h3>
          <p className="md-note">
            It ends on {longDate(member.currentPeriodEnd) || 'your next billing date'} and won't renew.
            {status === 'active' && ' Need some time instead? You can take a 1 or 2 month break and keep your spot.'}
          </p>
          <label className="md-label" htmlFor="md-reason">Mind telling us why? (optional)</label>
          <textarea id="md-reason" className="md-input" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="md-actions">
            <button type="button" className="md-btn md-btn-danger" disabled={busy} onClick={() => act(() => memberApi.cancel(reason))}>
              {busy ? 'Saving…' : 'Yes, cancel'}
            </button>
            {status === 'active' && <button type="button" className="md-btn md-btn-outline" onClick={() => setPanel('pause')}>Take a break instead</button>}
            <button type="button" className="md-link-btn" onClick={() => setPanel('')}>Keep my membership</button>
          </div>
        </div>
      )}
    </section>
  );
};

/* ---------------- Perks ---------------- */
const PerksCard = ({ member, perks }) => (
  <section className="md-card md-perks" aria-labelledby="md-perks-title">
    <h2 id="md-perks-title" className="playfair md-card-title">Your perks</h2>
    <ul className="md-perk-list">
      {(TIER_PERKS[member.tier] || TIER_PERKS.Social).map(([name, text]) => (
        <li key={name}><strong>{name}</strong><span>{text}</span></li>
      ))}
      <li><strong>Referral code</strong><span>Coming soon: friends save $10, and {member.tier === 'Founding' ? '3' : '4'} referrals earn you a free month</span></li>
    </ul>
    <p className="md-muted">Not in the member group chat yet? <a href={`mailto:${TEAM_EMAIL}?subject=Add me to the member group chat`}>Ask us to add you</a>.</p>

    {perks.length > 0 && (
      <>
        <h3 className="md-subhead">Savings around Atlanta</h3>
        <ul className="md-partner-list">
          {perks.map((p) => {
            const link = perkLink(p.website);
            return (
              <li key={p._id} className="md-partner">
                <div className="md-partner-logo">
                  {p.logo ? <img src={p.logo} alt="" loading="lazy" /> : <span aria-hidden="true">{(p.businessName || '?').charAt(0)}</span>}
                </div>
                <div>
                  <strong>{link ? <a href={link} target="_blank" rel="noopener noreferrer">{p.businessName}</a> : p.businessName}</strong>
                  <span className="md-partner-offer">{p.offer}</span>
                  <span className="md-muted">{REDEEM_TEXT[p.redeem] || REDEEM_TEXT.other}</span>
                  {p.redeem === 'promo-code' && p.promoCode && <code className="md-code">{p.promoCode}</code>}
                  {p.finePrint && <span className="md-fine">{p.finePrint}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      </>
    )}
  </section>
);

/* ---------------- Personal info ---------------- */
const InfoCard = ({ member, options, onSaved, busy, run }) => {
  const initial = {
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    phone: member.phone,
    birthday: member.birthday,
    interests: member.interests || [],
  };
  const [form, setForm] = useState(initial);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggle = (opt) =>
    setForm((f) => ({ ...f, interests: f.interests.includes(opt) ? f.interests.filter((i) => i !== opt) : [...f.interests, opt] }));

  const save = (e) => {
    e.preventDefault();
    run(async () => {
      const r = await memberApi.update(form);
      onSaved({ ...r, message: 'Your info is saved.' });
    });
  };

  return (
    <section className="md-card md-info" aria-labelledby="md-info-title">
      <h2 id="md-info-title" className="playfair md-card-title">Your info</h2>
      <form onSubmit={save} className="md-form">
        <div className="md-row">
          <div>
            <label className="md-label" htmlFor="md-first">First name</label>
            <input id="md-first" className="md-input" value={form.firstName} onChange={set('firstName')} autoComplete="given-name" required />
          </div>
          <div>
            <label className="md-label" htmlFor="md-last">Last name</label>
            <input id="md-last" className="md-input" value={form.lastName} onChange={set('lastName')} autoComplete="family-name" required />
          </div>
        </div>
        <label className="md-label" htmlFor="md-email">Email</label>
        <input id="md-email" type="email" className="md-input" value={form.email} onChange={set('email')} autoComplete="email" required />
        <span className="md-hint">Your login links and receipts go here.</span>
        <div className="md-row">
          <div>
            <label className="md-label" htmlFor="md-phone">Phone</label>
            <input id="md-phone" type="tel" className="md-input" value={form.phone} onChange={set('phone')} autoComplete="tel" required />
          </div>
          <div>
            <label className="md-label" htmlFor="md-bday">Birthday</label>
            <input id="md-bday" type="date" className="md-input" value={form.birthday} onChange={set('birthday')} autoComplete="bday" required />
          </div>
        </div>

        <fieldset className="md-fieldset">
          <legend className="md-label">What you're into</legend>
          <div className="md-chips">
            {options.map((opt) => (
              <label key={opt} className={`md-chip ${form.interests.includes(opt) ? 'is-on' : ''}`}>
                <input type="checkbox" checked={form.interests.includes(opt)} onChange={() => toggle(opt)} />
                {opt}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="md-actions">
          <button type="submit" className="md-btn md-btn-gold" disabled={!dirty || busy}>{busy ? 'Saving…' : 'Save changes'}</button>
          {dirty && <button type="button" className="md-link-btn" onClick={() => setForm(initial)}>Undo</button>}
        </div>
      </form>
    </section>
  );
};

/* ---------------- Page ---------------- */
const MemberDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [perks, setPerks] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState(null); // { kind: 'ok'|'error', text }
  const [busy, setBusy] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('gfc_token');
    localStorage.removeItem('gfc_user');
    navigate('/login', { replace: true });
  }, [navigate]);

  const handleError = useCallback((err) => {
    if (err instanceof SessionExpired) return logout();
    setNotice({ kind: 'error', text: err.message });
  }, [logout]);

  const load = useCallback(async () => {
    try {
      setData(await memberApi.me());
    } catch (err) {
      if (err instanceof SessionExpired) return logout();
      setLoadError(err.message);
    }
  }, [logout]);

  useEffect(() => {
    load();
    memberApi.perks().then((p) => Array.isArray(p) && setPerks(p)).catch(() => {});
  }, [load]);

  // Runs one change at a time and shows the result
  const run = async (fn) => {
    setBusy(true);
    setNotice(null);
    try { await fn(); } catch (err) { handleError(err); } finally { setBusy(false); }
  };

  const applyChange = (r) => {
    setData((d) => ({ ...d, member: r.member }));
    if (r.message) setNotice({ kind: 'ok', text: r.message });
    // keep the name in the navbar up to date
    try {
      const u = JSON.parse(localStorage.getItem('gfc_user') || '{}');
      localStorage.setItem('gfc_user', JSON.stringify({ ...u, name: r.member.firstName, email: r.member.email }));
    } catch { /* ignore */ }
  };

  if (loadError) {
    return (
      <div className="md-gate">
        <div className="md-gate-card" role="alert">
          <h1 className="playfair">We couldn't load your dashboard</h1>
          <p>{loadError}</p>
          <button type="button" className="md-btn md-btn-gold" onClick={() => { setLoadError(''); load(); }}>Try again</button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="md-gate">
        <div className="md-gate-card" role="status">
          <div className="md-spinner" aria-hidden="true" />
          <p>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const { member, credit, interestOptions } = data;

  return (
    <div className="md-page">
      <Helmet>
        <title>My Membership | Grown Folks™ Collective</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <header className="md-hero">
        <div className="md-hero-inner">
          <span className="md-eyebrow">{member.tier === 'Founding' ? 'Founding Member' : 'Social Pass'}</span>
          <h1 className="playfair md-hero-title">Welcome back, {member.firstName}</h1>
          <p className="md-hero-sub">Where grown folks come out to play.™</p>
        </div>
      </header>

      <div className="md-wrap">
        {notice && (
          <div className={`md-notice md-notice-${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
            <span>{notice.text}</span>
            <button type="button" className="md-notice-x" aria-label="Dismiss" onClick={() => setNotice(null)}>×</button>
          </div>
        )}

        <div className="md-grid">
          <div className="md-col">
            <CreditCard member={member} credit={credit} />
            <PerksCard member={member} perks={perks} />
          </div>
          <div className="md-col">
            <MembershipCard member={member} onChange={applyChange} busy={busy} run={run} />
            <InfoCard key={member.email + member.phone + member.birthday} member={member} options={interestOptions || []} onSaved={applyChange} busy={busy} run={run} />
          </div>
        </div>

        <footer className="md-foot">
          <Link to="/events" className="md-btn md-btn-outline">See upcoming events</Link>
          <p className="md-muted">Questions? Email <a href={`mailto:${TEAM_EMAIL}`}>{TEAM_EMAIL}</a>.</p>
          <button type="button" className="md-link-btn" onClick={logout}>Log out</button>
        </footer>
      </div>
    </div>
  );
};

export default MemberDashboard;
