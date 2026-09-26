import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BACKEND_URL, parseCleanPrice, formatMoney } from "../Services/eventUtils";
import "../Styles/EventListing.css";

const CartContext = createContext(null);

const STORAGE_KEY = "gfc_event_cart";
const CODE_KEY = "gfc_ticket_code";
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // saved bags expire after 24 hours

// Read the saved bag once, before the first render (no race with saving)
const loadSaved = () => {
  try {
    // Empty the bag after a successful purchase
    if (window.location.pathname === "/events/success") return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const saved = JSON.parse(raw);
    // Old format was a plain array with no timestamp — start fresh
    if (!saved || !Array.isArray(saved.items)) return [];
    if (Date.now() - (saved.savedAt || 0) > MAX_AGE_MS) return [];
    return saved.items;
  } catch {
    return [];
  }
};

// Ticket code from a share link (?code=JASMINE) or saved from a past visit
const loadCode = () => {
  try {
    const fromLink = new URLSearchParams(window.location.search).get("code");
    if (fromLink) return fromLink.trim().toUpperCase().replace(/\s+/g, "");
    return localStorage.getItem(CODE_KEY) || "";
  } catch {
    return "";
  }
};

// Price of one ticket after a code. MUST match utilities/promoCodes.js on the backend.
const applyCode = (info, cents) => {
  if (!info) return cents;
  if (info.type === "percent") return Math.max(0, Math.round(cents * (1 - info.value / 100)));
  if (info.type === "amount") return Math.max(0, cents - Math.round(info.value * 100));
  return cents;
};

// Bundle discount — based on DIFFERENT events. MUST match the backend checkout route.
const getDiscount = (uniqueEventCount) => {
  if (uniqueEventCount >= 3) return { rate: 0.10, label: "10% Mega-Bundle Discount Applied!" };
  if (uniqueEventCount === 2) return { rate: 0.05, label: "5% Multi-Event Discount Applied!" };
  return { rate: 0, label: "" };
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(loadSaved);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [promoCode, setPromoCode] = useState(loadCode);
  const [promoInfo, setPromoInfo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [promoChecking, setPromoChecking] = useState(false);

  // Remember the code for this visitor
  useEffect(() => {
    try {
      if (promoCode) localStorage.setItem(CODE_KEY, promoCode);
      else localStorage.removeItem(CODE_KEY);
    } catch {
      /* storage unavailable */
    }
  }, [promoCode]);

  // Check the code against the events in the bag
  const eventIdsKey = [...new Set(cartItems.map((i) => i.eventId))].sort().join(",");
  useEffect(() => {
    if (!promoCode) {
      setPromoInfo(null);
      setPromoError("");
      return;
    }
    let active = true;
    setPromoChecking(true);
    fetch(`${BACKEND_URL}/api/promo-codes/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoCode, eventIds: eventIdsKey ? eventIdsKey.split(",") : [] }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.valid) {
          setPromoInfo(data);
          setPromoError("");
        } else {
          setPromoInfo(null);
          setPromoError(data.error || "That code isn't valid.");
        }
      })
      .catch(() => {
        if (!active) return;
        setPromoInfo(null);
        setPromoError("Couldn't check that code. Please try again.");
      })
      .finally(() => active && setPromoChecking(false));
    return () => {
      active = false;
    };
  }, [promoCode, eventIdsKey]);

  const applyPromoCode = (code) =>
    setPromoCode(String(code || "").trim().toUpperCase().replace(/\s+/g, ""));
  const removePromoCode = () => setPromoCode("");

  // Save the bag whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), items: cartItems }));
    } catch {
      /* storage unavailable — bag still works in memory */
    }
  }, [cartItems]);

  // Add one ticket (never edits existing items in place)
  const addToCart = (event, ticketType) => {
    const eventId = String(event._id || event.eventbriteId);
    const ticketTypeId = String(ticketType._id || ticketType.id || "standard-pass");

    setCartItems((prev) => {
      const exists = prev.some((i) => i.eventId === eventId && i.ticketTypeId === ticketTypeId);
      if (exists) {
        return prev.map((i) =>
          i.eventId === eventId && i.ticketTypeId === ticketTypeId
            ? { ...i, quantity: Math.min(i.quantity + 1, 20) }
            : i
        );
      }
      return [
        ...prev,
        {
          eventId,
          eventName: event.title || event.name,
          ticketTypeId,
          ticketTypeName: ticketType.name,
          // Database stores dollars (30 = $30.00) → convert to cents
          priceInCents: Math.round(parseCleanPrice(ticketType) * 100),
          quantity: 1,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (eventId, ticketTypeId) =>
    setCartItems((prev) => prev.filter((i) => !(i.eventId === eventId && i.ticketTypeId === ticketTypeId)));

  // Set an exact quantity (0 or less removes it)
  const updateQuantity = (eventId, ticketTypeId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(eventId, ticketTypeId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) =>
        i.eventId === eventId && i.ticketTypeId === ticketTypeId
          ? { ...i, quantity: Math.min(newQty, 20) }
          : i
      )
    );
  };

  // Stable function so the Success page doesn't clear the bag in a loop
  const clearCart = useCallback(
    () => setCartItems((prev) => (prev.length ? [] : prev)),
    []
  );

  // Which bag items the code works for
  const codeEligible = (item) =>
    Boolean(promoInfo) &&
    (promoInfo.appliesToAllEvents || (promoInfo.eligibleEventIds || []).includes(item.eventId));
  const promoApplies = Boolean(promoInfo) && cartItems.some(codeEligible);

  // Totals (in cents). Code discount first, then the bundle discount (same as the backend).
  const totals = useMemo(() => {
    const uniqueEventCount = new Set(cartItems.map((i) => i.eventId)).size;
    const { rate, label } = getDiscount(uniqueEventCount);
    const subtotalInCents = cartItems.reduce((sum, i) => sum + i.priceInCents * i.quantity, 0);
    const afterCodeInCents = cartItems.reduce(
      (sum, i) => sum + (codeEligible(i) ? applyCode(promoInfo, i.priceInCents) : i.priceInCents) * i.quantity,
      0
    );
    const codeSavingsInCents = subtotalInCents - afterCodeInCents;
    const discountInCents = Math.round(afterCodeInCents * rate);
    const totalInCents = afterCodeInCents - discountInCents;
    return {
      uniqueEventCount,
      discountRate: rate,
      discountLabel: label,
      subtotalInCents,
      codeSavingsInCents,
      discountInCents,
      totalInCents,
      itemCount: cartItems.reduce((sum, i) => sum + i.quantity, 0),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, promoInfo]);

  // Send the bag to Stripe (backend re-checks every price and ticket)
  const checkout = async () => {
    if (!cartItems.length) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/events/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: undefined,
          cartItems,
          promoCode: promoApplies ? promoInfo.code : undefined,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to initialize checkout gateway.");
      }
    } catch (err) {
      console.error("Stripe Checkout Error:", err);
      alert("Could not establish communication with checkout servers.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const value = {
    cartItems,
    cart: cartItems, // alias used by the new Events pages
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    checkout,
    checkoutLoading,
    promoCode,
    promoInfo,
    promoError,
    promoChecking,
    promoApplies,
    applyPromoCode,
    removePromoCode,
    ...totals,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
};

// Custom hook to use the cart anywhere on the site
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider element.");
  }
  return context;
};

// ── FLOATING BAG BUTTON + SIDE DRAWER ────────────────────────
const CartDrawer = () => {
  const {
    cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart,
    checkout, checkoutLoading, itemCount, subtotalInCents, discountInCents,
    totalInCents, discountRate, discountLabel, uniqueEventCount,
    promoCode, promoInfo, promoError, promoChecking, promoApplies,
    applyPromoCode, removePromoCode, codeSavingsInCents,
  } = useCart();
  const [codeInput, setCodeInput] = useState("");
  const [showCodeBox, setShowCodeBox] = useState(false);

  // Nudge toward the next discount level (based on DIFFERENT events)
  const nudge =
    uniqueEventCount === 1
      ? "Add a different event and save 5% on your whole order."
      : uniqueEventCount === 2
        ? "Add one more different event and save 10% on your whole order."
        : null;

  useEffect(() => {
    if (!isCartOpen) return;
    const onKey = (e) => e.key === "Escape" && setIsCartOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isCartOpen, setIsCartOpen]);

  return (
    <>
      {cartItems.length > 0 && !isCartOpen && (
        <button
          className="gfc-bag-fab"
          onClick={() => setIsCartOpen(true)}
          aria-label={`Open your bag, ${itemCount} ticket${itemCount === 1 ? "" : "s"}`}
        >
          <span aria-hidden="true">👜</span>
          <span className="gfc-bag-fab-count">{itemCount}</span>
        </button>
      )}

      {isCartOpen && (
        <div className="gfc-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <aside
            className="gfc-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gfc-drawer-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gfc-drawer-head">
              <h3 id="gfc-drawer-title" className="playfair">Your Bag</h3>
              <button className="gfc-icon-btn" onClick={() => setIsCartOpen(false)} aria-label="Close bag">
                ✕
              </button>
            </div>

            <div className="gfc-drawer-body">
              {cartItems.length === 0 ? (
                <p className="gfc-drawer-empty">Your bag is empty.</p>
              ) : (
                cartItems.map((item) => (
                  <div key={`${item.eventId}-${item.ticketTypeId}`} className="gfc-bag-item">
                    <div className="gfc-bag-item-name">{item.eventName}</div>
                    <div className="gfc-bag-item-tier">{item.ticketTypeName}</div>
                    <div className="gfc-bag-item-row">
                      <div className="gfc-qty" role="group" aria-label={`Quantity for ${item.ticketTypeName}`}>
                        <button
                          onClick={() => updateQuantity(item.eventId, item.ticketTypeId, item.quantity - 1)}
                          aria-label="Remove one"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.eventId, item.ticketTypeId, item.quantity + 1)}
                          aria-label="Add one"
                        >
                          +
                        </button>
                      </div>
                      <span className="gfc-bag-item-price">
                        {formatMoney((item.priceInCents * item.quantity) / 100)}
                      </span>
                    </div>
                    <button
                      className="gfc-link-btn danger"
                      onClick={() => removeFromCart(item.eventId, item.ticketTypeId)}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="gfc-drawer-foot">
                {nudge && (
                  <div className="gfc-bag-nudge">
                    <span>{nudge}</span>
                    <Link to="/events" onClick={() => setIsCartOpen(false)}>
                      Browse events →
                    </Link>
                  </div>
                )}
                {discountLabel && <div className="gfc-discount-note">{discountLabel}</div>}

                {/* Ticket code */}
                <div className="gfc-code">
                  {promoCode ? (
                    <div className="gfc-code-applied" aria-live="polite">
                      <span>
                        {promoChecking
                          ? `Checking ${promoCode}…`
                          : promoApplies
                            ? `✓ ${promoCode}: ${promoInfo.description}`
                            : promoInfo
                              ? `${promoCode} doesn't apply to the events in your bag`
                              : promoError || `Code ${promoCode}`}
                      </span>
                      <button type="button" className="gfc-link-btn" onClick={removePromoCode}>
                        Remove
                      </button>
                    </div>
                  ) : showCodeBox ? (
                    <form
                      className="gfc-code-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (codeInput.trim()) applyPromoCode(codeInput);
                        setCodeInput("");
                      }}
                    >
                      <label htmlFor="gfc-code-input" className="sr-only">Ticket code</label>
                      <input
                        id="gfc-code-input"
                        type="text"
                        placeholder="Enter code"
                        autoComplete="off"
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value)}
                      />
                      <button type="submit" className="gfc-code-apply">Apply</button>
                    </form>
                  ) : (
                    <button type="button" className="gfc-link-btn" onClick={() => setShowCodeBox(true)}>
                      Have a code?
                    </button>
                  )}
                </div>

                <div className="gfc-total-row muted">
                  <span>Subtotal</span>
                  <span>${(subtotalInCents / 100).toFixed(2)}</span>
                </div>
                {promoApplies && codeSavingsInCents > 0 && (
                  <div className="gfc-total-row savings">
                    <span>Code {promoCode}</span>
                    <span>− ${(codeSavingsInCents / 100).toFixed(2)}</span>
                  </div>
                )}
                {discountRate > 0 && (
                  <div className="gfc-total-row savings">
                    <span>Discount ({Math.round(discountRate * 100)}%)</span>
                    <span>− ${(discountInCents / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="gfc-total-row grand">
                  <span>Total</span>
                  <span>${(totalInCents / 100).toFixed(2)}</span>
                </div>
                <button className="gfc-btn-primary full" onClick={checkout} disabled={checkoutLoading}>
                  {checkoutLoading ? "Connecting to Stripe..." : "Proceed to Secure Checkout"}
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
};