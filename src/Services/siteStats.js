import { useEffect, useState } from "react";
import { BACKEND_URL } from "./eventUtils";

// The numbers shown around the site (ratings, followers, By The Numbers).
// Edit them in the admin dashboard: Reviews tab (ratings) and Site Numbers tab.
// These defaults only show for a split second while the real numbers load.
export const DEFAULT_STATS = {
  eventbriteRating: 4.9,
  meetupRating: 4.8,
  tiktok: 1722,
  instagram: 0,
  facebook: 0,
  threads: 0,
  meetup: 199,
  email: 259,
  communityTotal: 2370,
  eventsHosted: 21,
  soldOut: 5,
};

// Follower/member platforms, in the order they show on the About page.
export const PLATFORMS = [
  { key: "tiktok", label: "TikTok Followers" },
  { key: "instagram", label: "Instagram Followers" },
  { key: "facebook", label: "Facebook Followers" },
  { key: "threads", label: "Threads Followers" },
  { key: "meetup", label: "Meetup Members" },
  { key: "email", label: "Email Subscribers" },
];

// 2370 -> "2,370+"
export const plus = (n) => `${Number(n || 0).toLocaleString("en-US")}+`;
// 4.9 -> "4.9"
export const rating = (n) => Number(n || 0).toFixed(1);

let cache = null;
let pending = null;
const listeners = new Set();

export const loadSiteStats = (force = false) => {
  if (pending && !force) return pending;
  pending = fetch(`${BACKEND_URL}/api/site-stats`, force ? { cache: "no-store" } : undefined)
    .then((res) => (res.ok ? res.json() : {}))
    .then((data) => {
      cache = { ...DEFAULT_STATS, ...data };
      listeners.forEach((fn) => fn(cache));
      return cache;
    })
    .catch(() => cache || DEFAULT_STATS);
  return pending;
};

// Call after saving in the dashboard so every page on screen updates
export const setSiteStats = (data) => {
  cache = { ...DEFAULT_STATS, ...data };
  pending = Promise.resolve(cache);
  listeners.forEach((fn) => fn(cache));
};

export const useSiteStats = () => {
  const [stats, setStats] = useState(cache || DEFAULT_STATS);
  useEffect(() => {
    listeners.add(setStats);
    loadSiteStats().then(setStats);
    return () => listeners.delete(setStats);
  }, []);
  return stats;
};
