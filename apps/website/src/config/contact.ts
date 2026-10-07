// The Collection — central contact configuration.
//
// Every phone number, email, WhatsApp deep-link and social URL on the website is
// derived from here, so the client's details live in ONE place. These are the
// client's real details, except the email (still a TODO — not yet provided).

import { formatPKR, type Car } from "../app/data/cars";

// Client's WhatsApp number — international format, digits only, no "+" or leading
// 0 (local 0300 0555007 → 92 300 0555007). Used for every wa.me enquiry link.
export const WHATSAPP_NUMBER = "923000555007";

// Client's phone number (same line as WhatsApp).
export const PHONE_DISPLAY = "+92 300 0555007";
export const PHONE_HREF = "tel:+923000555007";

// TODO: the client has not provided a public email yet — confirm/replace before launch.
export const EMAIL = "concierge@thecollection.pk";
export const EMAIL_HREF = `mailto:${EMAIL}`;

// Client's real social profiles.
export const INSTAGRAM_URL = "https://www.instagram.com/thecollectionisb/";
export const FACEBOOK_URL = "https://www.facebook.com/p/The-Collection-61578397241405/";
export const YOUTUBE_URL = "https://www.youtube.com/@thecollectionisb";

/** Build a wa.me deep-link with a pre-filled, url-encoded message. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// --- Message templates (kept here so the brand voice lives in one place) -----

export const GENERAL_VIEWING_MESSAGE =
  "Hello, I'd like to enquire about arranging a private viewing with The Collection.";

/** A general "request a viewing" WhatsApp link (header, hero, footer, appointment). */
export const generalWhatsapp = () => whatsappLink(GENERAL_VIEWING_MESSAGE);

const carName = (car: Car) =>
  [car.year, car.make, car.model, car.variant].filter(Boolean).join(" ");

/** Enquiry about a specific, available car. */
export function carViewingMessage(car: Car): string {
  return `Hello, I'm interested in the ${carName(car)} (${formatPKR(
    car.price,
    car.currency,
  )}) listed on The Collection. Is it available to view?`;
}

/** Enquiry about something comparable — used for sold cars. */
export function similarCarMessage(car: Car): string {
  return `Hello, I'm interested in something similar to the ${carName(
    car,
  )}. Do you have comparable motorcars available?`;
}

/** Register interest in a specific car that is currently reserved. */
export function reservedCarMessage(car: Car): string {
  return `Hello, I understand the ${carName(
    car,
  )} is currently reserved. I'd like to register my interest and be notified if it becomes available.`;
}

// --- Sister houses -----------------------------------------------------------
// The three businesses that share The Collection's building in F-6. Every link to
// them (landing row, footer, mobile menu) reads from this list.
//
// Each URL carries UTM tags so the sister sites can see, in their own analytics,
// how many visitors The Collection sent them and from which spot on the page.

export interface SisterHouse {
  /** Stable key: the landing page looks the wordmark up by this, never by name. */
  id: "studio" | "performance" | "bazaar";
  name: string;
  /** What it is, in a few plain words: shown under the name everywhere. */
  trade: string;
  url: string;
}

const utmTagged = (url: string, placement: string) => {
  const u = new URL(url);
  u.searchParams.set("utm_source", "thecollection");
  u.searchParams.set("utm_medium", "referral");
  u.searchParams.set("utm_campaign", "sister_houses");
  u.searchParams.set("utm_content", placement);
  return u.toString();
};

// Every claim here matches the house's own site (checked 2026-10-07). Keep it
// that way: 360 sells parts and does NOT fit or tune, and The Bazaar buys cars
// outright but does NOT take part-exchange, so neither may be promised here.
const SISTER_HOUSES: (Omit<SisterHouse, "url"> & { href: string })[] = [
  {
    id: "studio",
    name: "The Studio",
    trade: "Paint protection and detailing",
    href: "https://thestudioisb.com/",
  },
  {
    id: "performance",
    name: "360 Performance",
    trade: "Genuine performance parts",
    href: "https://www.360performance.shop/",
  },
  {
    id: "bazaar",
    name: "The Bazaar",
    trade: "Everyday cars, bought, sold and imported",
    href: "https://thebazaar.com.pk/",
  },
];

/** The sister houses, with links tagged for where on the site they are shown. */
export function sisterHouses(placement: "hero" | "band" | "footer" | "menu"): SisterHouse[] {
  return SISTER_HOUSES.map(({ href, ...h }) => ({ ...h, url: utmTagged(href, placement) }));
}
