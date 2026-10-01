// Play. Sip. Toast. packages: shared by /host and the hosting landing pages.
// ── Play. Sip. Toast. — GFC hosts at apartment communities, offices and teams ──
// To change a price, edit the numbers below and push.
export const PACKAGES = [
  {
    name: 'Play. Sip. Toast. Game Night',
    short: 'Game Night',
    residents: 795,
    corporate: 1195,
    guests: 'Up to 40 guests · 2 hours',
    blurb: 'Spades, dominoes, Uno and more. Card tables, music and a host who keeps every table laughing.',
  },
  {
    name: 'Play. Sip. Toast. Spades Tournament',
    short: 'Spades Tournament',
    residents: 895,
    corporate: 1295,
    guests: 'Up to 32 players · 2 hours',
    blurb: 'Brackets, scorekeeping and bragging rights. The winning pair takes home a trophy.',
    badge: 'Fan Favorite',
  },
  {
    name: 'Play. Sip. Toast. Karaoke Bingo',
    short: 'Karaoke Bingo',
    residents: 1095,
    corporate: 1495,
    guests: 'Up to 60 guests · 2 hours',
    blurb: 'Sing-along bingo with full sound, mics, bingo cards and prizes. The loudest night on the calendar.',
  },
  {
    name: 'Play. Sip. Toast. Live-Action Mystery',
    short: 'The Case of the Missing Toast',
    residents: 1295,
    corporate: 1595,
    guests: 'Up to 40 guests · 2.5 hours',
    blurb: 'Someone stole the toast. Guests get character cards, hunt for custom clue props and question suspects. The culprit is revealed at the toast.',
    badge: 'New',
  },
];

// Weekday prices are above. Fri–Sun dates cost this much more.
export const WEEKEND_EXTRA = 100;