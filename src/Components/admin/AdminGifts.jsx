import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { shopAdmin, fmtDate, downloadCSV } from '../../Services/adminApi';

// Gifts & merch: Holiday Passes, gift cards and merch pre-orders
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

const STATUSES = [['preorder', 'Pre-order'], ['ordered', 'Ordered in Printful'], ['shipped', 'Shipped'], ['cancelled', 'Cancelled']];

const MerchView = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(() => shopAdmin('/merch-orders').then(setData).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);

  const orders = data?.orders || [];
  const live = orders.filter((o) => o.status !== 'cancelled');
  const byItem = useMemo(() => {
    const m = new Map();
    live.forEach((o) => o.items.forEach((i) => {
      const k = [i.name, i.size, i.color].filter(Boolean).join(' · ');
      m.set(k, (m.get(k) || 0) + i.quantity);
    }));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [live]);

  const setStatus = async (o, status) => {
    try { await shopAdmin(`/merch-orders/${o._id}`, { method: 'PATCH', body: { status } }); load(); } catch (e) { setError(e.message); }
  };

  // One row per item, ready to place in Printful
  const exportPrintful = () => downloadCSV(live.flatMap((o) => o.items.map((i) => ({
    Order: o.orderNumber, Name: o.shipping.name || o.buyerName, Email: o.buyerEmail, Phone: o.buyerPhone,
    Address1: o.shipping.line1, Address2: o.shipping.line2, City: o.shipping.city, State: o.shipping.state, Zip: o.shipping.postalCode, Country: o.shipping.country,
    Item: i.name, 'Printful product': i.printful, Size: i.size, Color: i.color, Qty: i.quantity, Status: o.status,
  }))), 'gfc-merch-preorders.csv');

  if (error) return <p className="ga-note err">{error}</p>;
  if (!data) return <div className="ga-loading">Loading pre-orders…</div>;
  const p = data.merch?.presale;
  return (
    <>
      <div className="ga-stats">
        <div className="ga-stat"><div className="ga-stat-num">{live.length}</div><div className="ga-stat-label">Pre-orders</div></div>
        <div className="ga-stat"><div className="ga-stat-num">{live.reduce((s, o) => s + o.items.reduce((t, i) => t + i.quantity, 0), 0)}</div><div className="ga-stat-label">Items to make</div></div>
        <div className="ga-stat"><div className="ga-stat-num">{money(live.reduce((s, o) => s + o.totalPaidCents, 0))}</div><div className="ga-stat-label">Collected</div></div>
        <div className="ga-stat"><div className={`ga-stat-num ${data.merch?.open ? '' : 'zero'}`}>{data.merch?.open ? 'Open' : 'Closed'}</div><div className="ga-stat-label">{p ? `Pre-sale ${fmtDate(p.start)} to ${fmtDate(p.end)}` : 'Pre-sale'}</div></div>
      </div>
      {!data.merch?.items?.length && <p className="ga-note info">No merch is listed yet. Add your Printful items to capstonebackend/utilities/merchCatalog.js and push, and the pre-sale opens on its start date.</p>}

      {byItem.length > 0 && (
        <section className="ga-card">
          <p className="ga-kicker">What to order in Printful</p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>{byItem.map(([k, n]) => <li key={k}><strong>{n}</strong> × {k}</li>)}</ul>
        </section>
      )}

      <section className="ga-card" style={{ marginTop: 18 }}>
        <div className="ga-card-head">
          <h2 className="ga-card-title">Pre-orders</h2>
          <button type="button" className="ga-btn" onClick={exportPrintful} disabled={!live.length}>↓ CSV for Printful</button>
        </div>
        {orders.length === 0 ? <div className="ga-empty"><div className="ga-empty-big">🛍️</div>No pre-orders yet.</div> : (
          <div className="ga-table-wrap">
            <table className="ga-table">
              <thead><tr><th>Date</th><th>Order</th><th>Buyer</th><th>Items</th><th>Ship to</th><th className="ga-num">Paid</th><th>Status</th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className={o.status === 'cancelled' ? 'ga-off' : ''}>
                    <td className="ga-small">{fmtDate(o.createdAt)}</td>
                    <td style={{ fontFamily: 'monospace' }}>{o.orderNumber}</td>
                    <td>{o.buyerName}<div className="ga-small ga-muted">{o.buyerEmail}</div></td>
                    <td className="ga-small">{o.items.map((i) => `${i.name}${i.size ? ` · ${i.size}` : ''} × ${i.quantity}`).join(', ')}</td>
                    <td className="ga-small">{o.shipping.city}, {o.shipping.state}</td>
                    <td className="ga-num">{money(o.totalPaidCents)}</td>
                    <td>
                      <select className="ga-select" value={o.status} onChange={(e) => setStatus(o, e.target.value)} aria-label={`Status for ${o.orderNumber}`}>
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

const AdminGifts = () => {
  const [view, setView] = useState('cards');
  return (
    <>
      <div className="ga-row" style={{ marginBottom: 16 }}>
        <div className="ga-seg">
          <button type="button" className={view === 'cards' ? 'on' : ''} onClick={() => setView('cards')}>Passes &amp; gift cards</button>
          <button type="button" className={view === 'merch' ? 'on' : ''} onClick={() => setView('merch')}>Merch pre-orders</button>
        </div>
        <span className="ga-spacer" />
        <a className="ga-btn" href="/gift" target="_blank" rel="noreferrer">View gift page ↗</a>
      </div>
      {view === 'cards' ? <CardsView /> : <MerchView />}
    </>
  );
};

export default AdminGifts;
