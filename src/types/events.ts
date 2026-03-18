export type EventTicketView = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantityTotal: number;
  quantitySold: number;
  quantityRemaining: number;
  benefits: string[];
};

export type EventListItem = {
  id: string;
  _id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  city: string;
  venueName: string;
  startsAt: string;
  endsAt: string;
  organizerName: string;
  posterTone: string;
  featured: boolean;
  tags: string[];
  priceFrom: number;
  ticketCount: number;
};

export type EventDetail = EventListItem & {
  description: string;
  venueAddress: string;
  organizerEmail: string;
  mapUrl: string;
  ticketTypes: EventTicketView[];
};
