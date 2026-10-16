import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getCatalog, startMerchCheckout, startDigitalCheckout, unlockSample, sampleUrl, money, longDate } from '../Services/shopApi';
import { currentSource } from '../Services/ticketSources';
import '../Styles/Shop.css';

// /shop — printable Karaoke Bingo downloads and the Grown Folks™ merch pre-sale (made to order through Printful)

// Preview image for an edition: "single-rnb" → /shop/bingo/rnb.jpg
const preview = (id) => `/shop/bingo/${id.replace('single-', '')}.jpg`;
const BUNDLE_PREVIEWS = {
  'complete-collection': ['christmas', 'hiphop', 'rnb'],
  'bundle-genre-series': ['country', 'motown', 'rnb'],
  'bundle-holiday-series': ['valentines', 'halloween', 'christmas'],
};

const Stack = ({ ids, alt }) => (
  <div className="bingo-stack" role="img" aria-label={alt}>
    {ids.map((id) => <img key={id} src={`/shop/bingo/${id}.jpg`} alt="" loading="lazy" />)}
  </div>
);

const BuyButton = ({ item, busyId, onBuy, gold }) => (
  <button
    type="button"
    className={`shop-btn ${gold ? 'shop-btn-gold' : 'shop-btn-navy'}`}
    onClick={() => onBuy(item.id)}
    disabled={Boolean(busyId)}
  >
    {busyId === item.id ? 'Connecting…' : `Buy · ${money(item.priceCents)}`}
  </button>
);

const SampleForm = () => {
  const [form, setForm] = useState({ fullName: '', email: '' });
  const [state, setState] = useState({ busy: false, error: '', done: false });
  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: '', done: false });
    try {
      await unlockSample({ ...form });
      setState({ busy: false, error: '', done: true });
    } catch (err) {
      setState({ busy: false, error: err.message, done: false });
    }
  };
  return (
    <div className="bingo-sample">
      <div>
        <p className="shop-label">Try it free</p>
        <h3 className="playfair shop-h3">Two free R&amp;B cards</h3>
        <p className="shop-muted">Print them, play a round with friends, and see how the room lights up. We'll add you to our email list for new editions and events.</p>
      </div>
      {state.done ? (
        <div className="bingo-sample-done">
          <p className="shop-ok">You're in! Your cards are ready.</p>
          <a className="shop-btn shop-btn-gold" href={sampleUrl()} target="_blank" rel="noreferrer">Open the free cards</a>
        </div>
      ) : (
        <form className="bingo-sample-form" onSubmit={submit}>
          <label htmlFor="sample-name">Your name
            <input id="sample-name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} autoComplete="name" required />
          </label>
          <label htmlFor="sample-email">Email
            <input id="sample-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required />
          </label>
          <button type="submit" className="shop-btn shop-btn-navy" disabled={state.busy}>{state.busy ? 'One moment…' : 'Get the free cards'}</button>
          {state.error && <p className="shop-error" role="alert">{state.error}</p>}
        </form>
      )}
    </div>
  );
};

const BingoShop = ({ digital }) => {
  const [tab, setTab] = useState('genre');
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const bundles = digital.items.filter((i) => i.kind === 'bundle');
  const featured = bundles.find((b) => b.featured);
  const series = bundles.filter((b) => !b.featured);
  const singles = digital.items.filter((i) => i.group === tab);

  const buy = async (id) => {
    setBusyId(id);
    setError('');
    try {
      const { url } = await startDigitalCheckout({ items: [id], source: currentSource() });
      window.location.href = url;
    } catch (e) {
      setError(e.message);
      setBusyId('');
    }
  };

  return (
    <section id="bingo" className="bingo">
      <p className="shop-label">Printable Karaoke Bingo</p>
      <h2 className="playfair shop-h2">Host your own Karaoke Bingo night</h2>
      <p className="shop-sub">
        The same game we run at our events. Every edition has 40 unique cards and our host guide.
        Download the PDF, print at home, and play all season.
      </p>
      {error && <p className="shop-error" role="alert">{error}</p>}

      {featured && (
        <article className="bingo-featured">
          <Stack ids={BUNDLE_PREVIEWS[featured.id]} alt="Karaoke Bingo cards from three editions" />
          <div className="bingo-featured-body">
            <span className="bingo-badge">Best value</span>
            <h3 className="playfair">The Complete Collection</h3>
            <p className="shop-muted">{featured.description}</p>
            <p className="bingo-math">All 16 editions for {money(featured.priceCents)}. That's under $4 an edition.</p>
            <BuyButton item={featured} busyId={busyId} onBuy={buy} gold />
          </div>
        </article>
      )}

      <div className="bingo-series">
        {series.map((b) => (
          <article key={b.id} className="bingo-tile">
            <Stack ids={BUNDLE_PREVIEWS[b.id]} alt={`Cards from the ${b.name}`} />
            <div className="bingo-tile-body">
              <h3 className="playfair">{b.name.replace('Karaoke Bingo: ', '')}</h3>
              <p className="shop-muted">{b.description}</p>
              <BuyButton item={b} busyId={busyId} onBuy={buy} />
            </div>
          </article>
        ))}
      </div>

      <div className="bingo-tabs" role="tablist" aria-label="Single editions">
        {[['genre', 'Genre editions'], ['holiday', 'Holiday editions']].map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? 'is-on' : ''} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>
      <div className="bingo-grid">
        {singles.map((item) => (
          <article key={item.id} className="bingo-tile bingo-single">
            <div className="bingo-thumb"><img src={preview(item.id)} alt={`A ${item.name} card`} loading="lazy" /></div>
            <div className="bingo-tile-body">
              <h3 className="playfair">{item.name.replace('Karaoke Bingo: ', '')}</h3>
              <p className="shop-muted">{item.description}</p>
              <BuyButton item={item} busyId={busyId} onBuy={buy} />
            </div>
          </article>
        ))}
      </div>
      <p className="shop-fine shop-center">{digital.license} Instant download after checkout. Digital downloads are final sale.</p>

      <SampleForm />
    </section>
  );
};
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
        <title>Shop: Printable Karaoke Bingo &amp; Merch | Grown Folks™ Collective</title>
        <meta name="description" content="Printable Karaoke Bingo cards from Grown Folks™ Collective: 16 editions, 40 unique cards each, host guide included. Plus Grown Folks™ merch." />
      </Helmet>

      <header className="shop-hero">
        <p className="shop-kicker">The Grown Folks™ shop</p>
        <h1 className="playfair">Bring the party home.</h1>
        <p className="shop-lead">
          Printable Karaoke Bingo for your own game night, plus Grown Folks™ merch.
        </p>
        <a href="#bingo" className="shop-btn shop-btn-gold">Shop Karaoke Bingo</a>
      </header>

      <main className="shop-main">
        {error && <p className="shop-error" role="alert">{error}</p>}
        {!catalog && !error && <p className="shop-muted">Loading…</p>}

        {catalog?.digital && <BingoShop digital={catalog.digital} />}

        {merch && (
          <header className="shop-merch-head">
            <p className="shop-label">Grown Folks™ merch</p>
            <h2 className="playfair shop-h2">Wear the room.</h2>
            <p className="shop-sub">
              {merch.open
                ? `Pre-sale is open until ${longDate(merch.presale.end)}. Every piece is made to order after the pre-sale closes. ${merch.presale.shipBy}.`
                : 'Tees and more are on the way. Pre-orders open soon at a pre-sale price.'}
            </p>
          </header>
        )}

        {merch && !merch.open && (
          <section className="shop-card shop-center">
            <h2 className="playfair shop-h2">The drop is coming</h2>
            <p className="shop-muted">
              Want first dibs? Join our email list at the bottom of this page and you'll hear the moment pre-orders open.
              In the meantime, a GFC gift card makes a great gift.
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
