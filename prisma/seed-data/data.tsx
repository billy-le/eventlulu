export const leadTypes = [
  "phone-in",
  "walk-in",
  "email",
  "referral",
  "sales call",
  "telemarketing",
];

export const functionRooms = [
  "amberley",
  "belmont",
  "amberley-belmont",
  "ballroom I",
  "ballroom II",
  "ballroom III",
  "ballroom I & ballroom II",
  "ballroom II & ballroom III",
  "ballroom I & charlston",
  "grand ballroom",
  "charlston",
  "grandball room & charlston",
  "meeting room I",
  "meeting room II",
  "meeting room III",
] as const;

export const mealReqs = [
  "AM snack",
  "set lunch",
  "buffet lunch",
  "PM snack",
  "set dinner",
  "buffet dinner",
  "cocktails",
] as const;

export const rateTypes = ["per person", "minimum consumable amount"] as const;

export const roomSetups = [
  "roundtable",
  "classroom",
  "u-shape",
  "theater",
  "cocktails",
  "block",
  "existing",
] as const;

export const eventTypes = {
  corporate: [
    "convention",
    "conference/seminar",
    "training: planning session",
    "fellowship/team building",
    "business meeting",
    "luncheon/dinner",
    "christmas party",
  ],
  "social function": [
    "wedding",
    "debut",
    "baptismal",
    "kids party",
    "birthday party",
    "prom",
  ],
} as const;

export const inclusions = ["Rate is consumable of Food & Beverage"];
