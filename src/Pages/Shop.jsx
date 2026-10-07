import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getCatalog, startMerchCheckout, money, longDate } from '../Services/shopApi';
import { currentSource } from '../Services/ticketSources';
import '../Styles/Shop.css';

// /shop — Grown Folks™ merch pre-sale (made to order through Printful)
const ProductCard = ({ item, onAdd }) => {
  const [size, setSize] = useState(item.sizes[0] ? '' : '');
  const [color, setColor] = useState(item.colors[0] || '');
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const add = () => {
    if (item.sizes.length && !size) return setNote('Pick a size.');
    onAdd({ id: item.id, name: item.name, size, color, quantity: qty, priceCents: item.priceCents });
    setNote('Added ✓');
    setTimeout(() => setNote(''), 1800);
  };
  return (
    <article className="shop-product">
      <div className="shop-product-img">
        {item.image ? <img src={item.image} alt={item.name} loading="lazy" /> : <span aria-hidden="true">GFC</span>}
      </div>
      <div className="shop-product-body">
        <h3 className="playfair">{item.name}</h3>
        {item.description && <p className="shop-muted">{item.description}</p>}
        <p className="shop-tile-price">
          {money(item.priceCents)}
          {item.regularCents > item.priceCents && <s>{money(item.regularCents)}</s>}
        </p>
        <div className="shop-product-opts">
          {item.sizes.length > 0 && (
            <label>Size
              <select value={size} onChange={(e) => { setSize(e.target.value); setNote(''); }}>
                <option value="">Choose</option>
                {item.sizes.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
          )}
          {item.colors.length > 0 && (
            <label>Color
              <select value={color} onChange={(e) => setColor(e.target.value)}>
                {item.colors.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
          )}
          <label>Qty
            <select value={qty} onChange={(e) => setQty(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
        </div>
        <button type="button" className="shop-btn shop-btn-navy" onClick={add}>Add to pre-order</button>
        {note && <span className="shop-note" aria-live="polite">{note}</span>}
      </div>
    </article>
  );
};

const Shop = () => {
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState('');
  const [bag, setBag] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getCatalog().then(setCatalog).catch((e) => setError(e.message));
  }, []);

  const merch = catalog?.merch;
  const addToBag = (line) =>
    setBag((b) => {
      const i = b.findIndex((x) => x.id === line.id && x.size === line.size && x.color === line.color);
      if (i < 0) return [...b, line];
      const next = [...b];
      next[i] = { ...next[i], quantity: Math.min(10, next[i].quantity + line.quantity) };
      return next;
    });

  const subtotal = useMemo(() => bag.reduce((s, l) => s + l.priceCents * l.quantity, 0), [bag]);
  const shipping = merch && subtotal >= merch.presale.freeShippingOverCents ? 0 : merch?.presale.shippingCents || 0;

  const checkout = async () => {
    setBusy(true);
    setError('');
    try {
      const { url } = await startMerchCheckout({
        items: bag.map(({ id, size, color, quantity }) => ({ id, size, color, quantity })),
        source: currentSource(),
      });
      window.location.href = url;
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="shop-page">
      <Helmet>
        <title>Merch Pre-Sale | Grown Folks™ Collective</title>
        <meta name="description" content="Grown Folks™ Collective merch. Pre-order at the pre-sale price; every piece is made to order." />
      </Helmet>

      <header className="shop-hero">
        <p className="shop-kicker">Grown Folks™ merch</p>
        <h1 className="playfair">Wear the room.</h1>
        <p className="shop-lead">
          {merch?.open
            ? `Pre-sale is open until ${longDate(merch.presale.end)}. Every piece is made to order after the pre-sale closes. ${merch.presale.shipBy}.`
            : 'Tees and more are on the way. Pre-orders open soon at a pre-sale price.'}
        </p>
      </header>

      <main className="shop-main">
        {error && <p className="shop-error" role="alert">{error}</p>}
        {!catalog && !error && <p className="shop-muted">Loading…</p>}

        {merch && !merch.open && (
          <section className="shop-card shop-center">
            <h2 className="playfair shop-h2">The drop is coming</h2>
            <p className="shop-muted">
              Want first dibs? Join our email list at the bottom of this page and you'll hear the moment pre-orders open.
              In the meantime, a Holiday Pass makes a great gift.
            </p>
            <Link to="/gift" className="shop-btn shop-btn-gold">Gift a night out</Link>
          </section>
        )}

        {merch?.open && (
          <>
            <div className="shop-products">
              {merch.items.map((item) => <ProductCard key={item.id} item={item} onAdd={addToBag} />)}
            </div>
            <p className="shop-fine shop-center">
              Free shipping on orders of {money(merch.presale.freeShippingOverCents)}+. Otherwise {money(merch.presale.shippingCents)} flat. US only. Pre-orders are final sale.
            </p>
          </>
        )}

        {bag.length > 0 && (
          <aside className="shop-bag" aria-label="Your pre-order">
            <ul>
              {bag.map((l, i) => (
                <li key={`${l.id}-${l.size}-${l.color}`}>
                  <span>{l.name}{l.size ? ` · ${l.size}` : ''}{l.color ? ` · ${l.color}` : ''} × {l.quantity}</span>
                  <span>{money(l.priceCents * l.quantity)}</span>
                  <button type="button" className="shop-x" aria-label={`Remove ${l.name}`} onClick={() => setBag((b) => b.filter((_, j) => j !== i))}>×</button>
                </li>
              ))}
            </ul>
            <p className="shop-order-line"><span>Shipping</span><span>{shipping ? money(shipping) : 'Free'}</span></p>
            <p className="shop-order-line"><span>Total</span><strong>{money(subtotal + shipping)}</strong></p>
            <button type="button" className="shop-btn shop-btn-gold shop-pay" onClick={checkout} disabled={busy}>
              {busy ? 'Connecting…' : 'Pre-order now'}
            </button>
          </aside>
        )}
        <p className="shop-tagline playfair">Where grown folks come out to play.™</p>
      </main>
    </div>
  );
};

export default Shop;
