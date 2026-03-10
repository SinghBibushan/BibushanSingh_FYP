export type DemoTicketType = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantityTotal: number;
  quantitySold: number;
  benefits: string[];
};

export type DemoEvent = {
  id: string;
  title: string;
  slug: string;
  category: string;
  city: string;
  venueName: string;
  venueAddress: string;
  startsAt: string;
  endsAt: string;
  priceFrom: number;
  summary: string;
  description: string;
  organizerName: string;
  organizerEmail: string;
  mapUrl: string;
  tags: string[];
  featured: boolean;
  posterTone: string;
  ticketTypes: DemoTicketType[];
};

export const demoEvents: DemoEvent[] = [
  {
    id: "evt_demo_ktm_night_vibes",
    title: "Kathmandu Night Vibes",
    slug: "kathmandu-night-vibes",
    category: "Concert",
    city: "Kathmandu",
    venueName: "Bhrikutimandap Arena",
    venueAddress: "Bhrikutimandap, Kathmandu 44600, Nepal",
    startsAt: "2026-04-18T18:30:00.000Z",
    endsAt: "2026-04-18T23:15:00.000Z",
    priceFrom: 1499,
    summary:
      "An open-air concert with Nepali indie, electronic visuals, and premium lounge access.",
    description:
      "Kathmandu Night Vibes blends live indie sets, visual installations, craft food stalls, and a premium lounge experience into one headline city event. Designed for a high-energy crowd, the evening is structured for both casual attendees and VIP guests who want better views, faster entry, and curated add-ons.",
    organizerName: "Everest Live Collective",
    organizerEmail: "hello@everestlive.example",
    mapUrl: "https://maps.google.com/?q=Bhrikutimandap%20Kathmandu",
    tags: ["music", "nightlife", "live-performance"],
    featured: true,
    posterTone: "from-[#11213f] via-[#224d61] to-[#d97706]",
    ticketTypes: [
      {
        id: "tt_demo_ktm_standard",
        name: "Standard",
        description: "General entry with access to all performances and food stalls.",
        price: 1499,
        currency: "NPR",
        quantityTotal: 450,
        quantitySold: 178,
        benefits: ["General entry", "Event wristband"],
      },
      {
        id: "tt_demo_ktm_vip",
        name: "VIP Deck",
        description: "Priority entry, elevated viewing deck, and complimentary beverage.",
        price: 3499,
        currency: "NPR",
        quantityTotal: 120,
        quantitySold: 54,
        benefits: ["Priority check-in", "VIP viewing deck", "1 welcome drink"],
      },
    ],
  },
  {
    id: "evt_demo_pokhara_film_fest",
    title: "Pokhara Adventure Film Fest",
    slug: "pokhara-adventure-film-fest",
    category: "Festival",
    city: "Pokhara",
    venueName: "Lakeside Convention Hall",
    venueAddress: "Lakeside Road, Pokhara 33700, Nepal",
    startsAt: "2026-05-03T11:00:00.000Z",
    endsAt: "2026-05-03T20:00:00.000Z",
    priceFrom: 799,
    summary:
      "Films, workshops, and creator talks focused on mountain culture and outdoor storytelling.",
    description:
      "Pokhara Adventure Film Fest is a one-day destination experience that mixes documentary screenings, creator panels, outdoor brand showcases, and a lakeside networking session. It is designed to feel premium, educational, and visually strong for demonstration.",
    organizerName: "Trail Frame Nepal",
    organizerEmail: "team@trailframe.example",
    mapUrl: "https://maps.google.com/?q=Lakeside%20Convention%20Hall%20Pokhara",
    tags: ["film", "adventure", "creator-community"],
    featured: true,
    posterTone: "from-[#18304b] via-[#2a6478] to-[#e09f3e]",
    ticketTypes: [
      {
        id: "tt_demo_pokhara_pass",
        name: "Festival Pass",
        description: "Full-day access to screenings, talks, and exhibition booths.",
        price: 799,
        currency: "NPR",
        quantityTotal: 600,
        quantitySold: 221,
        benefits: ["All screenings", "Talk sessions", "Networking access"],
      },
      {
        id: "tt_demo_pokhara_creator",
        name: "Creator Circle",
        description: "Includes reserved seating and workshop access.",
        price: 1799,
        currency: "NPR",
        quantityTotal: 160,
        quantitySold: 47,
        benefits: ["Reserved seating", "Workshop access", "Creator networking circle"],
      },
    ],
  },
  {
    id: "evt_demo_startup_sprint",
    title: "Startup Sprint Nepal",
    slug: "startup-sprint-nepal",
    category: "Conference",
    city: "Lalitpur",
    venueName: "Innovation Hub, Jawalakhel",
    venueAddress: "Jawalakhel, Lalitpur 44700, Nepal",
    startsAt: "2026-05-15T09:00:00.000Z",
    endsAt: "2026-05-15T18:30:00.000Z",
    priceFrom: 2499,
    summary:
      "A one-day builder conference for product teams, founders, and student innovators.",
    description:
      "Startup Sprint Nepal brings together startup operators, designers, engineers, and investors for tactical sessions on growth, product execution, and fundraising. The format includes keynote sessions, breakout tracks, and startup showcase booths.",
    organizerName: "Build Nepal Forum",
    organizerEmail: "ops@buildnepal.example",
    mapUrl: "https://maps.google.com/?q=Innovation%20Hub%20Jawalakhel",
    tags: ["startup", "conference", "networking"],
    featured: false,
    posterTone: "from-[#1a2740] via-[#335b72] to-[#ffb703]",
    ticketTypes: [
      {
        id: "tt_demo_sprint_standard",
        name: "Conference Pass",
        description: "Access to all main-stage sessions and networking lounge.",
        price: 2499,
        currency: "NPR",
        quantityTotal: 300,
        quantitySold: 92,
        benefits: ["Main-stage access", "Networking lounge"],
      },
      {
        id: "tt_demo_sprint_team",
        name: "Team Bundle Seat",
        description: "Designed for startup teams attending together.",
        price: 2199,
        currency: "NPR",
        quantityTotal: 200,
        quantitySold: 64,
        benefits: ["Builder track access", "Team-friendly pricing"],
      },
    ],
  },
  {
    id: "evt_demo_bharatpur_food_lab",
    title: "Bharatpur Food Lab",
    slug: "bharatpur-food-lab",
    category: "Food",
    city: "Bharatpur",
    venueName: "Riverfront Exhibition Ground",
    venueAddress: "Narayani Riverfront, Bharatpur 44200, Nepal",
    startsAt: "2026-06-06T12:00:00.000Z",
    endsAt: "2026-06-06T21:30:00.000Z",
    priceFrom: 599,
    summary:
      "A curated tasting event featuring regional chefs, live demos, and artisan food brands.",
    description:
      "Bharatpur Food Lab highlights regional culinary talent through tasting zones, live masterclasses, and a chef-storytelling stage. The event is designed to support strong category filtering beyond music and conferences.",
    organizerName: "Taste Circuit Nepal",
    organizerEmail: "hello@tastecircuit.example",
    mapUrl: "https://maps.google.com/?q=Riverfront%20Exhibition%20Ground%20Bharatpur",
    tags: ["food", "culinary", "family-friendly"],
    featured: false,
    posterTone: "from-[#4d2d18] via-[#8f5b34] to-[#f4a261]",
    ticketTypes: [
      {
        id: "tt_demo_food_entry",
        name: "Entry Pass",
        description: "Includes venue access and tasting zone entry.",
        price: 599,
        currency: "NPR",
        quantityTotal: 500,
        quantitySold: 140,
        benefits: ["Venue access", "Tasting zones"],
      },
      {
        id: "tt_demo_food_masterclass",
        name: "Masterclass Seat",
        description: "Entry pass plus chef workshop access.",
        price: 1299,
        currency: "NPR",
        quantityTotal: 120,
        quantitySold: 33,
        benefits: ["Workshop access", "Reserved seating"],
      },
    ],
  },
];

export const demoMetrics = [
  { label: "Monthly Bookings", value: "1,284", note: "+14% vs last month" },
  { label: "Gross Sales", value: "NPR 8.4L", note: "Across 18 live events" },
  { label: "Verified Students", value: "216", note: "68 pending reviews" },
  { label: "Gold Members", value: "92", note: "High-value returning users" },
];
