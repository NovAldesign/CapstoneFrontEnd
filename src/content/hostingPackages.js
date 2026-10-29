// Play. Sip. Toast. packages: shared by /host and the hosting landing pages.
// ── Play. Sip. Toast. — GFC hosts at apartment communities, offices and teams ──
// To change a price, edit the numbers below and push.
export const PACKAGES = [
  {
    name: 'Play. Sip. Toast. Game Night',
    short: 'Game Night',
    residents: 795,
    corporate: 1395,
    maxGuests: 40,
    guests: 'Up to 40 guests · 2 hours',
    blurb: 'Spades, dominoes, Uno and more. Card tables, music and a host who keeps every table laughing.',
    badge: 'Fan Favorite',
  },
  {
    name: 'Play. Sip. Toast. Spades Tournament',
    short: 'Spades Tournament',
    residents: 895,
    corporate: 1495,
    maxGuests: 32,
    guests: 'Up to 32 players · 2 hours',
    blurb: 'Brackets, scorekeeping and bragging rights. The winning pair takes home a trophy.',
  },
  {
    name: 'Play. Sip. Toast. Karaoke Bingo',
    short: 'Karaoke Bingo',
    residents: 1095,
    corporate: 1695,
    maxGuests: 60,
    guests: 'Up to 60 guests · 2 hours',
    blurb: 'Sing-along bingo with full sound, mics, bingo cards and prizes. The loudest night on the calendar.',
  },
  {
    name: 'Play. Sip. Toast. Live-Action Mystery',
    short: 'The Case of the Missing Toast',
    residents: 1295,
    corporate: 1895,
    maxGuests: 40,
    guests: 'Up to 40 guests · 2.5 hours',
    blurb: 'Someone stole the toast. Guests get character cards, hunt for custom clue props and question suspects. The culprit is revealed at the toast.',
    badge: 'New',
  },
];

// Booking specials, one at a time by date (Eastern). Same list in the backend:
// utilities/hostingSpecials.js (it tells the team which savings apply).
export const HOSTING_SPECIALS = [
  { id: 'holiday', title: 'Holiday Booking Special', amount: 150, covers: 'a December event', endsLabel: 'Oct 31',
    endsAt: '2026-10-31T23:59:59-04:00' },
  { id: 'newyear', title: 'New Year Booking Special', amount: 125, covers: 'a January or February event', endsLabel: 'Nov 30',
    startsAt: '2026-11-01T00:00:00-04:00', endsAt: '2026-11-30T23:59:59-05:00' },
];
export const currentSpecial = (now = new Date()) =>
  HOSTING_SPECIALS.find((s) => (!s.startsAt || now >= new Date(s.startsAt)) && now <= new Date(s.endsAt)) || null;

// Join the planner list (corporate footer signup): $99 off a first hosted event, book within 90 days
export const PLANNER_SAVINGS = 99;

// Weekday prices are above. Fri–Sun dates cost this much more.
export const WEEKEND_EXTRA = 100;

// "from $35/guest": the weekday price split across a full group, rounded to the dollar
export const perGuest = (price, pkg) => Math.round(price / pkg.maxGuests);
// The Resident Package: apartment communities only (shown in the resident view of /host)
export const RESIDENT_PACKAGE = {
  name: 'The Resident Package',
  price: 1895,
  terms: '3-month minimum · Weekday dates',
  lead: 'Two events a month for your community: one to keep your residents, one to fill your vacancies.',
  events: [
    {
      label: 'Event 1',
      title: 'Resident Night',
      text: 'A GFC night just for your tenants. Game Night, Spades Tournament, or Karaoke Bingo in your clubhouse. Neighbors become friends, and residents who know their neighbors renew.',
    },
    {
      label: 'Event 2',
      title: 'Leasing Open House',
      text: 'Your highest-energy format (Game Night or Karaoke Bingo), opened to prospects. The leasing office invites everyone who\'s toured or applied; current residents come too. Prospects see what living there actually feels like, and your team gives tours between rounds.',
    },
  ],
  mixerExtras: [
    'QR sign-in at the door: you get the full prospect list, with consent to follow up',
    'Resident ambassadors at every table, talking up the community better than any brochure',
    'A live toast to new neighbors, with your move-in special announced to the room',
    'Pro photos for your listings and socials',
  ],
  math: 'The math: one vacant unit costs more than this package every single month. If the open house fills even one unit sooner, it\'s paid for itself.',
  frequency: 'Resident Package (2 events a month)',
};
