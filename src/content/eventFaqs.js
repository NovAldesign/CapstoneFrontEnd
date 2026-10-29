// FAQs for the Events page and every event page. Written the way people search
// ("things to do in Atlanta", "meet people in Atlanta") so Google can show them.
// Each answer can carry a link to the next step.
import { NIGHTS, matchesNight } from "../Services/eventUtils";

export const REFUND_TEXT =
  "Tickets are final, but you can transfer yours to someone else (30+) up to 24 hours before the event by emailing community@grownfolkscollective.com. If we cancel, you get a full refund.";

const Q = {
  thingsToDo: {
    q: "What are fun things to do in Atlanta for adults 30+?",
    a: "Grown Folks™ Collective hosts alcohol-free game nights, Karaoke Bingo and Acoustic & Infused™ live music showcases across metro Atlanta, made for grown folks 30 and up. Every night is hosted, so you never have to figure out how to break the ice.",
    link: { to: "/events", label: "See upcoming events" },
  },
  meetPeople: {
    q: "How can I meet new people in Atlanta in my 30s?",
    a: "Go where conversation is built in. At every GFC night, someone welcomes you at the door and there's something to do right away: a game, a song, a stage. Tables rotate at Game Night, so you'll meet new people all night.",
    link: { to: "/blog/how-to-meet-people-in-your-30s-atlanta", label: "Read: how to meet people in your 30s in Atlanta" },
  },
  solo: {
    q: "Can I come by myself?",
    a: "Yes. Plenty of guests come solo, and solo folks never stay solo for long. Couples, friends and coworkers are welcome too.",
    link: { to: "/events?night=game-night", label: "Game Night is the easiest first night" },
  },
  alcohol: {
    q: "Are there alcohol-free things to do in Atlanta at night?",
    a: "Yes. Every GFC event is alcohol-free, so you get a real night out without the bar scene. Our venues offer mocktails, tea and coffee to buy.",
    link: { to: "/events", label: "Find an alcohol-free night out" },
  },
  dating: {
    q: "Is this a dating or singles event?",
    a: "No. GFC nights are about friendship and community, and plenty of couples come together. Single and ready to meet someone? GFC Select™, our private evening for singles 30+, launches January 2027.",
    link: { to: "/select", label: "Learn about GFC Select™" },
  },
  who: {
    q: "Who are GFC events for?",
    a: "Grown folks 30 and up across metro Atlanta. We may ask for ID at the door.",
  },
  where: {
    q: "Where are GFC events held? Is there parking?",
    a: "At Atlanta venues including Aromas Tea Bar (located at The Koncept House) and Mint Coffeehouse. The address is on each event page, and parking is free at our venues.",
  },
  deals: {
    q: "Any ticket deals?",
    a: "Join Come Out & Play, our newsletter, and get $5 off your first ticket. Early Bird tickets are our best price (6 per event, ending 14 days before). Plus One saves $8 on two seats, groups of 5 save 20% and groups of 10 save 25%. Book 2 different events in one order and save 5%, or 3 or more and save 10%.",
    link: { to: "/play", label: "Get $5 off your first ticket" },
  },
  door: {
    q: "Can I buy tickets the day of or at the door?",
    a: "Yes. Tickets are sold online right up to the day of the event, and at the door as long as seats are left. Our rooms are small, so grab yours ahead of time to guarantee your spot.",
  },
  refunds: { q: "What is your refund policy? Can I transfer my ticket?", a: REFUND_TEXT },
  private: {
    q: "Can GFC host a private, company or apartment community event?",
    a: "Yes. We host team building, office holiday parties, employee appreciation nights and resident events across metro Atlanta. We bring the games, the mocktail bar and the host.",
    link: { to: "/host", label: "See hosted event packages" },
  },
  birthday: {
    q: "Can I celebrate a birthday at a GFC event?",
    a: "Yes. Bring your crew for group pricing, reserved tables and a birthday shout-out.",
    link: { to: "/celebrate", label: "Plan a group outing" },
  },
};

const NIGHT_FAQS = {
  "game-night": [
    {
      q: "What is Game Night like?",
      a: "A hosted night of spades, dominoes, Uno, Taboo, Mad Gab, chess and more for Atlanta's 30+ crowd. Tables rotate, so you'll play with new people all night.",
    },
    { q: "I've never played spades. Can I come?", a: "Absolutely. Beginners are welcome and we'll teach you." },
    { q: "Do I need a partner?", a: "No. Tables rotate, so you'll play with new people all night." },
  ],
  "karaoke-bingo": [
    {
      q: "What is Karaoke Bingo?",
      a: "Your bingo card is full of songs from the night's theme. When one plays, mark it, sing along if you want, and get a bingo to win a prize. It's the loudest, most fun night on our Atlanta calendar.",
    },
    { q: "Do I have to sing?", a: "Never. Sing from your seat, take the mic, or just mark your card." },
  ],
  "acoustic-infused": [
    {
      q: "What is Acoustic & Infused™?",
      a: "Our live music showcase in Atlanta: R&B, neo-soul and acoustic artists, each with a 20-minute set, while a live visual artist paints beside the stage. Come ready to dance and connect.",
    },
    { q: "Who's performing?", a: "The lineup is on each event page. Buy your ticket through an artist's link to support them directly." },
    { q: "Can I perform?", a: "Yes. Artists can apply to play an upcoming showcase.", link: { to: "/perform", label: "Apply to perform" }, tabOnly: true },
  ],
};

// Events page: one tab per series + general
export const FAQ_TABS = [
  { id: "general", label: "General", faqs: [Q.thingsToDo, Q.meetPeople, Q.solo, Q.alcohol, Q.dating, Q.who, Q.where, Q.deals, Q.door, Q.refunds, Q.private, Q.birthday] },
  { id: "games", label: "Game Nights", faqs: NIGHT_FAQS["game-night"] },
  { id: "karaoke", label: "Karaoke Bingo", faqs: NIGHT_FAQS["karaoke-bingo"] },
  { id: "acoustic", label: "Acoustic & Infused™", faqs: NIGHT_FAQS["acoustic-infused"] },
  { id: "dinners", label: "Holiday Tables", faqs: [
    { q: "Is dinner included?", a: "Yes, dinner is included in your ticket." },
    { q: "Can you handle dietary needs?", a: "Email community@grownfolkscollective.com at least 5 days before and we'll do our best." },
    { q: "Why do sales close early?", a: "We plan the food around the headcount, so sales close 5 days before each dinner." },
  ]},
];

// Old refund/transfer questions saved on events are replaced by REFUND_TEXT
const isPolicyFaq = (f = {}) => /refund|transfer/i.test(f.question || "");

// Event page: questions for that kind of night, the event's own extra questions,
// then the basics every first-timer asks.
export const faqsForEvent = (event = {}) => {
  const night = NIGHTS.find((n) => matchesNight(event, n.id));
  const custom = (event.faqs || [])
    .filter((f) => f?.question && f?.answer && !isPolicyFaq(f))
    .map((f) => ({ q: f.question, a: f.answer }));
  return [
    ...(night ? NIGHT_FAQS[night.id].filter((f) => !f.tabOnly) : []),
    ...custom,
    Q.solo,
    Q.alcohol,
    Q.where,
    Q.deals,
  ]; // the refund policy has its own section on the event page
};

export const faqSchema = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});
