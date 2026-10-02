import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BACKEND_URL } from "../Services/eventUtils";

// Partnerships page: "Member Perks" program for local businesses
// that want to offer Grown Folks™ Collective members a discount.

const CATEGORIES = [
  "Food & Drink",
  "Coffee & Tea",
  "Health & Wellness",
  "Beauty & Self-Care",
  "Fitness",
  "Shopping & Retail",
  "Entertainment & Activities",
  "Travel & Hospitality",
  "Professional Services",
  "Other",
];

const EMPTY = {
  businessName: "",
  contactName: "",
  email: "",
  phone: "",
  website: "",
  category: "",
  where: "in-store",
  address: "",
  offerType: "percent",
  offer: "",
  redeem: "show-membership",
  promoCode: "",
  finePrint: "",
  startDate: "",
  endDate: "",
  agreed: false,
  website2: "", // honeypot
};

const OFFER_HINT = {
  percent: "e.g. 15% off your order",
  dollar: "e.g. $10 off any service over $50",
  freebie: "e.g. Free dessert with any entrée",
  other: "Describe the perk",
};

const MemberPerksPartner = ({ standalone = false }) => {
  const [params] = useSearchParams();
  const [open, setOpen] = useState(standalone || params.get("perk") === "1");
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const update = (e) => {
    if (error) setError("");
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.businessName.trim() || !form.contactName.trim() || !form.email.trim() || !form.offer.trim()) {
      return setError("Please add your business name, your name, email, and the discount.");
    }
    if (form.where !== "online" && !form.address.trim()) {
      return setError("Please add the address where members can use the discount.");
    }
    if (form.redeem === "promo-code" && !form.promoCode.trim()) {
      return setError("Please add the promo code members should use.");
    }
    if (form.endDate && form.startDate && form.endDate < form.startDate) {
      return setError("The end date is before the start date.");
    }
    if (!form.agreed) {
      return setError("Please confirm you can offer and honor this discount.");
    }
    setSending(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/discount-partners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: params.get("src") || "partnerships-page" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setDone(true);
      document.getElementById("member-perks")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className={`perks-section ${standalone ? "is-standalone" : ""}`} id="member-perks" aria-label="Member Perks">
      <div className="perks-inner">
        {!standalone && (
          <>
            <span className="location-tag">Free to Join</span>
            <h2 id="perks-title" className="playfair section-title perks-title">Offer a Member Perk</h2>
            <p className="perks-lead">
              Give Grown Folks™ Collective members an exclusive discount and get your business in front of
              Atlanta adults 30+ who love to support local. No fee, no contract.
            </p>
          </>
        )}

        <div className="perks-grid">
          <div className="perks-card">
            <h3 className="playfair">What you get</h3>
            <ul className="perks-list">
              <li>A spot on our Member Perks list, which every member sees</li>
              <li>A feature in our newsletter</li>
              <li>A shout-out on our socials</li>
              <li>New customers who already trust the Collective</li>
            </ul>
          </div>
          <div className="perks-card">
            <h3 className="playfair">How it works</h3>
            <ol className="perks-steps">
              <li><strong>Tell us your offer</strong> and how members redeem it.</li>
              <li><strong>We review it</strong> within 3 business days and confirm the details with you.</li>
              <li><strong>You go live.</strong> Members show their membership or use your code.</li>
              <li><strong>Update or pause</strong> anytime. Just give us 14 days' notice to end it.</li>
            </ol>
          </div>
        </div>

        {done ? (
          <div className="perks-done" role="status">
            <p className="playfair perks-done-title">Thank you! We got your perk.</p>
            <p>
              We'll review it within 3 business days and confirm the details with you before it goes live.
              Check your inbox for a confirmation.
            </p>
          </div>
        ) : !open ? (
          <button type="button" className="gold-submit-btn perks-open-btn" onClick={() => setOpen(true)}>
            Offer a Member Discount
          </button>
        ) : (
          <form className="luxe-form perks-form" id="perk-form" onSubmit={submit} noValidate>
            {standalone && <h2 className="playfair perks-form-title">Tell us about your perk</h2>}
            <fieldset className="perks-fieldset">
              <legend>Your business</legend>
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="mp-business">Business name</label>
                  <input id="mp-business" name="businessName" value={form.businessName} onChange={update} maxLength={120} required />
                </div>
                <div className="input-group">
                  <label htmlFor="mp-category">Category</label>
                  <select id="mp-category" name="category" value={form.category} onChange={update}>
                    <option value="">Select...</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="mp-contact">Your name</label>
                  <input id="mp-contact" name="contactName" value={form.contactName} onChange={update} maxLength={80} autoComplete="name" required />
                </div>
                <div className="input-group">
                  <label htmlFor="mp-email">Email</label>
                  <input id="mp-email" type="email" name="email" value={form.email} onChange={update} maxLength={120} autoComplete="email" required />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="mp-phone">Phone (optional)</label>
                  <input id="mp-phone" type="tel" name="phone" value={form.phone} onChange={update} maxLength={30} autoComplete="tel" />
                </div>
                <div className="input-group">
                  <label htmlFor="mp-web">Website or Instagram</label>
                  <input id="mp-web" name="website" value={form.website} onChange={update} maxLength={200} placeholder="yourbusiness.com or @yourbusiness" />
                </div>
              </div>
            </fieldset>

            <fieldset className="perks-fieldset">
              <legend>The discount</legend>
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="mp-type">Type of perk</label>
                  <select id="mp-type" name="offerType" value={form.offerType} onChange={update}>
                    <option value="percent">Percent off</option>
                    <option value="dollar">Dollar amount off</option>
                    <option value="freebie">Free item or add-on</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="input-group">
                  <label htmlFor="mp-offer">The discount</label>
                  <input id="mp-offer" name="offer" value={form.offer} onChange={update} maxLength={160} placeholder={OFFER_HINT[form.offerType]} required />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="mp-start">Starts (optional)</label>
                  <input id="mp-start" type="date" name="startDate" value={form.startDate} min={today} onChange={update} />
                </div>
                <div className="input-group">
                  <label htmlFor="mp-end">Ends (leave blank if ongoing)</label>
                  <input id="mp-end" type="date" name="endDate" value={form.endDate} min={form.startDate || today} onChange={update} />
                </div>
              </div>
            </fieldset>

            <fieldset className="perks-fieldset">
              <legend>How members use it</legend>
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="mp-where">Where</label>
                  <select id="mp-where" name="where" value={form.where} onChange={update}>
                    <option value="in-store">In person</option>
                    <option value="online">Online</option>
                    <option value="both">In person and online</option>
                  </select>
                </div>
                <div className="input-group">
                  <label htmlFor="mp-redeem">How they redeem it</label>
                  <select id="mp-redeem" name="redeem" value={form.redeem} onChange={update}>
                    <option value="show-membership">Show their GFC membership</option>
                    <option value="promo-code">Use a promo code</option>
                    <option value="mention">Mention Grown Folks Collective</option>
                    <option value="other">Other (explain below)</option>
                  </select>
                </div>
              </div>
              {(form.where !== "online" || form.redeem === "promo-code") && (
                <div className="form-row">
                  {form.where !== "online" ? (
                    <div className="input-group">
                      <label htmlFor="mp-address">Address</label>
                      <input id="mp-address" name="address" value={form.address} onChange={update} maxLength={200} placeholder="Street, city" autoComplete="street-address" />
                    </div>
                  ) : <div />}
                  {form.redeem === "promo-code" ? (
                    <div className="input-group">
                      <label htmlFor="mp-code">Promo code</label>
                      <input id="mp-code" name="promoCode" value={form.promoCode} onChange={update} maxLength={40} placeholder="e.g. GROWNFOLKS15" />
                    </div>
                  ) : <div />}
                </div>
              )}
              <div className="input-group">
                <label htmlFor="mp-fine">Fine print (optional)</label>
                <textarea
                  id="mp-fine"
                  name="finePrint"
                  value={form.finePrint}
                  onChange={update}
                  rows={3}
                  maxLength={1000}
                  placeholder="Anything members should know: minimum purchase, days or times, exclusions, one use per visit..."
                />
              </div>
            </fieldset>

            <label className="perks-agree">
              <input type="checkbox" name="agreed" checked={form.agreed} onChange={update} />
              <span>
                I'm authorized to offer this discount for my business, and I'll honor it for active Grown Folks™ Collective
                members while it's listed. I can update or end it anytime with 14 days' notice.
              </span>
            </label>

            <input type="text" name="website2" value={form.website2} onChange={update} className="perks-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />

            {error && <p className="perks-error" role="alert">{error}</p>}

            <button type="submit" className="gold-submit-btn" disabled={sending}>
              {sending ? "Sending..." : "Submit My Member Perk"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default MemberPerksPartner;
