import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { shopAdmin, fmtDate, downloadCSV } from '../../Services/adminApi';

// Gifts & merch: Holiday Passes, gift cards and Printful merch orders
const money = (c = 0) => `$${(Number(c) / 100).toFixed(Number(c) % 100 ? 2 : 0)}`;
const KIND = { pass: ['Pass', 'navy'], gift: ['Gift card', 'gold'], bonus: ['Bonus', 'blue'] };

const left = (c) => (c.kind === 'pass' ? `${c.usesLeft} of ${c.initialUses} nights` : `${money(c.balanceCents)} of ${money(c.initialCents)}`);

const delivery = (c) => {
  if (!c.recipientEmail) return '—';
  if (!c.isGift) return 'Sent to buyer';
  if (c.sentAt) return `Sent ${fmtDate(c.sentAt)}`;
  return `Scheduled ${fmtDate(c.sendAt)}`;
};

const CardsView = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [q, setQ] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ kind: 'gift', amount: 25, uses: 1, recipientName: '', recipientEmail: '', note: '', sendNow: true });

  const load = useCallback(() => shopAdmin('/cards').then(setData).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);

  const cards = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data?.cards || []).filter((c) =>
      !s || [c.code, c.purchaserName, c.purchaserEmail, c.recipientName, c.recipientEmail].some((v) => String(v || '').toLowerCase().includes(s))
    );
  }, [data, q]);

  const act = async (fn, ok) => {
    setError(''); setNote('');
    try { await fn(); setNote(ok); load(); } catch (e) { setError(e.message); }
  };

  const create = (e) => {
    e.preventDefault();
    act(async () => {
      const card = await shopAdmin('/cards', { method: 'POST', body: form });
      setShowNew(false);
      setNote(`Created ${card.code}.`);
    }, 'Card created.');
  };

  const t = data?.totals;
  return (
    <>
      {error && <p className="ga-note err">{error}</p>}
      {note && <p className="ga-note ok">{note}</p>}
      {t && (
        <div className="ga-stats">
          <div className="ga-stat"><div className="ga-stat-num">{money(t.soldCents)}</div><div className="ga-stat-label">Sold (passes + gift cards)</div></div>
          <div className="ga-stat"><div className="ga-stat-num">{t.passes}</div><div className="ga-stat-label">Holiday Passes</div></div>
          <div className="ga-stat"><div className="ga-stat-num">{t.giftCards}</div><div className="ga-stat-label">Gift cards</div></div>
          <div className="ga-stat"><div className="ga-stat-num">{t.ticketsLeftOnPasses}</div><div className="ga-stat-label">Nights still unused on passes</div></div>
          <div className="ga-stat"><div className="ga-stat-num">{money(t.outstandingCents)}</div><div className="ga-stat-label">Gift card balance not spent yet</div></div>
        </div>
      )}

      <section className="ga-card">
        <div className="ga-card-head">
          <input className="ga-input" style={{ maxWidth: 300 }} placeholder="Search code, name or email" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="ga-row">
            <button type="button" className="ga-btn" onClick={() => downloadCSV(cards.map((c) => ({
              Created: fmtDate(c.createdAt, { month: 'short', day: 'numeric', year: 'numeric' }), Code: c.code, Type: c.label, Buyer: c.purchaserName, 'Buyer email': c.purchaserEmail,
              For: c.recipientName, 'For email': c.recipientEmail, Left: left(c), Paid: money(c.paidCents), Status: c.status, Sale: c.saleKey,
            })), 'gfc-gift-cards.csv')} disabled={!cards.length}>↓ CSV</button>
            <button type="button" className="ga-btn ga-btn-navy" onClick={() => setShowNew((v) => !v)}>{showNew ? 'Close' : '＋ Comp card'}</button>
          </div>
        </div>

        {showNew && (
          <form className="ga-form-grid" style={{ marginBottom: 18 }} onSubmit={create}>
            <label className="ga-field">Type
              <select className="ga-select" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                <option value="gift">Gift card ($)</option>
                <option value="pass">Holiday Pass (nights)</option>
              </select>
            </label>
            {form.kind === 'gift' ? (
              <label className="ga-field">Amount ($)<input className="ga-input" type="number" min="1" max="500" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label>
            ) : (
              <label className="ga-field">Nights<input className="ga-input" type="number" min="1" max="10" value={form.uses} onChange={(e) => setForm({ ...form, uses: e.target.value })} /></label>
            )}
            <label className="ga-field">Name<input className="ga-input" value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} /></label>
            <label className="ga-field">Email <small>(optional)</small><input className="ga-input" type="email" value={form.recipientEmail} onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })} /></label>
            <label className="ga-field ga-span-2">Why <small>(for your records, e.g. "Karaoke Bingo prize")</small><input className="ga-input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
            <label className="ga-check ga-span-2"><input type="checkbox" checked={form.sendNow} onChange={(e) => setForm({ ...form, sendNow: e.target.checked })} /> Email the code to them now</label>
            <div className="ga-span-2"><button className="ga-btn ga-btn-navy" type="submit">Create card</button></div>
          </form>
        )}

        {!data ? <div className="ga-loading">Loading cards…</div> : cards.length === 0 ? (
          <div className="ga-empty"><div className="ga-empty-big">🎁</div>No passes or gift cards yet. They'll show up here as soon as someone buys one.</div>
        ) : (
          <div className="ga-table-wrap">
            <table className="ga-table">
              <thead><tr><th>Date</th><th>Code</th><th>Type</th><th>Bought by</th><th>For</th><th>Left</th><th className="ga-num">Paid</th><th /></tr></thead>
              <tbody>
                {cards.map((c) => (
                  <tr key={c._id} className={c.status === 'void' ? 'ga-off' : ''}>
                    <td className="ga-small" style={{ whiteSpace: 'nowrap' }}>{fmtDate(c.createdAt)}</td>
                    <td style={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{c.code}</td>
                    <td><span className={`ga-pill ${KIND[c.kind][1]}`}>{KIND[c.kind][0]}</span> <span className="ga-small">{c.label}</span>{c.saleKey && <div className="ga-small ga-muted">{c.saleKey === 'blackfriday' ? 'Black Friday' : 'Cyber Monday'}</div>}</td>
                    <td>{c.createdBy === 'admin' ? <span className="ga-muted ga-small">Comp</span> : <>{c.purchaserName}<div className="ga-small ga-muted">{c.purchaserEmail}</div></>}</td>
                    <td>{c.recipientName || '—'}<div className="ga-small ga-muted">{delivery(c)}</div></td>
                    <td className="ga-small" style={{ whiteSpace: 'nowrap' }}>{left(c)}</td>
                    <td className="ga-num">{money(c.paidCents)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {c.recipientEmail && <button type="button" className="ga-btn ga-btn-sm" onClick={() => act(() => shopAdmin(`/cards/${c._id}/resend`, { method: 'POST' }), `Sent ${c.code} to ${c.recipientEmail}.`)}>Resend</button>}{' '}
                      <button type="button" className="ga-btn ga-btn-sm" onClick={() => act(() => shopAdmin(`/cards/${c._id}`, { method: 'PATCH', body: { status: c.status === 'void' ? 'active' : 'void' } }), c.status === 'void' ? 'Card turned back on.' : 'Card voided.')}>{c.status === 'void' ? 'Restore' : 'Void'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
};

const STATUSES = [
  ['paid', 'Paid · not in Printful'],
  ['draft', 'Draft · confirm in Printful'],
  ['ordered', 'In production'],
  ['shipped', 'Shipped'],
  ['cancelled', 'Cancelled'],
  ['preorder', 'Pre-order (old)'],
];
const STATUS_TONE = { paid: 'err', draft: 'warn', ordered: 'info', shipped: 'ok', cancelled: '', preorder: '' };

const PrintfulPanel = ({ merch, onDone }) => {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const connect = async () => {
    setBusy(true);
    setMsg('');
    try {
      const r = await shopAdmin('/printful/connect', { method: 'POST' });
      setMsg(`Connected to ${r.store?.name || 'your Printful store'}. ${r.products} products are live on /shop, and shipping updates are on.`);
      onDone();
    } catch (e) {
      setMsg(e.message);
    }
    setBusy(false);
  };
  return (
    <section className="ga-card" style={{ marginBottom: 18 }}>
      <div className="ga-card-head">
        <div>
          <p className="ga-kicker">Printful</p>
          <h2 className="ga-card-title">
            {merch?.connected ? `${merch.products} products on /shop` : 'Not connected yet'}
          </h2>
        </div>
        <button type="button" className="ga-btn" onClick={connect} disabled={busy || !merch?.connected}>
          {busy ? 'Connecting…' : 'Connect shipping updates'}
        </button>
      </div>
      {!merch?.connected && <p className="ga-note info">Add PRINTFUL_API_KEY in Railway (Variables), let it redeploy, then come back and tap Connect shipping updates.</p>}
      {merch?.error && <p className="ga-note err">Printful: {merch.error}</p>}
      {msg && <p className="ga-note info">{msg}</p>}
      <p className="ga-small ga-muted" style={{ margin: 0 }}>
        Paid orders land in Printful as drafts. Open Printful → Orders, check the draft, and click Confirm to send it to production.
        Buyers get their tracking email automatically when it ships.
      </p>
    </section>
  );
};

const MerchView = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(() => shopAdmin('/merch-orders').then(setData).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);

  const orders = data?.orders || [];
  const live = orders.filter((o) => o.status !== 'cancelled');
  const toConfirm = orders.filter((o) => o.status === 'draft').length;
  const stuck = orders.filter((o) => o.status === 'paid').length;

  const setStatus = async (o, status) => {
    try { await shopAdmin(`/merch-orders/${o._id}`, { method: 'PATCH', body: { status } }); load(); } catch (e) { setError(e.message); }
  };
  const resend = async (o) => {
    try { await shopAdmin(`/merch-orders/${o._id}/printful`, { method: 'POST' }); load(); } catch (e) { setError(e.message); }
  };

  const exportCSV = () => downloadCSV(live.flatMap((o) => o.items.map((i) => ({
    Order: o.orderNumber, Printful: o.printfulOrderId, Name: o.shipping.name || o.buyerName, Email: o.buyerEmail, Phone: o.buyerPhone,
    Address1: o.shipping.line1, Address2: o.shipping.line2, City: o.shipping.city, State: o.shipping.state, Zip: o.shipping.postalCode, Country: o.shipping.country,
    Item: i.name, Size: i.size, Color: i.color, Qty: i.quantity, Status: o.status, Tracking: o.tracking?.number || '',
  }))), 'gfc-merch-orders.csv');

  if (error) return <p className="ga-note err">{error}</p>;
  if (!data) return <div className="ga-loading">Loading orders…</div>;
  return (
    <>
      <div className="ga-stats">
        <div className="ga-stat"><div className="ga-stat-num">{live.length}</div><div className="ga-stat-label">Orders</div></div>
        <div className="ga-stat"><div className={`ga-stat-num ${toConfirm ? '' : 'zero'}`}>{toConfirm}</div><div className="ga-stat-label">To confirm in Printful</div></div>
        <div className="ga-stat"><div className={`ga-stat-num ${stuck ? '' : 'zero'}`}>{stuck}</div><div className="ga-stat-label">Didn't reach Printful</div></div>
        <div className="ga-stat"><div className="ga-stat-num">{money(live.reduce((s, o) => s + o.totalPaidCents, 0))}</div><div className="ga-stat-label">Collected</div></div>
      </div>

      <PrintfulPanel merch={data.merch} onDone={load} />

      <section className="ga-card">
        <div className="ga-card-head">
          <h2 className="ga-card-title">Merch orders</h2>
          <button type="button" className="ga-btn" onClick={exportCSV} disabled={!live.length}>↓ CSV</button>
        </div>
        {orders.length === 0 ? <div className="ga-empty"><div className="ga-empty-big">🛍️</div>No merch orders yet.</div> : (
          <div className="ga-table-wrap">
            <table className="ga-table">
              <thead><tr><th>Date</th><th>Order</th><th>Buyer</th><th>Items</th><th>Ship to</th><th className="ga-num">Paid</th><th>Printful</th><th>Status</th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className={o.status === 'cancelled' ? 'ga-off' : ''}>
                    <td className="ga-small">{fmtDate(o.createdAt)}</td>
                    <td style={{ fontFamily: 'monospace' }}>{o.orderNumber}</td>
                    <td>{o.buyerName}<div className="ga-small ga-muted">{o.buyerEmail}</div></td>
                    <td className="ga-small">{o.items.map((i) => [i.name, i.color, i.size].filter(Boolean).join(' · ') + ` × ${i.quantity}`).join(', ')}</td>
                    <td className="ga-small">{o.shipping.city}, {o.shipping.state}</td>
                    <td className="ga-num">{money(o.totalPaidCents)}</td>
                    <td className="ga-small">
                      {o.printfulOrderId ? <>#{o.printfulOrderId}</> : (
                        <button type="button" className="ga-btn ga-btn-sm" onClick={() => resend(o)} title={o.printfulError || ''}>Send to Printful</button>
                      )}
                      {o.tracking?.url && <div><a href={o.tracking.url} target="_blank" rel="noreferrer">Track ↗</a></div>}
                    </td>
                    <td>
                      <select className={`ga-select ga-tone-${STATUS_TONE[o.status] || 'none'}`} value={o.status} onChange={(e) => setStatus(o, e.target.value)} aria-label={`Status for ${o.orderNumber}`}>
                        {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
};

// Karaoke Bingo downloads, with a dispute report for each order
const BingoView = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => { shopAdmin('/digital-orders').then(setData).catch((e) => setError(e.message)); }, []);

  const openReport = async (o) => {
    setCopied(false);
    try { setReport(await shopAdmin(`/digital-orders/${o.orderNumber}/evidence`)); } catch (e) { setError(e.message); }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(report.text); setCopied(true); } catch { setCopied(false); }
  };

  if (error) return <p className="ga-note err">{error}</p>;
  if (!data) return <div className="ga-loading">Loading orders…</div>;
  const orders = data.orders || [];
  return (
    <>
      <div className="ga-stats">
        <div className="ga-stat"><div className="ga-stat-num">{orders.length}</div><div className="ga-stat-label">Orders</div></div>
        <div className="ga-stat"><div className="ga-stat-num">{money(data.totalCents || 0)}</div><div className="ga-stat-label">Collected</div></div>
        <div className="ga-stat"><div className="ga-stat-num">{orders.reduce((s, o) => s + (o.downloads || 0), 0)}</div><div className="ga-stat-label">Downloads</div></div>
      </div>

      {report && (
        <section className="ga-card">
          <div className="ga-card-head">
            <h2 className="ga-card-title">Dispute report: {report.orderNumber}</h2>
            <button type="button" className="ga-btn" onClick={copy}>{copied ? 'Copied ✓' : 'Copy'}</button>
            <button type="button" className="ga-btn" onClick={() => setReport(null)}>Close</button>
          </div>
          <p className="ga-small ga-muted">If this buyer disputes the charge, paste this into the Stripe dispute form under "Additional evidence".</p>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, background: '#F7F4EC', padding: 14, borderRadius: 8, margin: 0 }}>{report.text}</pre>
        </section>
      )}

      <section className="ga-card">
        <div className="ga-card-head"><h2 className="ga-card-title">Karaoke Bingo orders</h2></div>
        {orders.length === 0 ? <div className="ga-empty"><div className="ga-empty-big">🎤</div>No bingo orders yet.</div> : (
          <div className="ga-table-wrap">
            <table className="ga-table">
              <thead><tr><th>Date</th><th>Order</th><th>Buyer</th><th>Items</th><th className="ga-num">Paid</th><th className="ga-num">Downloads</th><th>Agreed no-refund</th><th></th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td className="ga-small">{fmtDate(o.createdAt)}</td>
                    <td style={{ fontFamily: 'monospace' }}>{o.orderNumber}</td>
                    <td>{o.buyerName}<div className="ga-small ga-muted">{o.buyerEmail}</div></td>
                    <td className="ga-small">{o.items.map((i) => i.name.replace('Karaoke Bingo: ', '')).join(', ')}</td>
                    <td className="ga-num">{money(o.totalPaidCents)}</td>
                    <td className="ga-num">{o.downloads || 0}</td>
                    <td className="ga-small">{o.noRefundAgreedAt ? `✓ ${fmtDate(o.noRefundAgreedAt)}` : '—'}</td>
                    <td><button type="button" className="ga-btn ga-btn-sm" onClick={() => openReport(o)}>Dispute report</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
};

const AdminGifts = () => {
  const [view, setView] = useState('cards');
  return (
    <>
      <div className="ga-row" style={{ marginBottom: 16 }}>
        <div className="ga-seg">
          <button type="button" className={view === 'cards' ? 'on' : ''} onClick={() => setView('cards')}>Passes &amp; gift cards</button>
          <button type="button" className={view === 'merch' ? 'on' : ''} onClick={() => setView('merch')}>Merch orders</button>
          <button type="button" className={view === 'bingo' ? 'on' : ''} onClick={() => setView('bingo')}>Karaoke Bingo</button>
        </div>
        <span className="ga-spacer" />
        <a className="ga-btn" href="/gift" target="_blank" rel="noreferrer">View gift page ↗</a>
      </div>
      {view === 'cards' ? <CardsView /> : view === 'merch' ? <MerchView /> : <BingoView />}
    </>
  );
};

export default AdminGifts;
