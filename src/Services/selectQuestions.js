// GFC Select™ matching questions.
// Keep the keys in sync with the backend (capstonebackend/routes/selectRoutes.js).

// Rated 1 (not important) to 5 (essential)
export const VALUES = [
  { key: "faith", label: "Faith & spirituality" },
  { key: "family", label: "Family" },
  { key: "friends", label: "Friendships" },
  { key: "finances", label: "Financial stability" },
  { key: "career", label: "Career & ambition" },
  { key: "health", label: "Health & fitness" },
  { key: "adventure", label: "Travel & adventure" },
  { key: "growth", label: "Personal growth" },
  { key: "fun", label: "Humor & fun" },
  { key: "community", label: "Community & giving back" },
];

export const SCALE = [
  { n: 1, label: "Not important" },
  { n: 2, label: "A little" },
  { n: 3, label: "Important" },
  { n: 4, label: "Very" },
  { n: 5, label: "Essential" },
];

export const LOVE = [
  { key: "words", label: "Kind words and encouragement" },
  { key: "time", label: "Quality time, full attention" },
  { key: "service", label: "Doing things to make life easier" },
  { key: "gifts", label: "Thoughtful gifts and surprises" },
  { key: "touch", label: "Affection: a hug, holding hands" },
];

// Single-choice personality questions. `ask` gets the applicant's gender ("man" | "woman" | "").
export const CONNECT = [
  {
    key: "social",
    ask: () => "At a party, you're usually…",
    options: [
      { key: "room", label: "Working the room, meeting everybody" },
      { key: "few", label: "In one or two deep conversations" },
      { key: "warm", label: "Close to the people I came with until I warm up" },
      { key: "quiet", label: "Sitting in the corner to myself, quietly taking it all in" },
      { key: "mix", label: "A little of both: depends on the room" },
    ],
  },
  {
    key: "conflict",
    ask: () => "When something bothers you in a relationship, you…",
    options: [
      { key: "now", label: "Talk it out right away" },
      { key: "later", label: "Need quiet time to think first, then talk it through" },
      { key: "show", label: "Show it more than say it" },
    ],
  },
  {
    key: "pace",
    ask: () => "When you meet someone you like, you prefer to…",
    options: [
      { key: "slow", label: "Take it slow and build a friendship first" },
      { key: "steady", label: "Move at a steady pace" },
      { key: "fast", label: "Know quickly and go for it" },
    ],
  },
  {
    key: "roles",
    ask: () => "How do you see roles in a relationship?",
    options: [
      { key: "lead", label: "The man leads, the woman supports" },
      { key: "partner", label: "Equal partners: we lead together" },
      { key: "flex", label: "We figure it out as a couple" },
    ],
  },
  {
    key: "weekend",
    ask: () => "Your ideal Saturday is…",
    options: [
      { key: "out", label: "Out: brunch, events, something new" },
      { key: "home", label: "Home: cooking, a movie, good company" },
      { key: "recharge", label: "Quiet: a book, a walk, time to recharge alone" },
      { key: "mix", label: "A mix of both" },
    ],
  },
];

export const KIDS_HAVE = [
  { key: "yes", label: "Yes" },
  { key: "no", label: "No" },
];

export const KIDS_WANT = [
  { key: "yes", label: "Yes" },
  { key: "no", label: "No" },
  { key: "open", label: "Open to it" },
  { key: "done", label: "I have kids and I'm done" },
];

export const NIGHT_GOAL = [
  { key: "one", label: "Meet one great match" },
  { key: "few", label: "Meet a few people worth seeing again" },
  { key: "friends", label: "Make new friends" },
  { key: "out", label: "Get back out there and have fun" },
];

// Gendered wording for the love questions
export const giveLoveAsk = (g) =>
  g === "man" ? "How do you show a woman she matters? Pick 2." :
  g === "woman" ? "How do you show a man he matters? Pick 2." :
  "How do you show someone they matter? Pick 2.";

export const receiveLoveAsk = (g) =>
  g === "man" ? "What makes you feel respected and appreciated? Pick 2." :
  g === "woman" ? "What makes you feel valued and pursued? Pick 2." :
  "What makes you feel valued? Pick 2.";

export const labelOf = (list, key) => list.find((x) => x.key === key)?.label || "";

/* ---------------- Compatibility (admin) ----------------
   0–100 score for a man + woman, plus flags for deal-breakers.
   Values: 50 pts (closer ratings = more points, weighted toward what each rates highly).
   Love languages: 20 pts (how he gives vs. how she receives, and the reverse).
   Personality: 15 pts (pace, roles, conflict, social, weekend).
   Goals: 15 pts (relationship goal + kids). */
const LOOK_RANK = {
  Marriage: 3,
  "A long-term relationship": 2,
  "Dating with intention": 1,
  "Open to seeing where it goes": 0,
};

const ageOn = (birthdate) => {
  if (!birthdate) return null;
  const b = new Date(birthdate), t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return a;
};

export const compatibility = (a, b) => {
  const flags = [];
  let score = 0;

  // Values (50)
  const va = a.values || {}, vb = b.values || {};
  let w = 0, got = 0;
  VALUES.forEach(({ key }) => {
    const x = Number(va[key]), y = Number(vb[key]);
    if (!x || !y) return;
    const weight = Math.max(x, y); // differences on what someone cares about count more
    w += weight;
    got += weight * (1 - Math.abs(x - y) / 4);
    if (Math.abs(x - y) >= 3 && Math.max(x, y) >= 4) {
      flags.push(`${VALUES.find((v) => v.key === key).label}: ${x} vs ${y}`);
    }
  });
  const hasValues = w > 0;
  score += hasValues ? (got / w) * 50 : 25;

  // Love languages (20)
  const overlap = (give = [], receive = []) => give.filter((k) => receive.includes(k)).length;
  const love = overlap(a.giveLove, b.receiveLove) + overlap(b.giveLove, a.receiveLove); // 0–4
  score += (love / 4) * 20;

  // Personality (15)
  const same = (k) => a[k] && b[k] && (a[k] === b[k] || a[k] === "mix" || b[k] === "mix" || a[k] === "flex" || b[k] === "flex");
  const pacePts = !a.pace || !b.pace ? 1.5 : a.pace === b.pace ? 4 : a.pace === "steady" || b.pace === "steady" ? 2 : 0;
  // Quieter answers fit each other: an introvert pairs well with another introvert
  const QUIET_SOCIAL = ["few", "warm", "quiet"], QUIET_WEEKEND = ["home", "recharge"];
  const near = (k, group) => same(k) || (group.includes(a[k]) && group.includes(b[k]));
  score += pacePts + (same("roles") ? 4 : 0) + (same("conflict") ? 3 : 0) + (near("social", QUIET_SOCIAL) ? 2 : 0) + (near("weekend", QUIET_WEEKEND) ? 2 : 0);
  if (a.roles && b.roles && a.roles !== b.roles && a.roles !== "flex" && b.roles !== "flex") flags.push("Different views on roles");

  // Goals (15)
  const la = LOOK_RANK[a.lookingFor], lb = LOOK_RANK[b.lookingFor];
  if (la !== undefined && lb !== undefined) {
    score += Math.max(0, 8 - Math.abs(la - lb) * 3);
    if (Math.abs(la - lb) >= 2) flags.push(`Goals: ${a.lookingFor} vs ${b.lookingFor}`);
  } else score += 4;
  const kidsClash =
    (a.wantsKids === "yes" && (b.wantsKids === "no" || b.wantsKids === "done")) ||
    (b.wantsKids === "yes" && (a.wantsKids === "no" || a.wantsKids === "done"));
  if (kidsClash) flags.push("Kids: one wants them, one doesn't");
  else score += 7;

  // Age ranges (flag only)
  const ageA = ageOn(a.birthdate), ageB = ageOn(b.birthdate);
  const fits = (p, age) => !p.ageMin || !p.ageMax || age === null || (age >= p.ageMin && age <= p.ageMax);
  if (!fits(a, ageB) || !fits(b, ageA)) flags.push("Outside an age range");

  return { score: Math.round(score), flags };
};
