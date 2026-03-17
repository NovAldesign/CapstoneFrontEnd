import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import axios from 'axios';
import '../Styles/Checkout.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */
const formatPrice = (cents) => {
  if (cents === 0) return 'Free';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

/* -------------------------------------------------------
   Inner payment form — rendered inside <Elements>
------------------------------------------------------- */
const PaymentForm = ({ order, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setErrorMsg('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        receipt_email: order.buyerEmail,
      },
    });

    if (error) {
      setErrorMsg(error.message || 'Payment failed. Please try again.');
      setProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess();
    } else {
      setErrorMsg('Something went wrong. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="co-order-summary">
        <div className="co-summary-row">
          <span>{order.ticketTypeName} x{order.quantity}</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        {order.discount > 0 && (
          <div className="co-summary-row co-discount">
            <span>Promo ({order.promoCode})</span>
            <span>-{formatPrice(order.discount)}</span>
          </div>
        )}
        <div className="co-summary-row co-total">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="co-stripe-wrap">
        <PaymentElement />
      </div>

      {errorMsg && (
        <div className="co-error" role="alert">{errorMsg}</div>
      )}

      <button
        type="submit"
        className="co-submit-btn"
        disabled={!stripe || processing}
      >
        {processing ? 'Processing...' : `Pay ${formatPrice(order.total)}`}
      </button>
    </form>
  );
};

/* -------------------------------------------------------
   Success screen
------------------------------------------------------- */
const SuccessScreen = ({ event, order, onClose }) => (
  <div className="co-success">
    <div className="co-success-icon">
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="26" r="26" fill="#C5A059" fillOpacity="0.12" />
        <path
          d="M15 26l8 8 14-14"
          stroke="#C5A059"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <h3 className="co-success-heading">You're In.</h3>
    <p className="co-success-sub">
      Confirmation sent to <strong>{order.buyerEmail}</strong>
    </p>
    <div className="co-confirm-code">
      {order.confirmationCode || 'GFC-CONFIRMED'}
    </div>
    <p className="co-success-event">{event.name}</p>
    <button className="co-done-btn" onClick={onClose}>Done</button>
  </div>
);

/* -------------------------------------------------------
   Main Checkout Modal
   Props:
     event   — full event object from MongoDB
     onClose — fn to close the modal
------------------------------------------------------- */
const Checkout = ({ event, onClose }) => {
  const [step, setStep] = useState('select');

  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');

  const [promoInput, setPromoInput] = useState('');
  const [promoData, setPromoData] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const [clientSecret, setClientSecret] = useState('');
  const [order, setOrder] = useState(null);
  const [intentLoading, setIntentLoading] = useState(false);
  const [intentError, setIntentError] = useState('');

  // Auto-select first available ticket type
  useEffect(() => {
    if (event.ticketTypes?.length) {
      const first = event.ticketTypes.find((t) => t.sold < t.quantity);
      if (first) setSelectedTypeId(first._id);
    }
  }, [event]);

  const selectedType = event.ticketTypes?.find((t) => t._id === selectedTypeId);
  const subtotal = selectedType ? selectedType.price * quantity : 0;
  const discountAmt = promoData ? promoData.discount : 0;
  const displayTotal = subtotal - discountAmt;

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError('');
    setPromoData(null);
    setPromoLoading(true);
    try {
      const { data } = await axios.post(
        `${API}/api/events/${event._id}/validate-promo`,
        { code: promoInput.trim(), ticketTypeId: selectedTypeId, quantity }
      );
      setPromoData(data);
    } catch (err) {
      setPromoError(
        err.response?.data?.error || 'Invalid or expired promo code.'
      );
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoData(null);
    setPromoInput('');
    setPromoError('');
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setIntentError('');
    setIntentLoading(true);

    try {
      const { data } = await axios.post(
        `${API}/api/events/${event._id}/create-payment-intent`,
        {
          ticketTypeId: selectedTypeId,
          quantity,
          buyerName,
          buyerEmail,
          promoCode: promoData?.code || undefined,
        }
      );

      setClientSecret(data.clientSecret);
      setOrder({
        ticketTypeName: selectedType?.name,
        quantity,
        subtotal: data.subtotal,
        discount: data.discount,
        total: data.total,
        promoCode: promoData?.code || '',
        buyerEmail,
        confirmationCode: '',
      });
      setStep('payment');
    } catch (err) {
      setIntentError(
        err.response?.data?.error ||
        'Could not start checkout. Please try again.'
      );
    } finally {
      setIntentLoading(false);
    }
  };

  const stripeOptions = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#C5A059',
            colorBackground: '#FFFFFF',
            colorText: '#002147',
            colorDanger: '#DC2626',
            fontFamily: 'Montserrat, sans-serif',
            borderRadius: '0px',
          },
        },
      }
    : null;

  return (
    <div
      className="co-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="co-modal" role="dialog" aria-modal="true">

        {/* Header */}
        <div className="co-header">
          <div>
            <div className="co-header-eyebrow">Secure Checkout</div>
            <div className="co-header-event">{event.name}</div>
          </div>
          <button
            className="co-close"
            onClick={onClose}
            aria-label="Close checkout"
          >
            &#x2715;
          </button>
        </div>

        <div className="co-body">

          {/* STEP 1 — SELECT TICKETS */}
          {step === 'select' && (
            <form onSubmit={(e) => { e.preventDefault(); setStep('details'); }}>

              <div className="co-section-label">Select Tickets</div>
              <div className="co-ticket-list">
                {event.ticketTypes?.map((tt) => {
                  const remaining = tt.quantity - tt.sold;
                  const soldOut = remaining <= 0;
                  return (
                    <label
                      key={tt._id}
                      className={[
                        'co-ticket-option',
                        selectedTypeId === tt._id ? 'selected' : '',
                        soldOut ? 'sold-out' : '',
                      ].filter(Boolean).join(' ')}
                    >
                      <input
                        type="radio"
                        name="ticketType"
                        value={tt._id}
                        checked={selectedTypeId === tt._id}
                        onChange={() => !soldOut && setSelectedTypeId(tt._id)}
                        disabled={soldOut}
                      />
                      <div className="co-ticket-info">
                        <div className="co-ticket-name">{tt.name}</div>
                        {tt.description && (
                          <div className="co-ticket-desc">{tt.description}</div>
                        )}
                        <div className="co-ticket-remaining">
                          {soldOut ? 'Sold out' : `${remaining} remaining`}
                        </div>
                      </div>
                      <div className="co-ticket-price">{formatPrice(tt.price)}</div>
                    </label>
                  );
                })}
              </div>

              {selectedType && (
                <>
                  <div className="co-section-label" style={{ marginTop: '24px' }}>
                    Quantity
                  </div>
                  <div className="co-qty-row">
                    <button
                      type="button"
                      className="co-qty-btn"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      &#8722;
                    </button>
                    <span className="co-qty-num">{quantity}</span>
                    <button
                      type="button"
                      className="co-qty-btn"
                      onClick={() => {
                        const rem = selectedType.quantity - selectedType.sold;
                        setQuantity((q) => Math.min(rem, q + 1));
                      }}
                      disabled={
                        quantity >= selectedType.quantity - selectedType.sold
                      }
                    >
                      &#43;
                    </button>
                  </div>

                  <div className="co-section-label" style={{ marginTop: '24px' }}>
                    Promo Code
                  </div>
                  {promoData ? (
                    <div className="co-promo-applied">
                      <span>
                        &#10003; <strong>{promoData.code}</strong> —{' '}
                        {formatPrice(promoData.discount)} off
                      </span>
                      <button
                        type="button"
                        className="co-promo-remove"
                        onClick={handleRemovePromo}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="co-promo-row">
                      <input
                        type="text"
                        className="co-promo-input"
                        placeholder="Enter promo code"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value.toUpperCase());
                          setPromoError('');
                        }}
                      />
                      <button
                        type="button"
                        className="co-promo-btn"
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoInput.trim()}
                      >
                        {promoLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <div className="co-promo-error">{promoError}</div>
                  )}

                  <div className="co-price-preview">
                    <div className="co-preview-row">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discountAmt > 0 && (
                      <div className="co-preview-row co-discount">
                        <span>Discount</span>
                        <span>-{formatPrice(discountAmt)}</span>
                      </div>
                    )}
                    <div className="co-preview-row co-total">
                      <span>Total</span>
                      <span>{formatPrice(displayTotal)}</span>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="co-next-btn"
                disabled={!selectedTypeId}
              >
                Continue
              </button>
            </form>
          )}

          {/* STEP 2 — BUYER DETAILS */}
          {step === 'details' && (
            <form onSubmit={handleProceedToPayment}>
              <button
                type="button"
                className="co-back-btn"
                onClick={() => setStep('select')}
              >
                &#8592; Back
              </button>

              <div className="co-section-label">Your Details</div>

              <div className="co-field">
                <label className="co-label" htmlFor="buyerName">
                  Full Name
                </label>
                <input
                  id="buyerName"
                  type="text"
                  className="co-input"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Your full name"
                />
              </div>

              <div className="co-field">
                <label className="co-label" htmlFor="buyerEmail">
                  Email Address
                </label>
                <input
                  id="buyerEmail"
                  type="email"
                  className="co-input"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="your@email.com"
                />
                <span className="co-hint">
                  Your ticket confirmation will be sent here.
                </span>
              </div>

              <div className="co-price-preview">
                <div className="co-preview-row">
                  <span>{selectedType?.name} x{quantity}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="co-preview-row co-discount">
                    <span>Promo discount</span>
                    <span>-{formatPrice(discountAmt)}</span>
                  </div>
                )}
                <div className="co-preview-row co-total">
                  <span>Total due today</span>
                  <span>{formatPrice(displayTotal)}</span>
                </div>
              </div>

              {intentError && (
                <div className="co-error" role="alert">
                  {intentError}
                </div>
              )}

              <button
                type="submit"
                className="co-next-btn"
                disabled={intentLoading || !buyerName || !buyerEmail}
              >
                {intentLoading
                  ? 'Preparing checkout...'
                  : 'Proceed to Payment'}
              </button>
            </form>
          )}

          {/* STEP 3 — STRIPE PAYMENT */}
          {step === 'payment' && stripeOptions && (
            <Elements stripe={stripePromise} options={stripeOptions}>
              <button
                type="button"
                className="co-back-btn"
                onClick={() => setStep('details')}
              >
                &#8592; Back
              </button>
              <div className="co-section-label">Payment Details</div>
              <PaymentForm
                order={order}
                onSuccess={() => setStep('success')}
              />
            </Elements>
          )}

          {/* STEP 4 — SUCCESS */}
          {step === 'success' && (
            <SuccessScreen event={event} order={order} onClose={onClose} />
          )}

        </div>
      </div>
    </div>
  );
};

export default Checkout;