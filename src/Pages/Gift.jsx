import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getCatalog, startCheckout, checkCard, money, longDate, todayYMD } from '../Services/shopApi';
import { currentSource } from '../Services/ticketSources';
import '../Styles/Shop.css';

// /gift: gift cards now; Holiday Passes appear at 12:00 AM ET on Black Friday
const PASS_FAQ = 'Which events does a Holiday Pass cover?';
const FAQS = [
  [PASS_FAQ, 'Game Night, Karaoke Bingo and Acoustic & Infused, through March 31, 2027. Each night on the pass is one ticket. Use them all yourself or bring friends to the same night. Dinners like Friendsgiving and the Holiday Table are not included, but a gift card works for those.'],
  ['How do they use it?', 'Pick an event at grownfolkscollective.com/events, add tickets to the bag, tap "Have a code or gift card?" and enter the code from the email. Anything left stays on the code for next time.'],
  ['When does the gift arrive?', 'On the date you choose, around 9 AM Eastern. Pick today and it goes out right after you pay. You get a receipt with the code too, just in case.'],
  ['Do gift cards expire?', 'Paid gift cards never expire.'],
  ['Can I get a refund?', 'Gift cards are final sale, like our tickets. If something goes wrong, email events@grownfolkscollective.com and we will make it right.'],
];

const Gift = () => {
  const [params] = useSearchParams();
  const [catalog, setCatalog] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [product, setProduct] = useState(params.get('item') || '');
  const [amount, setAmount] = useState(5000);
  const [isGift, setIsGift] = useState(params.get('for') !== 'me');
  const [form, setForm] = useState({ recipientName: '', recipientEmail: '', fromName: '', message: '', sendDate: todayYMD() });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [balanceCode, setBalanceCode] = useState('');
  const [balance, setBalance] = useState(null);
  const orderRef = useRef(null);

  useEffect(() => {
    getCatalog().then(setCatalog).catch((e) => setLoadError(e.message));
  }, []);

  const sale = catalog?.sale;
  const passes = catalog?.passes || [];
  const hasPasses = passes.length > 0;
  const faqs = hasPasses
    ? FAQS.map(([q, a]) =>
        q === 'Do gift cards expire?'
          ? [q, 'Paid gift cards never expire. Holiday Passes and Cyber Monday bonus cards are good through March 31, 2027.']
          : q === 'Can I get a refund?' ? [q, a.replace('Gift cards are', 'Passes and gift cards are')] : [q, a])
    : FAQS.filter(([q]) => q !== PASS_FAQ);
  const chooseText = hasPasses ? 'Choose a Holiday Pass or a gift card' : 'Choose a gift card';
  const amounts = catalog?.giftAmounts || [];
  const chosenPass = passes.find((p) => p.id === product);
  const chosenAmount = amounts.find((a) => a.amountCents === amount);
  const priceCents = product === 'gift' ? amount : chosenPass?.priceCents || 0;

  // A pass link opened before passes are on sale falls back to nothing selected
  useEffect(() => {
    if (catalog && product && product !== 'gift' && !passes.some((p) => p.id === product)) setProduct('');
  }, [catalog, product, passes]);

  const choose = (id, cents) => {
    setProduct(id);
    if (cents) setAmount(cents);
    setError('');
    setTimeout(() => orderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const pay = async (e) => {
    e.preventDefault();
    setError('');
    if (!product) return setError(`${chooseText} first.`);
    if (isGift) {
      if (!form.recipientName.trim()) return setError("Add the name of the person you're gifting.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recipientEmail.trim())) return setError('Add a valid email for them.');
    }
    setBusy(true);
    try {
      const { url } = await startCheckout({
        product,
        amountCents: product === 'gift' ? amount : undefined,
        isGift,
        ...(isGift ? form : {}),
        source: currentSource(),
      });
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const lookUp = async (e) => {
    e.preventDefault();
    setBalance(null);
    if (!balanceCode.trim()) return;
    try {
      setBalance(await checkCard(balanceCode));
    } catch (err) {
      setBalance({ error: err.message });
    }
  };

  return (
    <div className="shop-page">
      <Helmet>
        <title>{hasPasses ? 'Gift a Night Out: Holiday Passes & Gift Cards' : 'Gift a Night Out: Gift Cards'} | Grown Folks™ Collective</title>
        <meta
          name="description"
          content="Give a night out in Atlanta. Gift cards for Game Night, Karaoke Bingo and live music with Grown Folks™ Collective, an alcohol-free social club for 30+."
        />
      </Helmet>

      <header className="shop-hero">
        <p className="shop-kicker">Gift a night out</p>
        <h1 className="playfair">The gift of getting out the house.</h1>
        <p className="shop-lead">
          {hasPasses ? 'Holiday Passes and gift cards' : 'Gift cards'} for Game Night, Karaoke Bingo and live music in Atlanta.
          Alcohol-free, 30+, and delivered by email on the day you pick.
        </p>
        <a href="#build" className="shop-btn shop-btn-gold">Start a gift</a>
      </header>

      {sale ? (
        <div className={`shop-sale shop-sale-${sale.key}`} role="status">
          <strong>{sale.label} is on.</strong> {sale.blurb} Ends {new Date(sale.end).toLocaleDateString('en-US', { timeZone: 'America/New_York', weekday: 'long' })} at midnight.
        </div>
      ) : null}

      <main className="shop-main" id="build">
        {loadError && <p className="shop-error">{loadError}</p>}
        {!catalog && !loadError && <p className="shop-muted">Loading…</p>}

        {catalog && (
          <>
            {hasPasses && (
            <section aria-labelledby="passes-title">
              <p className="shop-label">Holiday Pass</p>
              <h2 id="passes-title" className="playfair shop-h2">Prepaid nights out</h2>
              <p className="shop-sub">Good for Game Night, Karaoke Bingo and Acoustic &amp; Infused through Mar 31, 2027.</p>
              <div className="shop-grid">
                {passes.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`shop-tile ${product === p.id ? 'on' : ''}`}
                    onClick={() => choose(p.id)}
                    aria-pressed={product === p.id}
                  >
                    {p.onSale && <span className="shop-badge">{sale?.label} price</span>}
                    <span className="shop-tile-name playfair">{p.name.replace('Holiday Pass: ', '')}</span>
                    <span className="shop-tile-price">
                      {money(p.priceCents)}
                      {p.onSale && <s>{money(p.regularCents)}</s>}
                    </span>
                    <span className="shop-tile-note">
                      {money(p.valueCents)} value · save {money(p.valueCents - p.priceCents)}
                    </span>
                    <span className="shop-tile-cta">{product === p.id ? '✓ Selected' : 'Choose'}</span>
                  </button>
                ))}
              </div>
            </section>
            )}

            <section aria-labelledby="cards-title">
              <p className="shop-label">Gift card</p>
              <h2 id="cards-title" className="playfair shop-h2">Any event, any night</h2>
              <p className="shop-sub">Works for every GFC event, dinners included. Never expires.</p>
              <div className="shop-grid shop-grid-4">
                {amounts.map((a) => (
                  <button
                    key={a.amountCents}
                    type="button"
                    className={`shop-tile shop-tile-sm ${product === 'gift' && amount === a.amountCents ? 'on' : ''}`}
                    onClick={() => choose('gift', a.amountCents)}
                    aria-pressed={product === 'gift' && amount === a.amountCents}
                  >
                    {a.bonusCents > 0 && <span className="shop-badge">+{money(a.bonusCents)} bonus</span>}
                    <span className="shop-tile-price">{money(a.amountCents)}</span>
                    <span className="shop-tile-cta">{product === 'gift' && amount === a.amountCents ? '✓ Selected' : 'Choose'}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="shop-order" ref={orderRef} aria-labelledby="order-title">
              <h2 id="order-title" className="playfair shop-h2">Your order</h2>
              {!product ? (
                <p className="shop-muted">{chooseText} above.</p>
              ) : (
                <form onSubmit={pay} noValidate>
                  <p className="shop-order-line">
                    <span>{product === 'gift' ? `${money(amount)} Gift Card` : chosenPass?.name}</span>
                    <strong>{money(priceCents)}</strong>
                  </p>
                  {product === 'gift' && chosenAmount?.bonusCents > 0 && (
                    <p className="shop-bonus">Cyber Monday: you also get a {money(chosenAmount.bonusCents)} bonus card for yourself.</p>
                  )}

                  <fieldset className="shop-toggle">
                    <legend className="sr-only">Who is it for?</legend>
                    <label className={isGift ? 'on' : ''}>
                      <input type="radio" name="for" checked={isGift} onChange={() => setIsGift(true)} /> It's a gift
                    </label>
                    <label className={!isGift ? 'on' : ''}>
                      <input type="radio" name="for" checked={!isGift} onChange={() => setIsGift(false)} /> It's for me
                    </label>
                  </fieldset>

                  {isGift && (
                    <div className="shop-fields">
                      <label>Their name<input value={form.recipientName} onChange={set('recipientName')} autoComplete="off" maxLength={80} required /></label>
                      <label>Their email<input type="email" value={form.recipientEmail} onChange={set('recipientEmail')} autoComplete="off" maxLength={200} required /></label>
                      <label>From<input value={form.fromName} onChange={set('fromName')} placeholder="Your name" maxLength={80} /></label>
                      <label>Send it on<input type="date" value={form.sendDate} min={todayYMD()} onChange={set('sendDate')} /></label>
                      <label className="shop-wide">
                        A note for them <small>(optional)</small>
                        <textarea rows={3} value={form.message} onChange={set('message')} maxLength={400} placeholder="Happy holidays! Let's get out the house." />
                      </label>
                    </div>
                  )}
                  <p className="shop-fine">
                    {isGift
                      ? `We'll email the code to them on ${form.sendDate ? longDate(`${form.sendDate}T12:00:00-05:00`) : 'the date you pick'}, and send you a receipt.`
                      : "We'll email your code right after you pay."}{' '}
                    Final sale, like our tickets.
                  </p>
                  {error && <p className="shop-error" role="alert">{error}</p>}
                  <button type="submit" className="shop-btn shop-btn-navy shop-pay" disabled={busy}>
                    {busy ? 'Connecting to secure checkout…' : `Continue to payment · ${money(priceCents)}`}
                  </button>
                </form>
              )}
            </section>
          </>
        )}

        <section className="shop-two" aria-label="More">
          <div className="shop-card">
            <h2 className="playfair shop-h3">Check a balance</h2>
            <form className="shop-inline" onSubmit={lookUp}>
              <label htmlFor="bal" className="sr-only">Gift card code</label>
              <input id="bal" placeholder="GIFT-XXXX-XXXX" value={balanceCode} onChange={(e) => setBalanceCode(e.target.value.toUpperCase())} />
              <button type="submit" className="shop-btn shop-btn-navy">Check</button>
            </form>
            {balance && (
              <p className={balance.error ? 'shop-error' : 'shop-ok'} aria-live="polite">
                {balance.error ||
                  (balance.status === 'active' ? balance.description : `This ${balance.kind === 'pass' ? 'pass' : 'card'} is ${balance.status}.`)}
                {!balance.error && balance.expiresAt && balance.status === 'active' ? ` Use by ${longDate(balance.expiresAt)}.` : ''}
              </p>
            )}
          </div>
          <div className="shop-card">
            <h2 className="playfair shop-h3">Grown Folks™ merch</h2>
            <p className="shop-muted">Tees and more are coming. Pre-order at the pre-sale price before they're made.</p>
            <Link to="/shop" className="shop-btn shop-btn-gold">See the merch</Link>
          </div>
        </section>

        <section className="shop-faq" aria-labelledby="faq-title">
          <h2 id="faq-title" className="playfair shop-h2">Good to know</h2>
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
        <p className="shop-tagline playfair">Where grown folks come out to play.™</p>
      </main>
    </div>
  );
};

export default Gift;
