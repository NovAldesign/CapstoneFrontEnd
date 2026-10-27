import React from "react";
import "../Styles/VenuePartners.css";

// Venues that host Grown Folks™ nights. Add a partner by adding a row and dropping its logo in /public/partners.
export const VENUE_PARTNERS = [
  {
    name: "Aromas Tea Bar",
    detail: "Located at The Koncept House\nHome of Acoustic & Infused™,\nGame Night and Karaoke Bingo",
    logo: "/partners/aromas-tea-bar.jpg",
  },
];

export default function VenuePartners({ title = "Our Venue Partners", compact = false }) {
  if (!VENUE_PARTNERS.length) return null;
  return (
    <div className={`venue-partners${compact ? " venue-partners--compact" : ""}`}>
      <p className="venue-partners-label">{title}</p>
      <ul className="venue-partners-list">
        {VENUE_PARTNERS.map((p) => {
          const card = (
            <>
              <img src={p.logo} alt={`${p.name} logo`} loading="lazy" />
              <span className="venue-partners-name">{p.name}</span>
              {p.detail && <span className="venue-partners-detail">{p.detail}</span>}
            </>
          );
          return (
            <li key={p.name} className="venue-partners-card">
              {p.url ? (
                <a href={p.url} target="_blank" rel="noopener noreferrer">{card}</a>
              ) : (
                card
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
