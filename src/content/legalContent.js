// =======================================================
// GFC LEGAL PAGES — all wording lives here.
// DRAFT FOR ATTORNEY REVIEW. Have a Georgia attorney review before relying on it.
//
// Update the settings below once, and every page uses them.
// =======================================================
export const LEGAL = {
  brand: "Grown Folks™ Collective",
  legalName: "Grown Folks Collective", // ← change to your registered name, e.g. "Grown Folks Collective LLC"
  effectiveDate: "October 2, 2026",
  email: "community@grownfolkscollective.com",
  eventsEmail: "events@grownfolkscollective.com",
  mailingAddress: "", // ← add your business mailing address (needed for marketing emails too)
  state: "Georgia",
  county: "Fulton County",
  site: "grownfolkscollective.com",
  waiverVersion: "2026-10-02",
};

const { brand, legalName, email, eventsEmail, state, county, site } = LEGAL;
const who = legalName === brand ? `${brand} ("GFC," "we," "us")` : `${legalName} ("${brand}," "GFC," "we," "us")`;
const contactLine = `Email us at ${email}${LEGAL.mailingAddress ? ` or write to ${LEGAL.mailingAddress}` : ""}.`;

// Short consent lines used on forms and at checkout
export const SMS_CONSENT_TEXT =
  `By checking this box, you agree to receive recurring automated marketing texts from ${brand} (event updates and early access) at the number provided. Consent is not a condition of purchase. Up to 4 msgs/month. Msg & data rates may apply. Reply STOP to cancel, HELP for help.`;
export const SMS_CONSENT_VERSION = "2026-10-01";

// Each page: title, description (for Google), intro, and sections.
// A section can have: h (heading), p (paragraphs), list (bullets), after (paragraphs after the bullets).
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
    intro: `These terms apply when you use ${site}, buy a ticket, join as a member, or attend a ${brand} event. By doing any of those, you accept these terms, our Privacy Policy, Refund Policy, Code of Conduct, Photo & Video Policy, and Participation Waiver. If you do not accept them, do not buy a ticket or attend.`,
    sections: [
      {
        h: "Who can attend",
        p: [
          "GFC events are for adults 30 and older. Bring a valid photo ID. We check ID at the door, and we turn away anyone who cannot show it. No refund is given for being turned away.",
        ],
      },
      {
        h: "Tickets",
        list: [
          "A ticket is a license to attend one event. It does not guarantee a specific seat, table, partner, or experience.",
          "Prices, discounts, and codes are shown before you pay. Codes cannot be combined unless we say so. We end codes at any time.",
          "Reselling a ticket for more than face value is prohibited. We cancel resold tickets without a refund.",
          "Refunds and transfers follow our Refund Policy. No exceptions are made at the door.",
          "If you buy tickets for guests, you are responsible for their conduct and for sharing these terms with them. You accept these terms on their behalf.",
        ],
      },
      {
        h: "Event changes",
        p: [
          "We change times, venues, lineups, menus, and activities when we need to. A change to these details is not grounds for a refund. If we cancel an event, we refund you or issue credit as stated in our Refund Policy.",
        ],
      },
      {
        h: "Memberships",
        list: [
          "Memberships renew automatically every month at the price shown when you joined, until you cancel.",
          `To cancel, email ${email} before your next billing date. Your perks end at the end of the month you paid for.`,
          "We do not refund monthly fees for partial months. Event credit has no cash value.",
          "Founding member pricing ends the moment your membership lapses or is cancelled. It does not come back.",
          "We change membership prices and perks with at least 30 days' notice by email. If you do not cancel before the change, you accept it.",
          "We end the membership of anyone who breaks our Code of Conduct, with no refund.",
        ],
      },
      {
        h: "Partner discounts",
        p: [
          "Discounts at partner businesses are offered by those businesses. They are solely responsible for their products, services, and honoring their offers. GFC is not responsible for any partner's goods, services, or conduct. GFC may earn a referral fee when you use a partner code.",
        ],
      },
      {
        h: "Your conduct",
        p: [
          "You must follow our Code of Conduct at every event and online. If you break it, we remove you, cancel your tickets, and end your membership, with no refund. We decide what counts as a violation.",
        ],
      },
      {
        h: "Participation and risk",
        p: [
          "Our events include games, food, music, travel, and physical activities that carry risk. You attend at your own risk. By attending, you accept the Participation Waiver.",
        ],
      },
      {
        h: "Our content",
        p: [
          `The ${brand} name, logo, photos, and site content belong to us. Do not copy, reuse, or imitate them without our written permission.`,
        ],
      },
      {
        h: "We are not liable for",
        list: [
          "Injury, illness, or loss that happens at an event or on the way to or from it.",
          "Lost, stolen, or damaged personal property, including phones, bags, coats, and vehicles.",
          "The actions, words, or behavior of other guests, before, during, or after an event, including any meeting or relationship that starts at a GFC event.",
          "The products, food, services, or conduct of venues, vendors, performers, and partners.",
          "Indirect, incidental, or consequential damages of any kind.",
        ],
        after: [
          `This applies to the fullest extent the law allows. In every case, ${legalName}'s total liability for any claim is limited to the amount you paid for the ticket or membership involved.`,
          "The website is provided \"as is\" and \"as available.\" We do not guarantee it is error-free or always online.",
        ],
      },
      {
        h: "Governing law",
        p: [
          `These terms are governed by the laws of the State of ${state}. Any dispute must be brought in the state or federal courts located in ${county}, ${state}.`,
        ],
      },
      {
        h: "Changes and contact",
        p: [
          `We update these terms when needed. The date at the top shows the current version, and it applies from that date. Questions? ${contactLine}`,
        ],
      },
    ],
  },

  waiver: {
    path: "/waiver",
    title: "Participation Waiver & Release",
    description: `The participation waiver for ${brand} events.`,
    intro: `Read this carefully. It limits your legal rights. By buying a ticket, joining as a member, or attending a ${brand} event, you accept this waiver for yourself and for every guest you buy a ticket for. If you do not accept it, do not attend.`,
    sections: [
      {
        h: "1. I accept the risks",
        p: [
          "GFC events include games, dancing, sports and field-day games, food, live music, outings, and travel. These carry real risks, including slips and falls, strains, allergic reactions, illness, and injuries caused by other guests. I accept these risks.",
        ],
      },
      {
        h: "2. I take part at my own risk",
        p: [
          "I choose which activities I join, and I am responsible for my own safety. I will not take part in anything I cannot do safely. I will follow every instruction from GFC staff and venue staff.",
        ],
      },
      {
        h: "3. Food and allergies",
        p: [
          "Food is prepared by venues and vendors, not by GFC, and may contain or touch common allergens. I am solely responsible for asking about ingredients and avoiding food that is not safe for me. GFC is not liable for any allergic reaction or food-related illness.",
        ],
      },
      {
        h: "4. Release",
        p: [
          `To the fullest extent allowed by ${state} law, I release and will not sue ${legalName}, its owners, team members, hosts, volunteers, venues, and partners for any injury, illness, loss, or damage arising from my participation in GFC events, except claims caused by gross negligence or willful misconduct.`,
        ],
      },
      {
        h: "5. Other guests",
        p: [
          "GFC does not run background checks on guests and does not guarantee the conduct of anyone I meet. I am responsible for my own decisions about who I talk to, share information with, or meet after an event. GFC is not liable for the actions of any other guest.",
        ],
      },
      {
        h: "6. Medical care",
        p: [
          "If I need medical help at an event, I authorize GFC to call emergency services for me. I am responsible for all medical costs.",
        ],
      },
      {
        h: "7. Personal property",
        p: [
          "GFC is not responsible for lost, stolen, or damaged personal items, including phones, bags, coats, and vehicles.",
        ],
      },
      {
        h: "8. Guests",
        p: [
          "If I buy tickets for other people, I must share this waiver with them before the event. They accept it by attending, and I am responsible for their conduct.",
        ],
      },
      {
        h: "9. Agreement",
        p: [
          "I have read this waiver, I understand it, and I accept it. If any part is found unenforceable, the rest still applies.",
        ],
      },
    ],
  },

  refunds: {
    path: "/refund-policy",
    title: "Refund Policy",
    description: `Refunds, transfers, and cancellations for ${brand} tickets and memberships.`,
    intro: "We commit to food, seating, and venue costs based on every ticket sold. Our refund rules are firm.",
    sections: [
      {
        h: "Tickets",
        list: [
          "All ticket sales are final. We do not issue refunds for change of plans, illness, traffic, weather you can travel in, or no-shows.",
          `You may transfer your ticket to another adult 30 or older up to 24 hours before the event. Email ${email} with your confirmation code and their full name. We do not accept transfers after that.`,
          "If an event page lists its own refund policy, that policy applies to that event.",
          "GFC Select™ seats are non-refundable and non-transferable.",
        ],
      },
      {
        h: "If we cancel or reschedule",
        list: [
          "If GFC cancels an event, we refund your ticket price in full, or issue event credit if you choose.",
          "If we move an event to a new date, your ticket moves with it. If you cannot attend the new date, email us within 7 days of the announcement for a refund. After 7 days, the ticket stands for the new date.",
        ],
      },
      {
        h: "Weather and emergencies",
        p: [
          "If we cancel for severe weather or an emergency outside our control, we issue event credit or reschedule. We do not issue cash refunds in these cases.",
        ],
      },
      {
        h: "Memberships",
        list: [
          `To cancel, email ${email} before your next billing date.`,
          "We do not refund monthly fees for partial months. Perks end at the end of the month you paid for.",
          "Unused event credit expires when your membership ends. It has no cash value.",
        ],
      },
      {
        h: "Removal from an event",
        p: [
          "If we remove you for breaking our Code of Conduct, you forfeit your ticket and membership. We do not refund them.",
        ],
      },
      {
        h: "Chargebacks",
        p: [
          "If you dispute a charge with your bank instead of contacting us first, we cancel your tickets and membership and ban you from future events.",
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
    description: `The rules every guest follows at ${brand} events.`,
    intro: "GFC is a grown, respectful room, and we protect it. Every guest follows these rules. There are no warnings for serious violations.",
    sections: [
      {
        h: "Respect everyone",
        list: [
          "Treat every guest, host, artist, and venue staff member with respect.",
          "Zero tolerance for harassment, bullying, threats, hate speech, or discrimination.",
          "\"No\" means no the first time, whether it's a dance, a conversation, a touch, or a phone number. Do not ask again.",
          "Unwanted touching or sexual comments get you removed immediately.",
        ],
      },
      {
        h: "Protect privacy",
        list: [
          "Do not photograph or record other guests without their permission.",
          "Do not share other guests' names, photos, or personal information.",
          "Camera-free events, like GFC Select™, are camera-free. Using your camera there gets you removed.",
          "Do not contact a guest after an event if they did not give you their information.",
        ],
      },
      {
        h: "Keep it safe",
        list: [
          "GFC events are alcohol-free. Do not bring alcohol or drugs, and do not arrive intoxicated. We turn away or remove anyone who does.",
          "No weapons of any kind.",
          "Follow venue rules and every instruction from GFC and venue staff.",
          "No selling, recruiting, or soliciting guests without GFC's written approval.",
        ],
      },
      {
        h: "What happens if you break these rules",
        list: [
          "We remove you from the event immediately.",
          "You forfeit your ticket and membership, with no refund.",
          "We ban you from future GFC events and memberships.",
          "We report threats, assault, and other crimes to the police.",
        ],
        after: [
          "GFC hosts decide what counts as a violation. Their decision is final.",
        ],
      },
      {
        h: "Report a problem",
        p: [
          `Tell a GFC host immediately, or email ${eventsEmail}. We act on every report and keep it confidential.`,
        ],
      },
    ],
  },

  photos: {
    path: "/photo-policy",
    title: "Photo & Video Policy",
    description: `How ${brand} uses photos and videos from events.`,
    intro: "We photograph and film our events. Here is how that works.",
    sections: [
      {
        h: "What we capture",
        p: [
          "GFC and our photographers take photos, video, and audio at events. By attending, you grant GFC permission to use your image and voice on our website, social media, emails, and promotional materials, without payment.",
        ],
      },
      {
        h: "Opting out",
        list: [
          "Tell a GFC host at check-in that you do not want to be photographed. We will keep you out of our photos as much as we can.",
          `To remove a post of yourself, email ${email} with the link. We take it down within 5 business days.`,
        ],
      },
      {
        h: "Camera-free events",
        p: [
          "GFC Select™ and other camera-free events are strictly camera-free. Phone cameras are covered at check-in. No photos or video are taken or posted by anyone. Breaking this rule gets you removed with no refund.",
        ],
      },
      {
        h: "Guests' photos",
        list: [
          "Do not photograph or record other guests without their permission.",
          "When you share photos or videos with us or tag us, you give GFC permission to repost them with credit to you.",
        ],
      },
    ],
  },

  performer: {
    path: "/performer-agreement",
    title: "Performer Agreement",
    description: `The agreement for artists, MCs, DJs, and other performers at ${brand} events.`,
    intro: `${brand} is a social club for adults 30 and older. Our showcases give artists, MCs, DJs, comedians, and other performers ("you") a stage and an audience. This agreement applies when you apply, are booked, or perform at a GFC event. You accept it when you check the agreement box on our application.`,
    sections: [
      {
        h: "1. What this is",
        list: [
          "GFC offers you a showcase opportunity. You are an independent performer, not an employee, partner, or agent of GFC.",
          "One booking does not guarantee future bookings.",
          "Your pay is limited to what's in your booking email (for example, $15 per ticket sold with your personal link, up to $75). You are responsible for your own taxes. If you earn $600 or more from GFC in a year, you must provide a W-9, and we send you a 1099.",
        ],
      },
      {
        h: "2. Showcase rules",
        list: [
          "Arrive at the time in your booking email for setup and sound check. Late arrival can cost you your set.",
          "Keep to your set time. The host ends any set that runs over.",
          "Keep your content right for a grown, mixed audience: no hate speech, slurs aimed at any group, harassment, or explicit sexual content. Ask us first if you're unsure.",
          "Follow our Code of Conduct, the venue's rules, and every instruction from GFC and venue staff.",
          "Do not bring alcohol or drugs to the event, and do not perform intoxicated.",
          "Meet the ticket requirements in your booking email (for example, at least 3 tickets sold one week before the show).",
        ],
      },
      {
        h: "3. Removal and cancellation",
        list: [
          "We cancel your booking or end your set if you break these rules, miss the ticket requirements, arrive late, or create an unsafe situation.",
          "If we remove you for misconduct, you forfeit all pay, including pay for tickets already sold.",
          "If you cancel, tell us at least 7 days before the show. Cancelling with less notice, or not showing up, ends future bookings with GFC.",
          "If GFC cancels or moves the event, we offer you a spot at a future showcase.",
        ],
      },
      {
        h: "4. Your equipment",
        p: [
          "You bring and are responsible for your own instruments, mics, cables, and gear. GFC and the venue are not liable for any loss, theft, or damage to your equipment. You are responsible for any damage your equipment or setup causes to the venue.",
        ],
      },
      {
        h: "5. Your music and material",
        list: [
          "You confirm you have the right to perform your material. Original work stays yours. For covers, you are responsible for following music licensing rules and any limits we or the venue set.",
          "You keep ownership of your music, material, and merch, and you keep 100% of your merch sales and tips.",
        ],
      },
      {
        h: "6. Photos, video, and promotion",
        list: [
          "If you checked the feature box, GFC uses your name, photo, bio, and links on its website, emails, and social media to promote the event and future showcases.",
          "GFC photographs and records parts of your performance and uses short clips to promote GFC, with credit to you. Email us to remove a post.",
          "You may record your own set for your own promotion. Tag @grownfolkscollective.",
        ],
      },
      {
        h: "7. Release",
        p: [
          `To the fullest extent allowed by ${state} law, you release and will not sue ${legalName}, its owners, team members, hosts, volunteers, venues, and partners for any injury, loss, or damage arising from your participation, except claims caused by gross negligence or willful misconduct. The Participation Waiver also applies to you.`,
        ],
      },
      {
        h: "8. Agreement",
        p: [
          `By checking the agreement box and typing your name on the application, you accept this Performer Agreement, the Code of Conduct, and the Participation Waiver. Questions? Email ${eventsEmail}.`,
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
export const PERFORMER_AGREEMENT_VERSION = "2026-10-02";
