import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getCatalog, startMerchCheckout, startDigitalCheckout, unlockSample, sampleUrl, money } from '../Services/shopApi';
import { currentSource } from '../Services/ticketSources';
import { useCart } from '../Context/CartContext';
import { loadUpcomingEvents, getTierStatus, parseCleanPrice, formatShortDate, eventPath, slugify } from '../Services/eventUtils';
import { isMemberTier } from '../Services/memberPricing';
import '../Styles/Shop.css';

// /shop — printable Karaoke Bingo downloads and Grown Folks™ merch (made to order by Printful)

// Every product has its own page: /shop/<name>, e.g. /shop/gfc-classic-tee
export const productSlug = (item) => slugify(String(item?.name || '').replace(/&/g, ' and '));
export const productPath = (item) => `/shop/${productSlug(item)}`;

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

// With the merch shop open, cards go in the same bag (10% off them when merch is in the bag too).
// Without it, the button checks out right away.
const BuyButton = ({ item, busyId, onBuy, gold, bagged, toBag }) =>
  bagged ? (
    <button type="button" className="shop-btn shop-btn-inbag" disabled>In your bag ✓</button>
  ) : (
    <button
      type="button"
      className={`shop-btn ${gold ? 'shop-btn-gold' : 'shop-btn-navy'}`}
      onClick={() => onBuy(item)}
      disabled={Boolean(busyId)}
    >
      {busyId === item.id ? 'Connecting…' : `${toBag ? 'Add to bag' : 'Buy'} · ${money(item.priceCents)}`}
    </button>
  );

// Required before any Karaoke Bingo checkout
const NoRefundCheck = ({ checked, onChange, id }) => (
  <label className="shop-agree" htmlFor={id}>
    <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span>I understand Karaoke Bingo downloads are <strong>non-refundable</strong>. My files are delivered right after checkout. <Link to="/refund-policy" target="_blank">Refund Policy</Link></span>
  </label>
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

const BingoShop = ({ digital, onAdd, inBag, comboPercent }) => {
  const [tab, setTab] = useState('genre');
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const bundles = digital.items.filter((i) => i.kind === 'bundle');
  const featured = bundles.find((b) => b.featured);
  const series = bundles.filter((b) => !b.featured);
  const singles = digital.items.filter((i) => i.group === tab);

  const checkoutNow = async ({ id }) => {
    if (!agreed) {
      setError('Please check the box to confirm you understand Karaoke Bingo downloads are non-refundable.');
      document.getElementById('bingo-agree')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setBusyId(id);
    setError('');
    try {
      const { url } = await startDigitalCheckout({ items: [id], source: currentSource(), agreeNoRefund: true });
      window.location.href = url;
    } catch (e) {
      setError(e.message);
      setBusyId('');
    }
  };
  const buy = onAdd || checkoutNow;
  const btn = (item, gold) => <BuyButton item={item} busyId={busyId} onBuy={buy} gold={gold} bagged={inBag?.has(item.id)} toBag={Boolean(onAdd)} />;

  return (
    <section id="bingo" className="bingo">
      <p className="shop-label">Printable Karaoke Bingo</p>
      <h2 className="playfair shop-h2">Host your own Karaoke Bingo night</h2>
      <p className="shop-sub">
        The same game we run at our events. Every edition has 40 unique cards and our host guide.
        Download the PDF, print at home, and play all season.
      </p>
      <p className="shop-norefund">Instant download · Non-refundable once purchased</p>
      {!onAdd && <NoRefundCheck id="bingo-agree" checked={agreed} onChange={(v) => { setAgreed(v); setError(''); }} />}
      {onAdd && (
        <p className="shop-combo-note">
          <strong>Save {comboPercent}% on your cards</strong> when you add any Grown Folks™ merch to the same bag. The discount is on the cards only.
        </p>
      )}
      {error && <p className="shop-error" role="alert">{error}</p>}

      {featured && (
        <article className="bingo-featured">
          <Stack ids={BUNDLE_PREVIEWS[featured.id]} alt="Karaoke Bingo cards from three editions" />
          <div className="bingo-featured-body">
            <span className="bingo-badge">Best value</span>
            <h3 className="playfair"><Link to={productPath(featured)} className="shop-name-link">The Complete Collection</Link></h3>
            <p className="shop-muted">{featured.description}</p>
            <p className="bingo-math">All 16 editions for {money(featured.priceCents)}. That's under $4 an edition.</p>
            {btn(featured, true)}
          </div>
        </article>
      )}

      <div className="bingo-series">
        {series.map((b) => (
          <article key={b.id} className="bingo-tile">
            <Stack ids={BUNDLE_PREVIEWS[b.id]} alt={`Cards from the ${b.name}`} />
            <div className="bingo-tile-body">
              <h3 className="playfair"><Link to={productPath(b)} className="shop-name-link">{b.name.replace('Karaoke Bingo: ', '')}</Link></h3>
              <p className="shop-muted">{b.description}</p>
              {btn(b)}
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
              <h3 className="playfair"><Link to={productPath(item)} className="shop-name-link">{item.name.replace('Karaoke Bingo: ', '')}</Link></h3>
              <p className="shop-muted">{item.description}</p>
              {btn(item)}
            </div>
          </article>
        ))}
      </div>
      <p className="shop-fine shop-center">{digital.license} Instant download after checkout. <strong>All Karaoke Bingo downloads are non-refundable.</strong> <Link to="/refund-policy">Refund Policy</Link></p>

      <SampleForm />
    </section>
  );
};
// One Karaoke Bingo edition or bundle on its own page
const BingoFocus = ({ item, onAdd, inBag }) => {
  const [agreed, setAgreed] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const ids = BUNDLE_PREVIEWS[item.id];
  const checkoutNow = async ({ id }) => {
    if (!agreed) return setError('Please check the box to confirm you understand Karaoke Bingo downloads are non-refundable.');
    setBusyId(id);
    setError('');
    try {
      const { url } = await startDigitalCheckout({ items: [id], source: currentSource(), agreeNoRefund: true });
      window.location.href = url;
    } catch (e) {
      setError(e.message);
      setBusyId('');
    }
  };
  return (
    <article className="shop-product shop-product-focus">
      <div className="shop-product-img">
        {ids ? <Stack ids={ids} alt={`Cards from ${item.name}`} /> : <img src={preview(item.id)} alt={`A ${item.name} card`} />}
      </div>
      <div className="shop-product-body">
        <p className="shop-label">Printable Karaoke Bingo</p>
        <h1 className="playfair">{item.name.replace('Karaoke Bingo: ', '')}</h1>
        <p className="shop-tile-price">{money(item.priceCents)}</p>
        <p className="shop-muted">{item.description}</p>
        <p className="shop-norefund">Instant download · 40 unique cards per edition · host guide included · non-refundable</p>
        {!onAdd && <NoRefundCheck id="focus-agree" checked={agreed} onChange={(v) => { setAgreed(v); setError(''); }} />}
        <BuyButton item={item} busyId={busyId} onBuy={onAdd || checkoutNow} gold bagged={inBag?.has(item.id)} toBag={Boolean(onAdd)} />
        {error && <p className="shop-error" role="alert">{error}</p>}
      </div>
    </article>
  );
};

// Merch filter chips, from the product name in Printful (order matters: "Long Sleeve Tee" is a long sleeve)
const CATEGORIES = [
  ['hoodie', 'Hoodies', /hoodie|sweatshirt|crewneck/i],
  ['longsleeve', 'Long sleeves', /long[\s-]?sleeve/i],
  ['tee', 'Tees', /\btee\b|t-shirt|shirt/i],
  ['hat', 'Hats', /hat|cap\b|beanie/i],
  ['drinkware', 'Mugs & tumblers', /mug|tumbler|bottle|cup/i],
  ['socks', 'Socks', /sock/i],
];
const categoryOf = (name) => (CATEGORIES.find(([, , re]) => re.test(name)) || ['other'])[0];

const uniq = (list) => [...new Set(list.filter(Boolean))];
const priceRange = (variants) => {
  const prices = variants.map((v) => v.priceCents);
  const lo = Math.min(...prices);
  return lo === Math.max(...prices) ? money(lo) : `From ${money(lo)}`;
};

// One Printful product. Variants carry the size, color, price and photo.
const ProductCard = ({ item, onAdd, focus = false }) => {
  const colors = uniq(item.variants.map((v) => v.color));
  const [color, setColor] = useState(colors.length === 1 ? colors[0] : '');
  const sizes = uniq(item.variants.filter((v) => !color || v.color === color).map((v) => v.size));
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');

  const pick = (c, sz) =>
    item.variants.find((v) => (!colors.length || v.color === c) && (!sizes.length || v.size === sz)) || null;
  const variant = pick(color, sizes.length === 1 ? sizes[0] : size);
  const shown = variant || item.variants.find((v) => color && v.color === color) || null;
  const image = shown?.image || item.image;

  const add = () => {
    if (colors.length > 1 && !color) return setNote('Pick a color.');
    if (sizes.length > 1 && !size) return setNote('Pick a size.');
    if (!variant) return setNote("That combination isn't available.");
    onAdd({ variantId: variant.id, name: item.name, size: variant.size, color: variant.color, quantity: qty, priceCents: variant.priceCents });
    setNote('Added ✓');
    setTimeout(() => setNote(''), 1800);
  };

  return (
    <article className={`shop-product${focus ? ' shop-product-focus' : ''}`}>
      <div className="shop-product-img">
        {image ? <img src={image} alt={`${item.name}${color ? ` in ${color}` : ''}`} loading={focus ? 'eager' : 'lazy'} /> : <span aria-hidden="true">GFC</span>}
      </div>
      <div className="shop-product-body">
        {focus ? <h1 className="playfair">{item.name}</h1> : <h3 className="playfair"><Link to={productPath(item)} className="shop-name-link">{item.name}</Link></h3>}
        {focus && item.description && <p className="shop-muted">{item.description}</p>}
        <p className="shop-tile-price">{variant ? money(variant.priceCents) : priceRange(item.variants)}</p>
        <div className="shop-product-opts">
          {colors.length > 1 && (
            <label>Color
              <select value={color} onChange={(e) => { setColor(e.target.value); setSize(''); setNote(''); }}>
                <option value="">Choose</option>
                {colors.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
          )}
          {sizes.length > 1 && (
            <label>Size
              <select value={size} onChange={(e) => { setSize(e.target.value); setNote(''); }}>
                <option value="">Choose</option>
                {sizes.map((sz) => <option key={sz}>{sz}</option>)}
              </select>
            </label>
          )}
          <label>Qty
            <select value={qty} onChange={(e) => setQty(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
        </div>
        <button type="button" className="shop-btn shop-btn-navy" onClick={add}>Add to bag</button>
        {note && <span className="shop-note" aria-live="polite">{note}</span>}
      </div>
    </article>
  );
};

// Tickets to upcoming events, offered as an add-on. They go in the ticket bag (its own checkout).
const ADDON_DAYS = 45;
const cheapestOpenTier = (event) =>
  (event.tiers || [])
    .filter((t) => getTierStatus(t) === 'available' && !isMemberTier(t))
    .sort((a, b) => parseCleanPrice(a) - parseCleanPrice(b))[0] || null;

const EventAddOns = ({ events, title, sub }) => {
  const { addToCart } = useCart();
  if (!events.length) return null;
  return (
    <section className="shop-addons" aria-label={title}>
      <p className="shop-label">Add tickets</p>
      <h3 className="playfair shop-h3">{title}</h3>
      {sub && <p className="shop-muted">{sub}</p>}
      <div className="shop-addon-list">
        {events.map(({ event, tier }) => (
          <article key={event._id} className="shop-addon">
            <img src={event.image} alt="" loading="lazy" />
            <div className="shop-addon-body">
              <span className="shop-addon-date">{formatShortDate(event.date)}</span>
              <Link to={eventPath(event)} className="shop-addon-name">{event.title}</Link>
              <span className="shop-addon-price">From ${parseCleanPrice(tier)}</span>
            </div>
            <button type="button" className="shop-btn shop-btn-navy" onClick={() => addToCart(event, tier)}>Add tickets</button>
          </article>
        ))}
      </div>
    </section>
  );
};

const tabFromHash = () => (typeof window !== 'undefined' && window.location.hash === '#bingo' ? 'bingo' : 'merch');

const Shop = () => {
  const { slug = '' } = useParams();
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState('');
  const [bag, setBag] = useState([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState(tabFromHash);
  const [cat, setCat] = useState('all');
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    getCatalog().then(setCatalog).catch((e) => setError(e.message));
    loadUpcomingEvents()
      .then((list) => {
        const cutoff = Date.now() + ADDON_DAYS * 86400000;
        setUpcoming(
          list
            .filter((e) => new Date(e.date).getTime() <= cutoff)
            .map((event) => ({ event, tier: cheapestOpenTier(event) }))
            .filter((x) => x.tier)
        );
      })
      .catch(() => setUpcoming([]));
    const onHash = () => setTab(tabFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const merch = catalog?.merch;
  const hasMerch = Boolean(merch?.open);

  // /shop/<product>: that product goes up top, its tab opens below
  const focusMerch = slug && hasMerch ? (merch.items || []).find((i) => productSlug(i) === slug) : null;
  const focusBingo = slug && !focusMerch ? (catalog?.digital?.items || []).find((i) => productSlug(i) === slug) : null;
  const focusItem = focusMerch || focusBingo;
  useEffect(() => {
    if (focusMerch) setTab('merch');
    if (focusBingo) setTab('bingo');
    if (focusItem) window.scrollTo({ top: 0 });
  }, [slug, Boolean(focusItem)]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeTab = hasMerch ? tab : 'bingo';
  const showTab = (t) => {
    setTab(t);
    window.history.replaceState(null, '', t === 'bingo' ? '#bingo' : '#merch');
    document.getElementById('shop-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const chips = useMemo(() => {
    if (!merch?.items) return [];
    const present = new Set(merch.items.map((i) => categoryOf(i.name)));
    return CATEGORIES.filter(([key]) => present.has(key));
  }, [merch]);
  const shown = (merch?.items || []).filter((i) => cat === 'all' || categoryOf(i.name) === cat);

  const comboPercent = catalog?.comboPercent ?? 10;
  const addCard = (item) => {
    setBag((b) => (b.some((x) => x.digitalId === item.id) ? b : [...b, { kind: 'digital', digitalId: item.id, name: item.name, priceCents: item.priceCents, quantity: 1 }]));
    setBagOpen(true);
  };
  const inBag = useMemo(() => new Set(bag.map((l) => l.digitalId).filter(Boolean)), [bag]);

  const addToBag = (line) =>
    setBag((b) => {
      const i = b.findIndex((x) => x.variantId && x.variantId === line.variantId);
      if (i < 0) return [...b, line];
      const next = [...b];
      next[i] = { ...next[i], quantity: Math.min(10, next[i].quantity + line.quantity) };
      return next;
    });

  // Merch and cards share one bag. Shipping and free shipping count the merch only.
  // Cards are comboPercent off when there's merch in the bag (must match the backend's rounding).
  const merchLines = bag.filter((l) => l.kind !== 'digital');
  const cardLines = bag.filter((l) => l.kind === 'digital');
  const combo = merchLines.length > 0 && cardLines.length > 0;
  const cardPrice = (l) => (combo ? Math.round(l.priceCents * (1 - comboPercent / 100)) : l.priceCents);
  const count = bag.reduce((s, l) => s + l.quantity, 0);
  const merchSubtotal = merchLines.reduce((s, l) => s + l.priceCents * l.quantity, 0);
  const cardsSubtotal = cardLines.reduce((s, l) => s + cardPrice(l), 0);
  const cardSavings = cardLines.reduce((s, l) => s + l.priceCents - cardPrice(l), 0);
  const shipping = !merchLines.length || !merch || merchSubtotal >= merch.settings.freeShippingOverCents ? 0 : merch.settings.shippingCents;
  const toFree = merchLines.length && merch ? merch.settings.freeShippingOverCents - merchSubtotal : 0;

  const needsAgree = cardLines.length > 0 && !agreed;
  const checkout = async () => {
    if (needsAgree) {
      setBagOpen(true);
      setError('');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const digital = cardLines.map((l) => l.digitalId);
      const { url } = merchLines.length
        ? await startMerchCheckout({
            items: merchLines.map(({ variantId, quantity }) => ({ variantId, quantity })),
            digital,
            source: currentSource(),
            ...(digital.length && { agreeNoRefund: true }),
          })
        : await startDigitalCheckout({ items: digital, source: currentSource(), agreeNoRefund: true });
      window.location.href = url;
    } catch (e) {
      setError(e.message);
      setBusy(false);
      setBagOpen(true);
    }
  };

  return (
    <div className={`shop-page${bag.length ? ' has-bag' : ''}`}>
      <Helmet>
        {focusItem ? (
          <title>{`${focusItem.name} | Grown Folks™ Collective Shop`}</title>
        ) : (
          <title>Shop: Grown Folks™ Merch &amp; Printable Karaoke Bingo | Grown Folks™ Collective</title>
        )}
        <meta
          name="description"
          content={focusItem
            ? (focusItem.description || `${focusItem.name} from the Grown Folks™ Collective shop.`)
            : 'Grown Folks™ Collective merch, made to order, plus printable Karaoke Bingo: 16 editions, 40 unique cards each, host guide included.'}
        />
        {focusItem && <link rel="canonical" href={`https://www.grownfolkscollective.com${productPath(focusItem)}`} />}
      </Helmet>

      {focusItem ? (
        <section className="shop-focus" aria-label={focusItem.name}>
          <Link to="/shop" className="shop-back">← All products</Link>
          {focusMerch
            ? <ProductCard item={focusMerch} focus onAdd={(l) => { addToBag(l); setBagOpen(true); }} />
            : <BingoFocus item={focusBingo} onAdd={hasMerch ? addCard : null} inBag={inBag} />}
          <p className="shop-focus-more">More from the shop below</p>
        </section>
      ) : (
        <header className="shop-hero shop-hero-slim">
          <p className="shop-kicker">The Grown Folks™ shop</p>
          <h1 className="playfair">Bring the party home.</h1>
          <p className="shop-lead">Grown Folks™ merch, made to order, and printable Karaoke Bingo for your own game night.</p>
          {slug && catalog && <p className="shop-muted">We couldn't find that product. Here's everything in the shop.</p>}
        </header>
      )}

      {hasMerch && (
        <nav id="shop-tabs" className="shop-tabs" aria-label="Shop sections">
          <div className="shop-tabs-inner" role="tablist">
            <button type="button" role="tab" aria-selected={activeTab === 'merch'} className={activeTab === 'merch' ? 'is-on' : ''} onClick={() => showTab('merch')}>
              Merch <span>{merch.items.length}</span>
            </button>
            <button type="button" role="tab" aria-selected={activeTab === 'bingo'} className={activeTab === 'bingo' ? 'is-on' : ''} onClick={() => showTab('bingo')}>
              Karaoke Bingo <span>{catalog?.digital?.items.length || ''}</span>
            </button>
          </div>
        </nav>
      )}

      <main className="shop-main">
        {error && <p className="shop-error" role="alert">{error}</p>}
        {!catalog && !error && <p className="shop-muted">Loading…</p>}

        {activeTab === 'bingo' && catalog?.digital && (
          <>
            <BingoShop digital={catalog.digital} onAdd={hasMerch ? addCard : null} inBag={inBag} comboPercent={comboPercent} />
            <EventAddOns
              events={upcoming.filter((x) => /karaoke bingo/i.test(x.event.title)).slice(0, 3)}
              title="Play it live with us in Atlanta"
              sub="Come play Karaoke Bingo with the Grown Folks™ crew. Every card purchase comes with a code for 5% off your tickets."
            />
          </>
        )}

        {activeTab === 'merch' && hasMerch && (
          <section id="merch" className="shop-merch">
            <header className="shop-merch-head">
              <h2 className="playfair shop-h2">Wear the room.</h2>
              <p className="shop-sub">
                {merch.settings.shipNote} Free shipping on orders of {money(merch.settings.freeShippingOverCents)}+, and every order earns 5% off event tickets.
              </p>
            </header>
            {chips.length > 1 && (
              <div className="shop-chips" role="group" aria-label="Filter merch">
                <button type="button" className={cat === 'all' ? 'is-on' : ''} aria-pressed={cat === 'all'} onClick={() => setCat('all')}>All</button>
                {chips.map(([key, label]) => (
                  <button key={key} type="button" className={cat === key ? 'is-on' : ''} aria-pressed={cat === key} onClick={() => setCat(key)}>{label}</button>
                ))}
              </div>
            )}
            <div className="shop-products">
              {shown.map((item) => <ProductCard key={item.id} item={item} onAdd={(l) => { addToBag(l); }} />)}
            </div>
            <p className="shop-fine shop-center">
              {money(merch.settings.shippingCents)} flat shipping under {money(merch.settings.freeShippingOverCents)}. US only. Made-to-order items are final sale. <Link to="/refund-policy">Refund Policy</Link>
            </p>
            <EventAddOns
              events={upcoming.slice(0, 3)}
              title="Wear it to our next event"
              sub="Every merch order comes with a code for 5% off your tickets. Tickets check out separately and don't count toward free shipping."
            />
            <button type="button" className="shop-crosssell" onClick={() => showTab('bingo')}>
              <strong>Hosting a game night?</strong> Printable Karaoke Bingo, 40 cards per edition, {comboPercent}% off when you add them with merch. <span>Shop Karaoke Bingo →</span>
            </button>
          </section>
        )}

        <p className="shop-tagline playfair">Where grown folks come out to play.™</p>
      </main>

      {bag.length > 0 && (
        <aside className={`shop-bagbar${bagOpen ? ' is-open' : ''}`} aria-label="Your bag">
          {bagOpen && (
            <div className="shop-bagbar-panel">
              <ul>
                {bag.map((l, i) => (
                  <li key={l.variantId || l.digitalId}>
                    {l.kind === 'digital' ? (
                      <>
                        <span>🎤 {l.name.replace('Karaoke Bingo: ', 'Karaoke Bingo · ')} <em className="shop-dl-tag">download</em></span>
                        <span>
                          {combo && <s className="shop-was">{money(l.priceCents)}</s>} {money(cardPrice(l))}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>{l.name}{l.color ? ` · ${l.color}` : ''}{l.size ? ` · ${l.size}` : ''} × {l.quantity}</span>
                        <span>{money(l.priceCents * l.quantity)}</span>
                      </>
                    )}
                    <button type="button" className="shop-x" aria-label={`Remove ${l.name}`} onClick={() => setBag((b) => b.filter((_, j) => j !== i))}>×</button>
                  </li>
                ))}
              </ul>
              {combo && <p className="shop-order-line shop-saved"><span>Karaoke Bingo {comboPercent}% off with merch</span><span>−{money(cardSavings)}</span></p>}
              {cardLines.length > 0 && <NoRefundCheck id="bag-agree" checked={agreed} onChange={setAgreed} />}
              {merchLines.length > 0 && <p className="shop-order-line"><span>Shipping</span><span>{shipping ? money(shipping) : 'Free'}</span></p>}
              {toFree > 0 && <p className="shop-fine">Add {money(toFree)} more in merch for free shipping. Bingo cards don't count toward it.</p>}
              {merchLines.length > 0 && !cardLines.length && (
                <button type="button" className="shop-bag-nudge" onClick={() => { setBagOpen(false); showTab('bingo'); }}>
                  🎤 Add Karaoke Bingo cards and save {comboPercent}% on them →
                </button>
              )}
              {cardLines.length > 0 && !merchLines.length && hasMerch && (
                <button type="button" className="shop-bag-nudge" onClick={() => { setBagOpen(false); showTab('merch'); }}>
                  🛍️ Add any merch and save {comboPercent}% on your cards →
                </button>
              )}
            </div>
          )}
          <div className="shop-bagbar-row">
            <button type="button" className="shop-bagbar-toggle" onClick={() => setBagOpen((o) => !o)} aria-expanded={bagOpen}>
              <span className="shop-bagbar-count">{count}</span>
              <span>{bagOpen ? 'Hide bag' : 'View bag'}</span>
              <strong>{money(merchSubtotal + cardsSubtotal + shipping)}</strong>
            </button>
            <button
              type="button"
              className="shop-btn shop-btn-gold"
              onClick={checkout}
              disabled={busy || (bagOpen && needsAgree)}
              title={needsAgree ? 'Check the non-refundable box first' : undefined}
            >
              {busy ? 'Connecting…' : 'Check out'}
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};

export default Shop;
