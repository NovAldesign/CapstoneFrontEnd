import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { currentSource } from "../Services/ticketSources.js";
import { Link } from "react-router-dom";
import { BACKEND_URL, parseCleanPrice, formatMoney } from "../Services/eventUtils";
import { LEGAL } from "../content/legalContent.js";
import { memberPriceCents, creditCoversEvent, memberToken, isMemberTier } from "../Services/memberPricing.js";
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
    // Member ticket types aren't sold on the website (member price comes off automatically)
    return saved.items.filter((i) => !/member/i.test(i.ticketTypeName || ""));
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
// Gift cards (GIFT-…), Holiday Passes (PASS-…) and bonus cards (BONUS-…)
const looksLikeCard = (code = "") => /^(GIFT|PASS|BONUS)-/.test(String(code).trim().toUpperCase());

// How much a gift card or pass takes off. MUST match utilities/giftCards.js cardCredit.
const cardCredit = (info, units) => {
  if (!info) return { creditCents: 0, uses: 0 };
  if (info.kind === "pass") {
    const cap = info.maxCoverCents || 3500;
    const covered = units
      .filter((u) => (info.eligibleEventIds || []).includes(u.eventId))
      .map((u) => Math.min(u.cents, cap))
      .sort((a, b) => b - a)
      .slice(0, info.usesLeft || 0);
    return { creditCents: covered.reduce((s, c) => s + c, 0), uses: covered.length };
  }
  const total = units.reduce((s, u) => s + u.cents, 0);
  return { creditCents: Math.min(info.balanceCents || 0, total), uses: 0 };
};

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
  const [codeEmail, setCodeEmail] = useState(""); // needed for first-visit codes like ACE5
  const [giftCode, setGiftCode] = useState("");
  const [giftInfo, setGiftInfo] = useState(null);
  const [giftError, setGiftError] = useState("");
  // Logged-in member: member price + event credit (null for guests)
  const [memberWallet, setMemberWallet] = useState(null);
  const [useMemberCredit, setUseMemberCredit] = useState(true);

  // Load the member's price and credit balance (again each time the bag opens)
  const refreshWallet = useCallback(() => {
    const token = memberToken();
    if (!token) {
      setMemberWallet(null);
      return;
    }
    fetch(`${BACKEND_URL}/api/member/wallet`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setMemberWallet(data))
      .catch(() => setMemberWallet(null));
  }, []);
  useEffect(() => {
    refreshWallet();
  }, [refreshWallet, isCartOpen]);

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
        if (data.valid && data.kind) {
          // It's a gift card or Holiday Pass: move it to the card slot
          setGiftCode(data.code);
          setPromoCode("");
          return;
        }
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

  // Check the gift card / pass against the events in the bag
  useEffect(() => {
    if (!giftCode) {
      setGiftInfo(null);
      setGiftError("");
      return;
    }
    let active = true;
    fetch(`${BACKEND_URL}/api/promo-codes/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: giftCode, eventIds: eventIdsKey ? eventIdsKey.split(",") : [] }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.valid && data.kind) {
          setGiftInfo(data);
          setGiftError("");
        } else {
          setGiftInfo(null);
          setGiftError(data.error || "That gift card isn't valid.");
        }
      })
      .catch(() => active && setGiftError("Couldn't check that card. Please try again."));
    return () => {
      active = false;
    };
  }, [giftCode, eventIdsKey]);

  const applyPromoCode = (code) => {
    const clean = String(code || "").trim().toUpperCase().replace(/\s+/g, "");
    if (looksLikeCard(clean)) setGiftCode(clean);
    else setPromoCode(clean);
  };
  const removePromoCode = () => setPromoCode("");
  const removeGiftCode = () => setGiftCode("");

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
    if (isMemberTier(ticketType)) return; // member price comes off automatically in the bag
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
    const fullSubtotalInCents = cartItems.reduce((sum, i) => sum + i.priceInCents * i.quantity, 0);
    // Member price first (same as the backend), then codes, bundle, credit, gift card
    const price = (i) => memberPriceCents(memberWallet, i.priceInCents, i.eventName);
    const memberSavingsInCents = cartItems.reduce((sum, i) => sum + (i.priceInCents - price(i)) * i.quantity, 0);
    const subtotalInCents = fullSubtotalInCents - memberSavingsInCents;
    let afterCodeInCents;
    if (promoInfo?.oncePerOrder) {
      // code comes off ONE ticket (the first one it works for)
      const first = cartItems.find(codeEligible);
      afterCodeInCents = subtotalInCents - (first ? price(first) - applyCode(promoInfo, price(first)) : 0);
    } else {
      afterCodeInCents = cartItems.reduce(
        (sum, i) => sum + (codeEligible(i) ? applyCode(promoInfo, price(i)) : price(i)) * i.quantity,
        0
      );
    }
    const codeSavingsInCents = subtotalInCents - afterCodeInCents;
    const discountInCents = Math.round(afterCodeInCents * rate);
    const beforeCardInCents = afterCodeInCents - discountInCents;

    // One entry per ticket, priced like the backend (code, then bundle), for gift cards and passes
    const units = [];
    const onceItem = promoInfo?.oncePerOrder ? cartItems.find(codeEligible) : null;
    cartItems.forEach((i) => {
      for (let q = 0; q < i.quantity; q++) {
        let cents = price(i);
        if (codeEligible(i)) {
          if (!promoInfo.oncePerOrder) cents = applyCode(promoInfo, cents);
          else if (i === onceItem && q === 0) cents = applyCode(promoInfo, cents);
        }
        units.push({ cents: Math.round(cents * (1 - rate)), eventId: i.eventId, name: i.eventName });
      }
    });
    // Member event credit (eligible events only), taken off those tickets before the gift card
    const creditBalanceInCents = memberWallet?.balanceCents || 0;
    const creditEligibleInCents = units.filter((u) => creditCoversEvent(u.name)).reduce((s, u) => s + u.cents, 0);
    const memberCreditInCents = useMemberCredit ? Math.min(creditBalanceInCents, creditEligibleInCents) : 0;
    let creditLeft = memberCreditInCents;
    units.forEach((u) => {
      if (creditLeft <= 0 || !creditCoversEvent(u.name)) return;
      const take = Math.min(creditLeft, u.cents);
      u.cents -= take;
      creditLeft -= take;
    });
    const { creditCents: giftCreditInCents, uses: passUses } = cardCredit(giftInfo, units.filter((u) => u.cents > 0));
    const totalInCents = Math.max(0, beforeCardInCents - memberCreditInCents - giftCreditInCents);
    return {
      fullSubtotalInCents,
      memberSavingsInCents,
      memberCreditInCents,
      creditBalanceInCents,
      creditEligibleInCents,
      giftCreditInCents,
      passUses,
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
  }, [cartItems, promoInfo, giftInfo, memberWallet, useMemberCredit]);

  // Send the bag to Stripe (backend re-checks every price and ticket)
  const checkout = async ({ agreedToTerms = false } = {}) => {
    if (!cartItems.length) return;
    if (!agreedToTerms) {
      alert("Please agree to the Terms, Refund Policy, and Participation Waiver first.");
      return;
    }
    const needsEmail = promoApplies && (promoInfo?.needsEmail || promoInfo?.firstTimeOnly);
    if (needsEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(codeEmail.trim())) {
      alert(`Enter your email in the bag to use ${promoInfo.code}.`);
      return;
    }
    setCheckoutLoading(true);
    try {
      const token = memberToken();
      const res = await fetch(`${BACKEND_URL}/api/events/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({
          useMemberCredit: token ? useMemberCredit : undefined,
          customerEmail: needsEmail ? codeEmail.trim() : undefined,
          cartItems: cartItems.filter((i) => !isMemberTier({ name: i.ticketTypeName })),
          promoCode: promoApplies ? promoInfo.code : undefined,
          giftCode: giftInfo && totals.giftCreditInCents > 0 ? giftInfo.code : undefined,
          agreedToTerms: true,
          termsVersion: LEGAL.waiverVersion,
          source: currentSource(),
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
    codeEmail,
    setCodeEmail,
    promoError,
    promoChecking,
    promoApplies,
    applyPromoCode,
    removePromoCode,
    giftCode,
    giftInfo,
    giftError,
    removeGiftCode,
    memberWallet,
    useMemberCredit,
    setUseMemberCredit,
    memberPrice: (cents, eventName) => memberPriceCents(memberWallet, cents, eventName),
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
    codeEmail, setCodeEmail,
    giftCode, giftInfo, giftError, removeGiftCode, giftCreditInCents, passUses,
    memberWallet, useMemberCredit, setUseMemberCredit, memberPrice,
    fullSubtotalInCents, memberSavingsInCents, memberCreditInCents, creditBalanceInCents, creditEligibleInCents,
  } = useCart();
  const [codeInput, setCodeInput] = useState("");
  const [showCodeBox, setShowCodeBox] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const closeBtnRef = useRef(null);

  // Nudge toward the next discount level (based on DIFFERENT events)
  const nudge =
    uniqueEventCount === 1
      ? "Add a different event and save 5% on your whole order."
      : uniqueEventCount === 2
        ? "Add one more different event and save 10% on your whole order."
        : null;

  // Keyboard: focus moves into the bag when it opens, Esc closes it,
  // and focus goes back to where you were when it closes
  useEffect(() => {
    if (!isCartOpen) return;
    const previous = document.activeElement;
    closeBtnRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && setIsCartOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (previous && typeof previous.focus === "function" && document.contains(previous)) previous.focus();
    };
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
              <button ref={closeBtnRef} className="gfc-icon-btn" onClick={() => setIsCartOpen(false)} aria-label="Close bag">
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
                        {memberPrice(item.priceInCents, item.eventName) < item.priceInCents && (
                          <s className="gfc-bag-item-was">{formatMoney((item.priceInCents * item.quantity) / 100)}</s>
                        )}
                        {formatMoney((memberPrice(item.priceInCents, item.eventName) * item.quantity) / 100)}
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
                  ) : null}
                  {promoCode && promoApplies && (promoInfo?.needsEmail || promoInfo?.firstTimeOnly) && (
                    <div className="gfc-code-email">
                      <label htmlFor="gfc-code-email">{promoInfo?.firstTimeOnly ? "Your email (this code is for first-time guests)" : "Your email (we'll send your ticket here)"}</label>
                      <input
                        id="gfc-code-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@email.com"
                        value={codeEmail}
                        onChange={(e) => setCodeEmail(e.target.value)}
                      />
                    </div>
                  )}
                  {giftCode ? (
                    <div className="gfc-code-applied" aria-live="polite">
                      <span>
                        {giftInfo
                          ? giftCreditInCents > 0
                            ? `✓ ${giftInfo.description}`
                            : giftInfo.kind === "pass"
                              ? "Your Holiday Pass works for Game Night, Karaoke Bingo and Acoustic & Infused"
                              : giftInfo.description
                          : giftError || `Checking ${giftCode}…`}
                      </span>
                      <button type="button" className="gfc-link-btn" onClick={removeGiftCode}>
                        Remove
                      </button>
                    </div>
                  ) : null}
                  {promoCode && giftCode ? null : showCodeBox ? (
                    <form
                      className="gfc-code-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (codeInput.trim()) applyPromoCode(codeInput);
                        setCodeInput("");
                      }}
                    >
                      <label htmlFor="gfc-code-input" className="sr-only">Ticket code, gift card or Holiday Pass</label>
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
                      {promoCode || giftCode ? "Add another code" : "Have a code or gift card?"}
                    </button>
                  )}
                </div>

                {/* Member price + event credit */}
                {memberWallet ? (
                  <div className="gfc-member-box">
                    <div className="gfc-member-box-head">
                      {memberWallet.tier === "Founding" ? "Founding Member" : "Social Pass"} · {memberWallet.firstName}
                    </div>
                    {!memberWallet.memberPricing && (
                      <p className="gfc-member-box-note">
                        Member pricing is off while your membership is {memberWallet.status}. You can still use your event credit.
                      </p>
                    )}
                    {creditBalanceInCents > 0 && (
                      <label className="gfc-member-credit-toggle">
                        <input
                          type="checkbox"
                          checked={useMemberCredit}
                          onChange={(e) => setUseMemberCredit(e.target.checked)}
                        />
                        <span>Use my event credit (${(creditBalanceInCents / 100).toFixed(2)} available)</span>
                      </label>
                    )}
                    {creditBalanceInCents > 0 && creditEligibleInCents === 0 && (
                      <p className="gfc-member-box-note">
                        Event credit works on Game Night, Karaoke Bingo and Acoustic &amp; Infused tickets.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="gfc-member-box-note">
                    Member? <Link to="/login" onClick={() => setIsCartOpen(false)}>Log in</Link> for your member price and event credit.
                  </p>
                )}

                <div className="gfc-total-row muted">
                  <span>Subtotal</span>
                  <span>${(fullSubtotalInCents / 100).toFixed(2)}</span>
                </div>
                {memberSavingsInCents > 0 && (
                  <div className="gfc-total-row savings">
                    <span>Member pricing</span>
                    <span>− ${(memberSavingsInCents / 100).toFixed(2)}</span>
                  </div>
                )}
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
                {memberCreditInCents > 0 && (
                  <div className="gfc-total-row savings">
                    <span>Member event credit</span>
                    <span>− ${(memberCreditInCents / 100).toFixed(2)}</span>
                  </div>
                )}
                {giftCreditInCents > 0 && (
                  <div className="gfc-total-row savings">
                    <span>{giftInfo?.kind === "pass" ? `Holiday Pass (${passUses} ${passUses === 1 ? "ticket" : "tickets"})` : "Gift card"}</span>
                    <span>− ${(giftCreditInCents / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="gfc-total-row grand">
                  <span>Total</span>
                  <span>${(totalInCents / 100).toFixed(2)}</span>
                </div>
                <label className="gfc-agree">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <span>
                    I accept the{" "}
                    <a href="/terms" target="_blank" rel="noopener noreferrer">Terms</a>,{" "}
                    <a href="/refund-policy" target="_blank" rel="noopener noreferrer">Refund Policy</a> (all sales are final),{" "}
                    <a href="/code-of-conduct" target="_blank" rel="noopener noreferrer">Code of Conduct</a>, and{" "}
                    <a href="/waiver" target="_blank" rel="noopener noreferrer">Participation Waiver</a>{" "}
                    for myself and every guest I'm buying tickets for.
                  </span>
                </label>
                <button
                  className="gfc-btn-primary full"
                  onClick={() => checkout({ agreedToTerms: agreed })}
                  disabled={checkoutLoading || !agreed}
                  aria-describedby={!agreed ? "gfc-agree-hint" : undefined}
                >
                  {checkoutLoading ? "Connecting to Stripe..." : "Proceed to Secure Checkout"}
                </button>
                {!agreed && (
                  <p id="gfc-agree-hint" className="gfc-agree-hint">Check the box above to continue.</p>
                )}
                <p className="gfc-agree-hint">
                  Need an accommodation? <a href="/accessibility" target="_blank" rel="noopener noreferrer">Let us know</a>.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
};