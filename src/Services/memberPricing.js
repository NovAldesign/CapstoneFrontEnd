// Member pricing in the ticket bag.
// MUST match the member pricing section of utilities/memberCredit.js on the backend
// (the backend re-checks everything at checkout).
//  - Active members: $5 off every ticket (Founding $7), friends' tickets too
//  - Food events: 10% off instead (Founding 15%)
//  - Event credit: Game Night, Karaoke Bingo and Acoustic & Infused only

const CREDIT_INCLUDE = /game night|karaoke bingo|acoustic\s*(&|and)\s*infused/i;
const CREDIT_EXCLUDE = /friendsgiving|holiday table|dinner|gfc select|private/i;
const FOOD_EVENT_RE = /friendsgiving|holiday table|dinner|cookout|brunch|supper|food/i;

export const isFoodEvent = (name = "") => FOOD_EVENT_RE.test(String(name));

export const creditCoversEvent = (name = "") => {
  const n = String(name);
  return CREDIT_INCLUDE.test(n) && !CREDIT_EXCLUDE.test(n) && !isFoodEvent(n);
};

// Price of one ticket for this member (cents). wallet comes from /api/member/wallet.
export const memberPriceCents = (wallet, cents, eventName) => {
  if (!wallet?.memberPricing) return cents;
  if (!(cents > 0)) return 0;
  if (isFoodEvent(eventName)) return Math.round(cents * (1 - (wallet.foodPercent || 0) / 100));
  return Math.max(0, cents - (wallet.ticketOffCents || 0));
};

// Is someone logged in as a member on this device?
export const memberToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem("gfc_user") || "null");
    const token = localStorage.getItem("gfc_token");
    return user?.role === "member" && token ? token : null;
  } catch {
    return null;
  }
};

export const isMemberTier = (tier = {}) => /member/i.test(tier.name || "");
