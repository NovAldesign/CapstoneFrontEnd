import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BACKEND_URL, parseCleanPrice, formatMoney } from "../Services/eventUtils";
import "../Styles/EventListing.css";

const CartContext = createContext(null);

const STORAGE_KEY = "gfc_event_cart";
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

  // Totals (in cents)
  const totals = useMemo(() => {
    const uniqueEventCount = new Set(cartItems.map((i) => i.eventId)).size;
    const { rate, label } = getDiscount(uniqueEventCount);
    const subtotalInCents = cartItems.reduce((sum, i) => sum + i.priceInCents * i.quantity, 0);
    const discountInCents = Math.round(subtotalInCents * rate);
    const totalInCents = subtotalInCents - discountInCents;
    return {
      uniqueEventCount,
      discountRate: rate,
      discountLabel: label,
      subtotalInCents,
      discountInCents,
      totalInCents,
      itemCount: cartItems.reduce((sum, i) => sum + i.quantity, 0),
    };
  }, [cartItems]);

  // Send the bag to Stripe (backend re-checks every price and ticket)
  const checkout = async () => {
    if (!cartItems.length) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/events/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerEmail: undefined, cartItems }),
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
  } = useCart();

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
                <div className="gfc-total-row muted">
                  <span>Subtotal</span>
                  <span>${(subtotalInCents / 100).toFixed(2)}</span>
                </div>
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
