import React, { useEffect, useState } from "react";
import { BACKEND_URL } from "../Services/eventUtils";

const SOURCE_LABEL = {
  google: "via Google",
  eventbrite: "via Eventbrite",
  meetup: "via Meetup",
};

const EMPTY = { name: "", email: "", event: "", rating: 5, text: "", canShare: true, website: "" };

const Stars = ({ rating = 5, large = false }) => (
  <div
    className={`testimonial-stars${large ? " large" : ""}`}
    role="img"
    aria-label={`${rating} out of 5 stars`}
  >
    {"★".repeat(rating)}
    <span className="review-star-empty">{"★".repeat(5 - rating)}</span>
  </div>
);

const byline = (r) =>
  [r.name, r.event, SOURCE_LABEL[r.source]].filter(Boolean).join(" · ");

const HomeReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/reviews?limit=4`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]));
  }, []);

  const featured = reviews.find((r) => r.featured) || reviews[0] || null;
  const others = reviews.filter((r) => r._id !== featured?._id).slice(0, 3);

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rating: Number(form.rating) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setSent(true);
      setForm(EMPTY);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="testimonials-section" aria-labelledby="testimonials-heading">
      <div className="testimonials-container">
        <span className="gold-label">Real Voices</span>
        <h2 id="testimonials-heading" className="playfair testimonials-title">
          Don't Take Our Word for It
        </h2>
        <div className="gold-spacer-v2" aria-hidden="true"></div>

        <div className="testimonials-grid">
          {/* Featured review (set it in the admin dashboard, Reviews tab) */}
          {featured && (
          <article className="testimonial-card testimonial-card-featured">
            <div className="testimonial-quote-mark" aria-hidden="true">"</div>
            <blockquote className="testimonial-text review-text">{featured.text}</blockquote>
            <Stars rating={featured.rating} />
            <cite className="testimonial-reviewer">— {byline(featured)}</cite>
          </article>
          )}

          {/* Platform ratings */}
          <div className="testimonial-card testimonial-rating-card" aria-label="Platform ratings">
            <div className="platform-block">
              <p className="rating-platform-name">Eventbrite Verified</p>
              <div className="rating-number">4.8</div>
              <Stars rating={5} large />
              <p className="rating-label">Average event rating</p>
            </div>
            <div className="platform-block">
              <p className="rating-platform-name">Meetup Verified</p>
              <div className="rating-number">4.8</div>
              <Stars rating={5} large />
              <p className="rating-label">Average event rating</p>
            </div>
          </div>
        </div>

        {/* More approved reviews */}
        {others.length > 0 && (
          <div className="reviews-more-grid">
            {others.map((r) => (
              <article key={r._id} className="testimonial-card review-card-small">
                <Stars rating={r.rating} />
                <blockquote className="testimonial-text review-text">{r.text}</blockquote>
                <cite className="testimonial-reviewer">— {byline(r)}</cite>
              </article>
            ))}
          </div>
        )}

        {/* Leave a review */}
        <div className="reviews-actions">
          <p className="testimonials-cta-text">Been to an event? Write the next chapter.</p>
          <div className="reviews-buttons">
            <button
              type="button"
              className="reviews-btn reviews-btn-gold"
              aria-expanded={showForm}
              aria-controls="review-form"
              onClick={() => {
                setShowForm((v) => !v);
                setSent(false);
              }}
            >
              {showForm ? "Close" : "Share your experience"}
            </button>
            <a
              className="reviews-btn reviews-btn-outline"
              href="https://g.page/r/CeZCCIN0CITtEBM/review"
              target="_blank"
              rel="noopener noreferrer"
            >
              Review us on Google
            </a>
          </div>
        </div>

        {showForm && (
          <div id="review-form" className="review-form-wrap">
            {sent ? (
              <p className="review-form-thanks" role="status">
                Thank you! Your review has been sent. We'll post it once we've had a look.
              </p>
            ) : (
              <form className="review-form" onSubmit={submit} noValidate>
                <div className="review-form-row">
                  <label>
                    Your name *
                    <input name="name" value={form.name} onChange={update} maxLength={60} required />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={update}
                      maxLength={120}
                      placeholder="Never shown on the site"
                    />
                  </label>
                </div>
                <div className="review-form-row">
                  <label>
                    Which event?
                    <input
                      name="event"
                      value={form.event}
                      onChange={update}
                      maxLength={80}
                      placeholder="e.g. Game Night"
                    />
                  </label>
                  <label>
                    Rating
                    <select name="rating" value={form.rating} onChange={update}>
                      <option value={5}>★★★★★ Loved it</option>
                      <option value={4}>★★★★ Really good</option>
                      <option value={3}>★★★ It was okay</option>
                      <option value={2}>★★ Not great</option>
                      <option value={1}>★ Didn't enjoy it</option>
                    </select>
                  </label>
                </div>
                <label>
                  Your review *
                  <textarea
                    name="text"
                    value={form.text}
                    onChange={update}
                    rows={5}
                    maxLength={1500}
                    required
                    placeholder="What was the vibe? Who did you meet? Would you come back?"
                  />
                </label>
                {/* Bots fill this in; people never see it */}
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={update}
                  className="review-hp"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />
                <label className="review-check">
                  <input type="checkbox" name="canShare" checked={form.canShare} onChange={update} />
                  It's OK to share my review and first name on the website
                </label>
                {error && (
                  <p className="review-form-error" role="alert">
                    {error}
                  </p>
                )}
                <button type="submit" className="reviews-btn reviews-btn-gold" disabled={sending}>
                  {sending ? "Sending..." : "Send my review"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeReviews;