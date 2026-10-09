import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import partnerApi, { SessionExpired, partnerToken, signOutPartner } from '../Services/partnerApi';
import { SPONSOR_AGREEMENT_VERSION, PERK_TERMS_VERSION } from '../content/legalContent.js';
import '../Styles/MemberDashboard.css';
import '../Styles/PartnerPortal.css';

// =============================================================
// PARTNER PORTAL  (/partner)
// Sponsors and Member Perks partners: status, uploads, details,
// agreement, payment, event info. Sign-in by emailed link.
// =============================================================

const money = (cents = 0) => {
  const d = Number(cents) / 100;
  return `$${Number.isInteger(d) ? d.toLocaleString('en-US') : d.toFixed(2)}`;
};
const longDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { timeZone: 'America/New_York', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const timeOf = (d) => new Date(d).toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' });
const shortDate = (d) => new Date(d).toLocaleDateString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric' });
const words = (v) => String(v || '').trim().split(/\s+/).filter(Boolean).length;
const TIER_NAME = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', custom: 'Custom' };

// Shrinks a perk logo to 320px and returns a small image (same as the dashboard)
const shrinkLogo = (file) =>
  new Promise((resolve, reject) => {
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) return reject(new Error('Use a PNG, JPG or WebP logo.'));
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 320 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      let out = canvas.toDataURL('image/png');
      for (let q = 0.9; out.length > 110000 && q > 0.3; q -= 0.15) out = canvas.toDataURL('image/webp', q);
      if (out.length > 110000) return reject(new Error('That logo is too detailed. Try a simpler or smaller file.'));
      resolve(out);
    };
    img.onerror = () => reject(new Error("Couldn't read that image."));
    img.src = URL.createObjectURL(file);
  });

// Big phone photos get resized before upload
const shrinkPhoto = (file, max = 2000) =>
  new Promise((resolve) => {
    if (!/^image\/(jpe?g|png|webp)$/i.test(file.type) || file.size < 1.5 * 1024 * 1024) return resolve(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      canvas.toBlob((blob) => resolve(blob ? new File([blob], 'photo.jpg', { type: 'image/jpeg' }) : file), 'image/jpeg', 0.85);
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });

/* ---------------- Sign in ---------------- */
const SignIn = ({ note }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState('');
  const [error, setError] = useState(note || '');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await partnerApi.requestLink(email.trim());
      setSent(r.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="md-gate">
      <Helmet>
        <title>Partner Portal | Grown Folks™ Collective</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="md-gate-card pp-signin">
        <span className="md-eyebrow">Partner Portal</span>
        <h1 className="playfair">Sign in</h1>
        {sent ? (
          <p role="status">{sent}</p>
        ) : (
          <form onSubmit={submit} className="md-form">
            <p className="md-muted">Sponsors and Member Perks partners: enter the email you used with us and we'll send a sign-in link. No password needed.</p>
            <label className="md-label" htmlFor="pp-email">Email</label>
            <input id="pp-email" type="email" className="md-input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            {error && <p className="pp-error" role="alert">{error}</p>}
            <button type="submit" className="md-btn md-btn-gold" disabled={busy}>{busy ? 'Sending…' : 'Email me a sign-in link'}</button>
          </form>
        )}
        <p className="md-muted pp-signin-foot">
          Not a partner yet? <Link to="/partnerships">See partnership options</Link> or <Link to="/partnerships/perks">offer a Member Perk</Link>.
        </p>
      </div>
    </div>
  );
};

/* ---------------- Opened from the email: /partner/login/:token ---------------- */
export const PartnerLoginLink = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const started = useRef(false); // the link only works once
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    partnerApi.verify(token).then(() => navigate('/partner', { replace: true })).catch((err) => setError(err.message));
  }, [token, navigate]);
  return (
    <div className="md-gate">
      <Helmet>
        <title>Signing In | Grown Folks™ Collective</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      {error ? (
        <div className="md-gate-card" role="alert">
          <h1 className="playfair">That link didn't work</h1>
          <p>{error}</p>
          <Link to="/partner" className="md-btn md-btn-gold">Send me a new link</Link>
        </div>
      ) : (
        <div className="md-gate-card" role="status">
          <div className="md-spinner" aria-hidden="true" />
          <h1 className="playfair">Opening your portal…</h1>
        </div>
      )}
    </div>
  );
};

/* ---------------- Status steps ---------------- */
const Steps = ({ steps }) => {
  const current = steps.findIndex((s) => !s.done);
  return (
    <ol className="pp-steps" aria-label="Partnership status">
      {steps.map((s, i) => (
        <li key={s.key} className={`pp-step ${s.done ? 'done' : ''} ${i === current ? 'current' : ''}`} aria-current={i === current ? 'step' : undefined}>
          <span className="pp-step-dot" aria-hidden="true">{s.done ? '✓' : i + 1}</span>
          <span className="pp-step-label">{s.label}</span>
        </li>
      ))}
    </ol>
  );
};

/* ---------------- To-do list ---------------- */
const Checklist = ({ portal }) => {
  const { done, total } = portal.progress;
  const pct = total ? Math.round((done / total) * 100) : 100;
  return (
    <section className="md-card" aria-labelledby="pp-todo-title">
      <div className="md-card-head">
        <h2 id="pp-todo-title" className="playfair md-card-title">Your to-do list</h2>
        <span className="pp-count">{done} of {total}</span>
      </div>
      <div className="pp-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Checklist progress">
        <span style={{ width: `${pct}%` }} />
      </div>
      <ul className="pp-checklist">
        {portal.checklist.map((i) => (
          <li key={i.key} className={i.done ? 'done' : ''}>
            <span className="pp-check" aria-hidden="true">{i.done ? '✓' : ''}</span>
            <span>{i.label}</span>
            <span className="md-sr">{i.done ? '(done)' : '(to do)'}</span>
          </li>
        ))}
      </ul>
      {done === total && <p className="md-note md-note-gold">You're all set. Thank you! We'll reach out if we need anything else.</p>}
    </section>
  );
};

/* ---------------- Image upload tile ---------------- */
const Upload = ({ label, hint, value, accept, onFile, onRemove, busy, square = true, id }) => (
  <div className="pp-upload">
    <div className={`pp-upload-preview ${square ? 'square' : 'wide'}`}>
      {value ? <img src={value} alt={label} /> : <span className="md-muted">No file yet</span>}
    </div>
    <div className="pp-upload-body">
      <span className="md-label" id={`${id}-label`}>{label}</span>
      {hint && <span className="md-hint">{hint}</span>}
      <div className="pp-upload-actions">
        <label className="md-btn md-btn-outline pp-file-btn">
          {busy ? 'Uploading…' : value ? 'Replace' : 'Upload'}
          <input type="file" accept={accept} aria-labelledby={`${id}-label`} disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) onFile(f); }} />
        </label>
        {value && onRemove && !busy && <button type="button" className="md-link-btn md-danger" onClick={onRemove}>Remove</button>}
      </div>
    </div>
  </div>
);

/* ---------------- Sponsor: brand assets ---------------- */
const SponsorAssets = ({ portal, run }) => {
  const d = portal.details;
  const [busy, setBusy] = useState('');
  const upload = async (what, file) => {
    if (file.size > 10 * 1024 * 1024) return run(async () => { throw new Error('Please choose a file under 10 MB.'); });
    setBusy(what);
    await run(async () => {
      const url = await partnerApi.uploadImage(what === 'logo' ? file : await shrinkPhoto(file));
      const changes = what === 'logo' ? { logoUrl: url } : { photos: [...(d.photos || []), url] };
      return partnerApi.save(changes);
    }, what === 'logo' ? 'Logo saved.' : 'Photo added.');
    setBusy('');
  };
  return (
    <section className="md-card" aria-labelledby="pp-assets-title">
      <h2 id="pp-assets-title" className="playfair md-card-title">Brand assets</h2>
      <Upload id="pp-logo" label="Logo" hint="PNG with a transparent background, or SVG." value={d.logoUrl} accept="image/png,image/svg+xml,image/jpeg,image/webp"
        busy={busy === 'logo'} onFile={(f) => upload('logo', f)} onRemove={() => run(() => partnerApi.save({ logoUrl: '' }), 'Logo removed.')} />
      <span className="md-label">Photos (optional)</span>
      <span className="md-hint">Product shots or your team, for event promos. Up to 8.</span>
      <div className="pp-photos">
        {(d.photos || []).map((url) => (
          <div key={url} className="pp-photo">
            <img src={url} alt="Uploaded brand photo" />
            <button type="button" className="pp-photo-x" aria-label="Remove photo" onClick={() => run(() => partnerApi.save({ photos: d.photos.filter((u) => u !== url) }), 'Photo removed.')}>×</button>
          </div>
        ))}
        {(d.photos || []).length < 8 && (
          <label className="pp-photo pp-photo-add">
            {busy === 'photo' ? 'Uploading…' : '+ Add photo'}
            <input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy === 'photo'} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) upload('photo', f); }} />
          </label>
        )}
      </div>
    </section>
  );
};

/* ---------------- Sponsor: details form ---------------- */
const SponsorDetails = ({ portal, run }) => {
  const d = portal.details;
  const onSite = portal.tier !== 'bronze';
  const initial = {
    blurb: d.blurb || '', brandColors: d.brandColors || '', website: d.website || '', instagram: d.instagram || '',
    facebook: d.facebook || '', tiktok: d.tiktok || '', onsiteName: d.onsiteName || '', onsitePhone: d.onsitePhone || '',
    tableNeeds: d.tableNeeds || '', signageNeeds: d.signageNeeds || '', samplingPlan: d.samplingPlan || '',
  };
  const [form, setForm] = useState(initial);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const count = words(form.blurb);
  const save = (e) => {
    e.preventDefault();
    run(() => partnerApi.save(form), 'Your details are saved.');
  };
  return (
    <section className="md-card" aria-labelledby="pp-details-title">
      <h2 id="pp-details-title" className="playfair md-card-title">Your details</h2>
      <form onSubmit={save} className="md-form">
        <label className="md-label" htmlFor="pp-blurb">About your brand</label>
        <textarea id="pp-blurb" className="md-input" rows={4} maxLength={600} value={form.blurb} onChange={set('blurb')} placeholder="What you do and who you serve, in about 50 words. We use this in event posts and our newsletter." />
        <span className={`md-hint ${count > 80 ? 'pp-over' : ''}`}>{count} words{count > 80 ? ' · please trim to about 50' : ''}</span>

        <div className="md-row">
          <div>
            <label className="md-label" htmlFor="pp-web">Website</label>
            <input id="pp-web" className="md-input" value={form.website} onChange={set('website')} placeholder="https://" inputMode="url" />
          </div>
          <div>
            <label className="md-label" htmlFor="pp-ig">Instagram</label>
            <input id="pp-ig" className="md-input" value={form.instagram} onChange={set('instagram')} placeholder="@yourbrand" />
          </div>
        </div>
        <div className="md-row">
          <div>
            <label className="md-label" htmlFor="pp-fb">Facebook</label>
            <input id="pp-fb" className="md-input" value={form.facebook} onChange={set('facebook')} placeholder="https://facebook.com/…" inputMode="url" />
          </div>
          <div>
            <label className="md-label" htmlFor="pp-tt">TikTok</label>
            <input id="pp-tt" className="md-input" value={form.tiktok} onChange={set('tiktok')} placeholder="@yourbrand" />
          </div>
        </div>
        <label className="md-label" htmlFor="pp-colors">Brand colors (optional)</label>
        <input id="pp-colors" className="md-input" value={form.brandColors} onChange={set('brandColors')} placeholder="e.g. #002147, gold, cream" />

        {onSite && (
          <>
            <h3 className="md-subhead">Event day</h3>
            <div className="md-row">
              <div>
                <label className="md-label" htmlFor="pp-onsite">On-site contact</label>
                <input id="pp-onsite" className="md-input" value={form.onsiteName} onChange={set('onsiteName')} placeholder="Who'll be at your table" />
              </div>
              <div>
                <label className="md-label" htmlFor="pp-onsite-phone">Their cell</label>
                <input id="pp-onsite-phone" type="tel" className="md-input" value={form.onsitePhone} onChange={set('onsitePhone')} autoComplete="tel" />
              </div>
            </div>
            <label className="md-label" htmlFor="pp-table">Table needs</label>
            <textarea id="pp-table" className="md-input" rows={2} maxLength={600} value={form.tableNeeds} onChange={set('tableNeeds')} placeholder="Table size, power outlet, anything you're bringing" />
            <label className="md-label" htmlFor="pp-sign">Signage</label>
            <textarea id="pp-sign" className="md-input" rows={2} maxLength={600} value={form.signageNeeds} onChange={set('signageNeeds')} placeholder="Banner, tabletop sign, sizes" />
            <label className="md-label" htmlFor="pp-sample">{portal.tier === 'gold' ? 'Activation and sampling plan' : 'Sampling plan'}</label>
            <textarea id="pp-sample" className="md-input" rows={3} maxLength={1000} value={form.samplingPlan} onChange={set('samplingPlan')} placeholder="What you'll hand out or do with guests. Our events are alcohol-free." />
          </>
        )}
        <div className="md-actions">
          <button type="submit" className="md-btn md-btn-gold" disabled={!dirty}>Save details</button>
        </div>
      </form>
    </section>
  );
};

/* ---------------- Agreement (one-click e-sign) ---------------- */
const Agreement = ({ portal, run }) => {
  const a = portal.agreement;
  const isPerk = portal.kind === 'perk';
  const [name, setName] = useState('');
  const [agree, setAgree] = useState(false);
  const doc = isPerk ? { href: '/perk-terms', title: 'Member Perk Terms' } : { href: '/sponsor-agreement', title: 'Sponsor Agreement' };
  const outdated = a.signedAt && a.version && a.version !== (isPerk ? PERK_TERMS_VERSION : SPONSOR_AGREEMENT_VERSION);
  return (
    <section className="md-card" aria-labelledby="pp-agree-title">
      <h2 id="pp-agree-title" className="playfair md-card-title">{doc.title}</h2>
      {a.signedAt && !outdated ? (
        <p className="pp-signed">✓ Signed by <strong>{a.name}</strong> on {shortDate(a.signedAt)}. <a href={doc.href} target="_blank" rel="noopener noreferrer">Read it again</a></p>
      ) : (
        <form className="md-form" onSubmit={(e) => { e.preventDefault(); run(() => partnerApi.agree(name), 'Signed. Thank you!'); }}>
          {outdated && <p className="md-note md-note-gold">We updated the {doc.title}. Please read and sign the new version.</p>}
          <p className="md-muted">Please read the <a href={doc.href} target="_blank" rel="noopener noreferrer">{doc.title}</a>, then sign by typing your full name.</p>
          <label className="md-label" htmlFor="pp-sign-name">Full name</label>
          <input id="pp-sign-name" className="md-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          <label className="pp-agree">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>I've read the {doc.title}, I'm authorized to sign for {portal.name}, and I agree.</span>
          </label>
          <div className="md-actions">
            <button type="submit" className="md-btn md-btn-gold" disabled={!agree || name.trim().length < 2}>Sign</button>
          </div>
        </form>
      )}
    </section>
  );
};

/* ---------------- Sponsor: payment ---------------- */
const Payment = ({ portal, run }) => {
  const p = portal.payment;
  if (!(p.amountCents > 0) && !p.paidAt) {
    return (
      <section className="md-card" aria-labelledby="pp-pay-title">
        <h2 id="pp-pay-title" className="playfair md-card-title">Payment</h2>
        <p className="md-muted">We'll add your sponsorship amount here once we confirm the details together.</p>
      </section>
    );
  }
  const signed = Boolean(portal.agreement.signedAt);
  return (
    <section className="md-card" aria-labelledby="pp-pay-title">
      <h2 id="pp-pay-title" className="playfair md-card-title">Payment</h2>
      <div className="pp-amount">{money(p.amountCents)}</div>
      <p className="md-muted pp-amount-sub">{TIER_NAME[portal.tier]} sponsorship · {portal.name}</p>
      {p.paidAt ? (
        <p className="pp-signed">✓ Paid {shortDate(p.paidAt)}.{p.receiptUrl && <> <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer">View receipt</a></>}</p>
      ) : (
        <>
          <p className="md-muted">Due at least 7 days before your event. You'll pay securely with Stripe and get an emailed receipt.</p>
          {!signed && <p className="md-note md-note-gold">Sign the Sponsor Agreement first, then you can pay here.</p>}
          <div className="md-actions">
            <button type="button" className="md-btn md-btn-gold" disabled={!signed}
              onClick={() => run(async () => { const r = await partnerApi.pay(); window.location.href = r.url; })}>
              Pay {money(p.amountCents)}
            </button>
          </div>
        </>
      )}
    </section>
  );
};

/* ---------------- Sponsor: event info ---------------- */
const EventInfo = ({ portal }) => {
  const e = portal.event;
  const c = portal.gfcContact;
  const loc = e?.location || {};
  const address = [loc.address, [loc.city, loc.state].filter(Boolean).join(', '), loc.zip].filter(Boolean).join(' ');
  return (
    <section className="md-card" aria-labelledby="pp-event-title">
      <h2 id="pp-event-title" className="playfair md-card-title">Event day</h2>
      {e?.date ? (
        <dl className="md-facts">
          <div><dt>Event</dt><dd>{e.name}</dd></div>
          <div><dt>Date</dt><dd>{longDate(e.date)}<br />{timeOf(e.date)}</dd></div>
          {e.loadIn && <div><dt>Load-in</dt><dd>{e.loadIn}</dd></div>}
          {(loc.name || address) && (
            <div>
              <dt>Where</dt>
              <dd>
                {loc.name}{address && <><br />{address}</>}
                {address && <><br /><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loc.name || ''} ${address}`)}`} target="_blank" rel="noopener noreferrer">Directions</a></>}
              </dd>
            </div>
          )}
          <div><dt>GFC contact</dt><dd>{c.name}<br /><a href={`tel:${c.phone.replace(/\D/g, '')}`}>{c.phone}</a></dd></div>
        </dl>
      ) : (
        <>
          <p className="md-muted">We'll add your event date, address and load-in time here once it's set.</p>
          {portal.eventsInterested?.length > 0 && <p className="md-hint">You told us you're interested in: {portal.eventsInterested.join(', ')}.</p>}
          <p className="md-muted">Questions? Call or text Vaughn at <a href={`tel:${c.phone.replace(/\D/g, '')}`}>{c.phone}</a>.</p>
        </>
      )}
    </section>
  );
};

/* ---------------- Sponsor: recap ---------------- */
const Recap = ({ portal }) => {
  const r = portal.recap;
  if (!r.recapUrl && !r.recapNote && !r.newsletterUrl) return null;
  return (
    <section className="md-card" aria-labelledby="pp-recap-title">
      <h2 id="pp-recap-title" className="playfair md-card-title">Your recap</h2>
      {r.recapNote && <p className="pp-pre">{r.recapNote}</p>}
      <div className="md-actions">
        {r.recapUrl && <a className="md-btn md-btn-gold" href={r.recapUrl} target="_blank" rel="noopener noreferrer">Photos &amp; recap</a>}
        {r.newsletterUrl && <a className="md-btn md-btn-outline" href={r.newsletterUrl} target="_blank" rel="noopener noreferrer">Your newsletter feature</a>}
      </div>
    </section>
  );
};

/* ---------------- Perk: logo + photo ---------------- */
const PerkAssets = ({ portal, run }) => {
  const k = portal.perk;
  const [busy, setBusy] = useState('');
  const go = async (what, fn, msg) => { setBusy(what); await run(fn, msg); setBusy(''); };
  return (
    <section className="md-card" aria-labelledby="pp-perk-assets-title">
      <h2 id="pp-perk-assets-title" className="playfair md-card-title">Logo &amp; photo</h2>
      <Upload id="pp-perk-logo" label="Logo" hint="Shows next to your perk on our Membership page. PNG, JPG or WebP." value={k.logo} accept="image/png,image/jpeg,image/webp"
        busy={busy === 'logo'} onFile={(f) => go('logo', async () => partnerApi.save({ logo: await shrinkLogo(f) }), 'Logo saved.')}
        onRemove={() => run(() => partnerApi.save({ logo: '' }), 'Logo removed.')} />
      <Upload id="pp-perk-photo" label="Storefront or product photo" hint="Used when we feature your perk to members." value={k.photoUrl} square={false} accept="image/png,image/jpeg,image/webp"
        busy={busy === 'photo'} onFile={(f) => go('photo', async () => partnerApi.save({ photoUrl: await partnerApi.uploadImage(await shrinkPhoto(f)) }), 'Photo saved.')}
        onRemove={() => run(() => partnerApi.save({ photoUrl: '' }), 'Photo removed.')} />
    </section>
  );
};

/* ---------------- Perk: offer details ---------------- */
const REDEEM = {
  'show-membership': 'Members show their GFC membership',
  'promo-code': 'Members use a promo code',
  mention: 'Members mention Grown Folks™ Collective',
  other: 'Other (explain in the fine print)',
};
const PerkDetails = ({ portal, run }) => {
  const k = portal.perk;
  const initial = {
    offer: k.offer || '', offerType: k.offerType || 'percent', where: k.where || 'in-store', address: k.address || '',
    website: k.website || '', redeem: k.redeem || 'show-membership', promoCode: k.promoCode || '', finePrint: k.finePrint || '',
    endDate: k.endDate ? String(k.endDate).slice(0, 10) : '',
  };
  const [form, setForm] = useState(initial);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const confirmed = Boolean(k.confirmedAt);
  const submit = (e) => {
    e.preventDefault();
    run(() => partnerApi.save({ ...form, ...(confirmed ? {} : { confirm: true }) }), confirmed ? 'Your perk is updated.' : 'Thanks! Your perk details are confirmed.');
  };
  return (
    <section className="md-card" aria-labelledby="pp-perk-title">
      <h2 id="pp-perk-title" className="playfair md-card-title">Your perk</h2>
      {!confirmed && <p className="md-note md-note-gold">Please check that this is exactly what members should see, then confirm.</p>}
      <form onSubmit={submit} className="md-form">
        <label className="md-label" htmlFor="pp-offer">The discount</label>
        <input id="pp-offer" className="md-input" maxLength={160} value={form.offer} onChange={set('offer')} required placeholder="e.g. 15% off your order" />
        <div className="md-row">
          <div>
            <label className="md-label" htmlFor="pp-where">Where</label>
            <select id="pp-where" className="md-input" value={form.where} onChange={set('where')}>
              <option value="in-store">In store</option>
              <option value="online">Online</option>
              <option value="both">In store &amp; online</option>
            </select>
          </div>
          <div>
            <label className="md-label" htmlFor="pp-end">Ends (optional)</label>
            <input id="pp-end" type="date" className="md-input" value={form.endDate} onChange={set('endDate')} />
          </div>
        </div>
        {form.where !== 'online' && (
          <>
            <label className="md-label" htmlFor="pp-address">Address</label>
            <input id="pp-address" className="md-input" maxLength={200} value={form.address} onChange={set('address')} autoComplete="street-address" />
          </>
        )}
        <label className="md-label" htmlFor="pp-perk-web">Website or Instagram</label>
        <input id="pp-perk-web" className="md-input" maxLength={200} value={form.website} onChange={set('website')} />
        <label className="md-label" htmlFor="pp-redeem">How members redeem it</label>
        <select id="pp-redeem" className="md-input" value={form.redeem} onChange={set('redeem')}>
          {Object.entries(REDEEM).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        {form.redeem === 'promo-code' && (
          <>
            <label className="md-label" htmlFor="pp-code">Promo code</label>
            <input id="pp-code" className="md-input" maxLength={40} value={form.promoCode} onChange={set('promoCode')} required />
          </>
        )}
        <label className="md-label" htmlFor="pp-fine">Fine print</label>
        <textarea id="pp-fine" className="md-input" rows={3} maxLength={1000} value={form.finePrint} onChange={set('finePrint')} placeholder="Minimum purchase, days or times, exclusions…" />
        <div className="md-actions">
          <button type="submit" className="md-btn md-btn-gold" disabled={confirmed && !dirty}>{confirmed ? 'Save changes' : 'Confirm my perk'}</button>
        </div>
        {confirmed && <span className="md-hint">Changes show to members right away. Please give 14 days' notice before making the discount smaller.</span>}
      </form>
    </section>
  );
};

/* ---------------- Perk: pause / resume / end ---------------- */
const PerkManage = ({ portal, run }) => {
  const [confirmEnd, setConfirmEnd] = useState(false);
  const s = portal.status;
  return (
    <section className="md-card" aria-labelledby="pp-manage-title">
      <h2 id="pp-manage-title" className="playfair md-card-title">Manage your perk</h2>
      {s === 'ended' ? (
        <p className="md-muted">This perk has ended. Want to bring it back? Email <a href={`mailto:${portal.gfcContact.email}`}>{portal.gfcContact.email}</a>.</p>
      ) : (
        <>
          <p className="md-muted">{s === 'paused' ? 'Your perk is paused and hidden from members.' : 'Your perk is showing to GFC members.'}</p>
          <div className="md-actions">
            {s === 'approved' && <button type="button" className="md-btn md-btn-outline" onClick={() => run(() => partnerApi.perkStatus('pause'), 'Your perk is paused.')}>Pause</button>}
            {s === 'paused' && <button type="button" className="md-btn md-btn-gold" onClick={() => run(() => partnerApi.perkStatus('resume'), 'Your perk is live again.')}>Resume</button>}
            {!confirmEnd ? (
              <button type="button" className="md-link-btn md-danger" onClick={() => setConfirmEnd(true)}>End my perk</button>
            ) : (
              <>
                <span className="md-muted">End it for good?</span>
                <button type="button" className="md-btn md-btn-danger" onClick={() => run(() => partnerApi.perkStatus('end'), 'Your perk has ended. Thank you for taking care of our members!')}>Yes, end it</button>
                <button type="button" className="md-link-btn" onClick={() => setConfirmEnd(false)}>Keep it</button>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
};

/* ---------------- The portal ---------------- */
const PartnerPortal = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [needsSignIn, setNeedsSignIn] = useState(!partnerToken());
  const [signInNote, setSignInNote] = useState('');
  const [notice, setNotice] = useState(null);
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    try {
      setData(await partnerApi.me());
    } catch (err) {
      if (err instanceof SessionExpired) {
        signOutPartner();
        setSignInNote(err.message);
        setNeedsSignIn(true);
      } else setLoadError(err.message);
    }
  }, []);

  useEffect(() => {
    if (needsSignIn) return;
    const paid = params.get('paid');
    if (paid) {
      setParams({}, { replace: true });
      partnerApi.confirmPayment(paid)
        .then((r) => { setData((d) => ({ ...(d || {}), ...r })); setNotice({ kind: 'ok', text: 'Payment received. Thank you!' }); })
        .catch(() => setNotice({ kind: 'ok', text: "Thanks! We're confirming your payment. It'll show here in a minute." }))
        .finally(load);
    } else load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsSignIn]);

  // Runs a save; shows a message; refreshes the portal from the reply
  const run = useCallback(async (fn, okText) => {
    setNotice(null);
    try {
      const r = await fn();
      if (r?.portal) setData((d) => ({ ...d, portal: r.portal }));
      if (okText) setNotice({ kind: 'ok', text: okText });
    } catch (err) {
      if (err instanceof SessionExpired) {
        signOutPartner();
        setSignInNote(err.message);
        setNeedsSignIn(true);
        return;
      }
      setNotice({ kind: 'error', text: err.message });
    }
  }, []);

  if (needsSignIn) return <SignIn note={signInNote} />;
  if (!data) {
    return (
      <div className="md-gate">
        <div className="md-gate-card" role={loadError ? 'alert' : 'status'}>
          {loadError ? (<><h1 className="playfair">Couldn't load your portal</h1><p>{loadError}</p><button type="button" className="md-btn md-btn-gold" onClick={load}>Try again</button></>) : (<><div className="md-spinner" aria-hidden="true" /><h1 className="playfair">Loading your portal…</h1></>)}
        </div>
      </div>
    );
  }

  const portal = data.portal;
  const isPerk = portal.kind === 'perk';
  return (
    <div className="md-page">
      <Helmet>
        <title>Partner Portal | Grown Folks™ Collective</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <header className="md-hero">
        <div className="md-hero-inner">
          <span className="md-eyebrow">{isPerk ? 'Member Perk Partner' : `${TIER_NAME[portal.tier]} Sponsor`}</span>
          <h1 className="playfair md-hero-title">{portal.name}</h1>
          <p className="md-hero-sub">Welcome, {String(portal.contactName || '').split(' ')[0]}. Everything for your partnership lives here.</p>
        </div>
      </header>

      <div className="md-wrap">
        {notice && (
          <div className={`md-notice md-notice-${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
            <span>{notice.text}</span>
            <button type="button" className="md-notice-x" aria-label="Dismiss" onClick={() => setNotice(null)}>×</button>
          </div>
        )}

        <section className="md-card pp-status" aria-label="Status">
          <Steps steps={portal.steps} />
        </section>

        <div className="md-grid pp-grid">
          <div className="md-col">
            <Checklist portal={portal} />
            {isPerk ? <PerkManage portal={portal} run={run} /> : <EventInfo portal={portal} />}
            <Agreement key={`${portal.kind}-${portal.id}-a`} portal={portal} run={run} />
            {!isPerk && <Payment portal={portal} run={run} />}
            {!isPerk && <Recap portal={portal} />}
          </div>
          <div className="md-col">
            {isPerk ? (
              <>
                <PerkAssets portal={portal} run={run} />
                <PerkDetails key={`${portal.id}-${portal.perk.confirmedAt}`} portal={portal} run={run} />
              </>
            ) : (
              <>
                <SponsorAssets portal={portal} run={run} />
                <SponsorDetails key={portal.id} portal={portal} run={run} />
              </>
            )}
          </div>
        </div>

        <footer className="md-foot">
          {data.others?.length > 0 && (
            <div className="pp-switch">
              <span className="md-muted">Also with us under this email:</span>
              {data.others.map((o) => (
                <button key={`${o.kind}-${o.id}`} type="button" className="md-btn md-btn-outline"
                  onClick={() => run(async () => { await partnerApi.switchTo(o.kind, o.id); setData(null); await load(); })}>
                  {o.name} ({o.kind === 'perk' ? 'Member Perk' : 'Sponsor'})
                </button>
              ))}
            </div>
          )}
          <p className="md-muted">Questions? Call or text <a href="tel:4702567729">470-256-7729</a> or email <a href={`mailto:${portal.gfcContact.email}`}>{portal.gfcContact.email}</a>.</p>
          <button type="button" className="md-link-btn" onClick={() => { signOutPartner(); navigate('/partner', { replace: true }); setData(null); setSignInNote(''); setNeedsSignIn(true); }}>Sign out</button>
        </footer>
      </div>
    </div>
  );
};

export default PartnerPortal;
