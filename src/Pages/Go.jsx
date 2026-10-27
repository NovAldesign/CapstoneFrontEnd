import { useEffect } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { BACKEND_URL } from "../Services/eventUtils";

// ── Short links: grownfolkscollective.com/go/oct10 ──
// Easy to say, type and share. Anything after ? is kept, so
// /go/oct30?code=ARIA and /go/oct10?src=threads still work.
// To add a link: add a line below ("code": "where it goes").
// Every click is counted (Dashboard → Reports → Short link clicks). Add ?src=name to see who opened it.
const LINKS = {
  // Upcoming events
  oct10: "/events/grown-folks-game-night-spades-spades-and-more-spades-30-6aa645349e0da510aa0c0ea7",
  oct17: "/events/gfc-karaoke-bingo-90s-and-2000s-r-and-b-edition-30-6aa81a129e0da510aa0c0eaa",
  oct30: "/events/acoustic-and-infused-gfc-live-music-showcase-30-6aa634669e0da510aa0c0ea5",
  nov6: "/events/acoustic-and-infused-november-live-music-showcase-30-6aba84ef01e63cad501da71e",
  nov7: "/events/gfc-friendsgiving-gratitude-good-eats-and-grown-folks-30-6aa81f9a9e0da510aa0c0eab",
  nov14: "/events/grown-folks-game-night-spades-dominoes-and-uno-30-6aa648c69e0da510aa0c0ea8",
  nov21: "/events/gfc-karaoke-bingo-blockbuster-anthems-edition-30-6aa828039e0da510aa0c0ead",
  nov28: "/events/gfc-game-night-at-mint-spades-uno-dominoes-and-more-30-6aa824239e0da510aa0c0eac",
  dec4: "/events/acoustic-and-infused-holiday-edition-live-music-showcase-30-6aba86e701e63cad501da71f",
  dec5: "/events/gfc-holiday-table-a-syrian-feast-30-6aa82e829e0da510aa0c0eaf",
  dec12: "/events/grown-folks-game-night-last-game-night-of-2026-30-6aab59029e0da510aa0c0eb2",
  dec19: "/events/gfc-holiday-karaoke-bingo-30-6aa82bde9e0da510aa0c0eae",

  // Always-on links
  events: "/events",
  showcase: "/events/acoustic-and-infused-gfc-live-music-showcase-30-6aa634669e0da510aa0c0ea5", // update to the next showcase
  perform: "/perform",
  art: "/perform/art",
  artist: "/perform/art",
  paint: "/perform/art",
  scout: "/scouts",
  scouts: "/scouts",
  stage: "/on-our-stage",
  lineup: "/on-our-stage",
  mc: "/perform/host",
  emcee: "/perform/host",
  select: "/select",
  invite: "/select/invitation",
  nominate: "/select/nominate",
  gentlemen: "/select/gentlemen",
  ladies: "/select/ladies",
  join: "/membership",
  gift: "/gift",
  gifts: "/gift",
  pass: "/gift?item=pass3",
  holidaypass: "/gift?item=pass3",
  blackfriday: "/gift?item=pass3",
  cybermonday: "/gift?item=gift",
  shop: "/shop",
  merch: "/shop",
  celebrate: "/celebrate",
  host: "/host",
  perks: "/partnerships/perks",
  sponsor: "/partnerships",
  teambuilding: "/corporate-team-building-atlanta",
  holiday: "/office-holiday-party-atlanta",
  links: "/links",
    review: "https://g.page/r/CeZCCIN0CITtEBM/review",
  discord: "https://discord.gg/yZG48Q4tgJ",
  fb: "https://www.facebook.com/groups/grownfolksatl",

  // Platform sales decks
  pitch: "https://claude.ai/artifact/X9L2NLmhnfk81aNMocRVb4", // Business Platform Pitch (any business)
  "events-pitch": "https://claude.ai/artifact/6gpXu2bHSZ5o2GHeobsLGq", // White-Label Event Platform
};

// Count the click (once per visit), then go. Never blocks the redirect for long.
const countClick = (code, search) => {
  const key = `go:${code}${search}`;
  try { if (sessionStorage.getItem(key)) return Promise.resolve(); sessionStorage.setItem(key, "1"); } catch { /* private mode */ }
  const src = new URLSearchParams(search).get("src") || "";
  return fetch(`${BACKEND_URL}/api/go/${encodeURIComponent(code)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ src }),
    keepalive: true,
  }).catch(() => {});
};

const Go = () => {
  const { code = "" } = useParams();
  const { search } = useLocation();
  const known = LINKS[code.toLowerCase()];
  const target = known || "/events";
  const external = /^https?:\/\//.test(target);

  useEffect(() => {
    const counted = known ? countClick(code.toLowerCase(), search) : Promise.resolve();
    if (external) {
      // Give the count a moment to send before leaving the site
      Promise.race([counted, new Promise((r) => setTimeout(r, 700))]).then(() => window.location.replace(target));
    }
  }, [external, target, known, code, search]);

  if (external) return null;
  return <Navigate to={target + search} replace />;
};

export default Go;