// =======================================================
// GFC LEGAL PAGES — all wording lives here.
// DRAFT FOR ATTORNEY REVIEW. Have a Georgia attorney review before relying on it.
//
// Update the settings below once, and every page uses them.
// =======================================================
export const LEGAL = {
  brand: "Grown Folks Collective",
  legalName: "Grown Folks Collective", // ← change to your registered name, e.g. "Grown Folks Collective LLC"
  effectiveDate: "October 1, 2026",
  email: "community@grownfolkscollective.com",
  eventsEmail: "events@grownfolkscollective.com",
  mailingAddress: "", // ← add your business mailing address (needed for marketing emails too)
  state: "Georgia",
  county: "Fulton County",
  site: "grownfolkscollective.com",
  waiverVersion: "2026-10-01",
};

const { brand, legalName, email, eventsEmail, state, county, site } = LEGAL;
const who = legalName === brand ? `${brand} ("GFC," "we," "us")` : `${legalName} ("${brand}," "GFC," "we," "us")`;
const contactLine = `Email us at ${email}${LEGAL.mailingAddress ? ` or write to ${LEGAL.mailingAddress}` : ""}.`;

// Short consent lines used on forms and at checkout
export const SMS_CONSENT_TEXT =
  `By checking this box, you agree to receive recurring automated marketing texts from ${brand} (event updates and early access) at the number provided. Consent is not a condition of purchase. Up to 4 msgs/month. Msg & data rates may apply. Reply STOP to cancel, HELP for help.`;
export const SMS_CONSENT_VERSION = "2026-10-01";

// Each page: title, description (for Google), intro, and sections.
// A section can have: h (heading), p (paragraphs), list (bullets).
export const LEGAL_PAGES = {
  privacy: {
    path: "/privacy",
    title: "Privacy Policy",
    description: `How ${brand} collects, uses, and protects your personal information.`,
    intro: `${who} respects your privacy. This policy explains what we collect when you visit ${site}, buy tickets, join as a member, or sign up for updates, and how we use it.`,
    sections: [
      {
        h: "Information we collect",
        list: [
          "Contact details: your name, email address, and phone number when you buy tickets, join as a member, contact us, request a group booking, apply to perform, or sign up for updates.",
          "Membership details: your date of birth (for your birthday bonus) and the answers you give about your interests.",
          "Artist and partner applications: your bio, photos, performance links, social handles, and payout details you choose to share.",
          "Purchase details: what you bought, when, any code you used, and your order confirmation. Card payments are processed by Stripe. We never see or store your full card number.",
          "Website use: pages visited, device and browser type, and how you arrived at our site, collected through analytics tools (including Metricool) and cookies.",
        ],
      },
      {
        h: "How we use it",
        list: [
          "To deliver your tickets, check you in, and send event details and changes.",
          "To manage your membership, credits, and perks.",
          "To reply to your messages and booking requests.",
          "To send event news and offers by email, and by text only if you opted in.",
          "To review artist, host, and partner applications and pay artists and partners.",
          "To understand what's working on our site and improve our events.",
          "To prevent fraud and meet legal, tax, and accounting obligations.",
        ],
      },
      {
        h: "Who we share it with",
        p: [
          "We do not sell your personal information. We share it only with service providers that help us run GFC, and only what they need:",
        ],
        list: [
          "Stripe (payments and memberships)",
          "Resend and Hostinger (email delivery)",
          "Cloudinary (photo uploads)",
          "Metricool (website analytics and social media scheduling)",
          "Eventbrite (some ticket sales)",
          "MongoDB and Railway (secure data storage and website hosting)",
          "Event venues and partners, only when needed to run an event (for example, a guest list for check-in)",
          "Government or law enforcement when the law requires it",
        ],
      },
      {
        h: "Text messages",
        p: [
          "We only send marketing texts if you check the text message box and give us your number. Consent is not a condition of any purchase. You can reply STOP at any time to stop texts, or HELP for help. Message and data rates may apply. We do not share your phone number or text consent with third parties for their own marketing.",
          "A phone number you give at checkout is used only to contact you about that order or event.",
        ],
      },
      {
        h: "Emails",
        p: [
          "You can unsubscribe from our marketing emails at any time using the link in the email or by contacting us. We'll still send messages about tickets or memberships you've bought.",
        ],
      },
      {
        h: "Cookies and analytics",
        p: [
          "Our site uses cookies and similar tools to remember your bag and your ticket code, and to measure site traffic. You can block or delete cookies in your browser settings; parts of the site, like your bag, may not work without them.",
        ],
      },
      {
        h: "Photos at events",
        p: [
          "Photos and videos may be taken at GFC events. See our Photo & Video Policy for how we use them and how to opt out.",
        ],
      },
      {
        h: "How long we keep it",
        p: [
          "We keep your information while you're an active member, subscriber, or customer, and as long as needed for tax, accounting, and legal reasons. After that, we delete it or remove anything that identifies you.",
        ],
      },
      {
        h: "Your choices",
        p: [
          `You can ask us to show you, correct, or delete the personal information we have about you. ${contactLine} We'll respond within 30 days.`,
        ],
      },
      {
        h: "Security",
        p: [
          "We use trusted providers and reasonable safeguards to protect your information. No system is 100% secure, so please contact us right away if you think your information has been misused.",
        ],
      },
      {
        h: "Age",
        p: [
          `Our events and website are for adults. We do not knowingly collect information from anyone under 18. If you believe a minor has given us information, contact us and we'll delete it.`,
        ],
      },
      {
        h: "Changes and contact",
        p: [
          `We may update this policy. The date at the top shows the latest version. Questions? ${contactLine}`,
        ],
      },
    ],
  },

  terms: {
    path: "/terms",
    title: "Terms of Use",
    description: `The terms for using ${site}, buying tickets, and joining ${brand}.`,
    intro: `These terms apply when you use ${site}, buy tickets, join as a member, or attend a ${brand} event. By doing any of those, you agree to these terms, our Privacy Policy, Refund Policy, Code of Conduct, Photo & Video Policy, and Participation Waiver.`,
    sections: [
      {
        h: "Who can attend",
        p: [
                  "GFC events are for adults 30 and older. We may ask for ID at the door.",
        ],
      },
      {
        h: "Tickets",
        list: [
          "Your ticket is a license to attend one event. It is not a guarantee of a specific seat, table, or experience.",
          "Prices, discounts, and codes are shown before you pay. Codes can't be combined unless we say so and can be ended at any time.",
          "Tickets may not be resold for more than face value.",
          "Refunds and transfers follow our Refund Policy.",
          "If you buy tickets for guests, you're responsible for sharing these terms with them, and you agree to them on their behalf.",
        ],
      },
      {
        h: "Event changes",
        p: [
          "Details like the time, venue, lineup, menu, or activities may change. If we cancel an event, we'll offer a refund or event credit as described in our Refund Policy.",
        ],
      },
      {
        h: "Memberships",
        list: [
          "Memberships renew automatically every month at the price shown when you join, until you cancel.",
          `You can cancel any time before your next billing date by emailing ${email}. Your perks continue until the end of the month you paid for.`,
          "Monthly fees are not refunded for partial months. Unused event credit does not turn into cash.",
          "Founding member pricing stays the same for as long as your membership stays active without a break.",
          "We may change membership prices or perks with at least 30 days' notice by email. You can cancel before the change takes effect.",
        ],
      },
      {
        h: "Partner discounts",
        p: [
          "Member discounts at partner businesses are offered by those businesses, which are responsible for their own products and services. GFC may earn a referral fee when you use a partner code.",
        ],
      },
      {
        h: "Your conduct",
        p: [
          "You agree to follow our Code of Conduct at events and online. We may remove anyone, cancel tickets, or end memberships without a refund for behavior that breaks it.",
        ],
      },
      {
        h: "Participation and risk",
        p: [
          "Our events include games, food, music, travel, and activities that carry normal risks. By attending, you accept the Participation Waiver shown at checkout.",
        ],
      },
      {
        h: "Our content",
        p: [
          `The ${brand} name, logo, photos, and site content belong to us. Please don't copy or use them without our written permission.`,
        ],
      },
      {
        h: "Limitation of liability",
        p: [
          `To the fullest extent the law allows, ${legalName} and its team, hosts, volunteers, and partners are not liable for indirect or consequential damages, or for lost or stolen personal items at events. Our total liability for any claim related to an event or purchase is limited to the amount you paid for it.`,
          "The website is provided \"as is.\" We work to keep it accurate and available, but we can't promise it will always be error-free or online.",
        ],
      },
      {
        h: "Governing law",
        p: [
          `These terms are governed by the laws of the State of ${state}. Any dispute will be handled in the state or federal courts located in ${county}, ${state}.`,
        ],
      },
      {
        h: "Changes and contact",
        p: [
          `We may update these terms. The date at the top shows the latest version. Questions? ${contactLine}`,
        ],
      },
    ],
  },

  waiver: {
    path: "/waiver",
    title: "Participation Waiver & Release",
    description: `The participation waiver for ${brand} events.`,
    intro: `Please read carefully. By buying a ticket, joining as a member, or attending a ${brand} event, you agree to this waiver for yourself and for any guest you buy a ticket for.`,
    sections: [
      {
        h: "1. I understand the risks",
        p: [
          "GFC events include social activities like games, dancing, sports and field-day games, food and drink, live music, outings, and travel. These activities carry normal risks, including slips and falls, strains, allergic reactions, and injuries caused by other guests.",
        ],
      },
      {
        h: "2. I take part voluntarily",
        p: [
          "I choose which activities I join. I will not take part in anything I'm not physically able to do safely, and I'll follow instructions from GFC staff and venue staff.",
        ],
      },
      {
        h: "3. Food and allergies",
        p: [
          "Food may be prepared by venues or vendors and may contain or come into contact with common allergens. I am responsible for asking about ingredients and avoiding foods that aren't safe for me.",
        ],
      },
      {
        h: "4. Release",
        p: [
          `To the fullest extent allowed by ${state} law, I release ${legalName}, its owners, team members, hosts, volunteers, venues, and partners from any claims for injury, illness, loss, or damage arising from my participation in GFC events, except claims caused by gross negligence or willful misconduct.`,
        ],
      },
      {
        h: "5. Medical care",
        p: [
          "If I need medical help at an event, I allow GFC to call emergency services on my behalf. I'm responsible for any medical costs.",
        ],
      },
      {
        h: "6. Personal property",
        p: [
          "GFC is not responsible for lost, stolen, or damaged personal items.",
        ],
      },
      {
        h: "7. Guests",
        p: [
          "If I buy tickets for other people, I will share this waiver with them before the event, and they accept it by attending.",
        ],
      },
      {
        h: "8. Agreement",
        p: [
          "I have read this waiver, I understand it, and I agree to it. If any part is found unenforceable, the rest still applies.",
        ],
      },
    ],
  },

  refunds: {
    path: "/refund-policy",
    title: "Refund Policy",
    description: `Refunds, transfers, and cancellations for ${brand} tickets and memberships.`,
    intro: "We plan every event around our headcount (food, seating, and venue commitments), so here's how refunds work.",
    sections: [
      {
        h: "Tickets",
        list: [
          "All ticket sales are final unless the event page says otherwise.",
          `Can't make it? You can transfer your ticket to another person up to 24 hours before the event. Email ${email} with your confirmation code and their name.`,
          "If an event page lists its own refund policy, that policy applies to that event.",
        ],
      },
      {
        h: "If we cancel or reschedule",
        list: [
          "If GFC cancels an event, you'll get a full refund of your ticket price, or event credit if you prefer.",
          "If we move an event to a new date, your ticket carries over. If you can't make the new date, email us within 7 days of the announcement for a refund.",
        ],
      },
      {
        h: "Weather and emergencies",
        p: [
          "If an event is cancelled for severe weather or an emergency outside our control, we'll offer event credit or reschedule.",
        ],
      },
      {
        h: "Memberships",
        list: [
          `Cancel any time before your next billing date by emailing ${email}.`,
          "Monthly fees are not refunded for partial months. Your perks last until the end of the month you paid for.",
          "Unused event credit expires when your membership ends and can't be exchanged for cash.",
        ],
      },
      {
        h: "Removal from an event",
        p: [
          "Guests removed for breaking our Code of Conduct are not refunded.",
        ],
      },
      {
        h: "Questions",
        p: [contactLine],
      },
    ],
  },

  conduct: {
    path: "/code-of-conduct",
    title: "Code of Conduct",
    description: `How we treat each other at ${brand} events.`,
    intro: "GFC is built on genuine connection. Everyone should feel safe, respected, and free to be themselves. By attending, you agree to:",
    sections: [
      {
        h: "Be respectful",
        list: [
          "Treat every guest, host, artist, and venue staff member with respect.",
          "No harassment, bullying, hate speech, or discrimination of any kind.",
          "Take \"no\" the first time, whether it's a dance, a conversation, or a phone number.",
        ],
      },
      {
        h: "Respect consent and privacy",
        list: [
          "Ask before taking photos or videos of other guests, and respect anyone who says no.",
          "Don't share other guests' personal information without their permission.",
          "Some events, like GFC Select, are camera-free. Follow the rules for each event.",
        ],
      },
      {
        h: "Keep it grown and safe",
        list: [
          "Most GFC events are alcohol-free. Don't bring outside alcohol or drugs.",
          "No weapons.",
          "Follow venue rules and staff instructions.",
          "No selling or soliciting to other guests without GFC approval.",
        ],
      },
      {
        h: "If something happens",
        p: [
          `Tell a GFC host right away, or email ${eventsEmail}. We take every report seriously and keep it confidential.`,
          "We may remove anyone who breaks this code, without a refund, and may ban them from future events and memberships.",
        ],
      },
    ],
  },

  photos: {
    path: "/photo-policy",
    title: "Photo & Video Policy",
    description: `How ${brand} uses photos and videos from events.`,
    intro: "We love sharing the joy of our events. Here's how photos and videos work.",
    sections: [
      {
        h: "What we capture",
        p: [
          `GFC and our photographers may take photos, video, and audio at events. By attending, you agree that we may use images of you in our website, social media, emails, and promotional materials without payment.`,
        ],
      },
      {
        h: "Don't want to be photographed?",
        list: [
          "Tell a GFC host when you check in, and we'll do our best to keep you out of photos.",
          `Spot yourself in a post you'd like removed? Email ${email} with the link and we'll take it down.`,
        ],
      },
      {
        h: "Camera-free events",
        p: [
          "Some events, like GFC Select, are camera-free. Guests' phone cameras are covered at check-in and no photos are taken or posted.",
        ],
      },
      {
        h: "Your photos",
        p: [
          "When you share photos or videos with us or tag us, you give GFC permission to repost them with credit to you.",
        ],
      },
    ],
  },

  performer: {
    path: "/performer-agreement",
    title: "Performer Agreement",
    description: `The agreement for artists, MCs, DJs, and other performers at ${brand} events.`,
    intro: `${brand} is a social club for adults. Our showcases give artists, MCs, DJs, comedians, and other performers ("you") a stage and an audience. This agreement applies when you apply, are booked, or perform at a GFC event, and you accept it when you check the agreement box on our application form.`,
    sections: [
      {
        h: "1. What this is",
        list: [
          "GFC is offering you an opportunity to showcase your talent at a social club event. You are an independent performer, not an employee, partner, or agent of GFC.",
          "Being booked once does not guarantee future bookings.",
          "Any pay is limited to what's in your booking email (for example, $15 per ticket sold with your personal link, up to $75). You're responsible for your own taxes. If you earn $600 or more from GFC in a year, we'll ask for a W-9 and send you a 1099.",
        ],
      },
      {
        h: "2. Showcase rules",
        list: [
          "Arrive at the time in your booking email for setup and sound check.",
          "Keep to your set time. The host or MC may end a set that runs over.",
          "Keep your content right for a grown, mixed audience: no hate speech, slurs aimed at groups, harassment, or explicit sexual content. Ask us first if you're unsure.",
          "Follow our Code of Conduct, the venue's rules, and instructions from GFC staff and the venue.",
          "No alcohol or drugs brought to the event.",
          "Meet the ticket requirements in your booking email (for example, at least 3 tickets sold one week before the show to hold your spot).",
        ],
      },
      {
        h: "3. Removal and cancellation",
        list: [
          "GFC may cancel your booking or end your set if you break these rules, don't meet the ticket requirements, arrive late, or create an unsafe situation. Pay for tickets already sold with your link is still paid unless you were removed for misconduct.",
          "If you need to cancel, tell us as soon as possible and at least 7 days before the show.",
          "If GFC cancels or moves the event, we'll offer you a spot at a future showcase.",
        ],
      },
      {
        h: "4. Your equipment",
        p: [
          "You bring and are responsible for your own instruments, mics, cables, and gear. GFC and the venue are not responsible for loss, theft, or damage to your equipment. You're responsible for any damage your equipment or setup causes to the venue.",
        ],
      },
      {
        h: "5. Your music and material",
        list: [
          "You confirm you have the right to perform your material. For original work, it's yours. For covers, you're responsible for performing them in a way that follows music licensing rules; the venue may hold public performance licenses, and you'll follow any limits we or the venue share.",
          "You keep ownership of your music, material, and merch, and you keep 100% of your merch sales and tips.",
        ],
      },
      {
        h: "6. Photos, video, and promotion",
        list: [
          "If you checked the feature box, GFC may use your name, photo, bio, and links on its website, emails, and social media to promote the event and future showcases.",
          "GFC may photograph and record parts of your performance and use short clips to promote GFC. We'll credit you. Ask us any time to remove a post.",
          "You may record your own set for your own promotion. Please tag @grownfolkscollective.",
        ],
      },
      {
        h: "7. Release",
        p: [
          `To the fullest extent allowed by ${state} law, you release ${legalName}, its owners, team members, hosts, volunteers, venues, and partners from claims for injury, loss, or damage arising from your participation, except claims caused by gross negligence or willful misconduct. The Participation Waiver also applies to you.`,
        ],
      },
      {
        h: "8. Agreement",
        p: [
          `By checking the agreement box and typing your name on the application, you agree to this Performer Agreement, the Code of Conduct, and the Participation Waiver. Questions? Email ${eventsEmail}.`,
        ],
      },
    ],
  },
  accessibility: {
    path: "/accessibility",
    title: "Accessibility Statement",
    description: `${brand}'s commitment to an accessible website and events.`,
    intro: `${brand} wants everyone to be able to use our website and enjoy our events.`,
    sections: [
      {
        h: "Our website",
        p: [
          "We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA. We test our pages with automated tools and keyboard and screen reader checks, and we fix issues as we find them.",
        ],
        list: [
          "Every page can be used with a keyboard, starting with a \"Skip to main content\" link.",
          "Text colors meet contrast guidelines for readability.",
          "Images have descriptions, and forms have labels.",
        ],
      },
      {
        h: "Our events",
        p: [
          `Every venue is different. Event pages list the venue address, and we're happy to share details about parking, entrances, restrooms, and seating. If you need an accommodation (like a seat near the entrance, a quieter spot, or help with food restrictions), email ${eventsEmail} before the event and we'll do our best to help.`,
        ],
      },
      {
        h: "Need help or found a problem?",
        p: [
          `If something on our site doesn't work for you, email ${eventsEmail} with the page and what happened. We'll respond within 2 business days and help you complete your purchase or request another way.`,
        ],
      },
    ],
  },
};

// Links shown in the footer, in order
export const LEGAL_FOOTER_LINKS = [
  { key: "privacy", label: "Privacy" },
  { key: "terms", label: "Terms" },
  { key: "refunds", label: "Refunds" },
  { key: "waiver", label: "Waiver" },
  { key: "conduct", label: "Code of Conduct" },
  { key: "photos", label: "Photo Policy" },
  { key: "accessibility", label: "Accessibility" },
];

// Pages that exist but aren't in the footer (linked from their forms)
export const PERFORMER_AGREEMENT_VERSION = "2026-10-01";
