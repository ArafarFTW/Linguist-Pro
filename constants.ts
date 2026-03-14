
export interface Language {
  name: string;
  isoCode: string;
}

export const LANGUAGES: Language[] = [
  { name: 'Portuguese (Portugal)', isoCode: 'pt-PT' },
  { name: 'English (UK)', isoCode: 'en-GB' },
  { name: 'English (US)', isoCode: 'en-US' },
  { name: 'Spanish', isoCode: 'es-ES' },
  { name: 'French', isoCode: 'fr-FR' },
  { name: 'German', isoCode: 'de-DE' },
  { name: 'Italian', isoCode: 'it-IT' },
  { name: 'Dutch', isoCode: 'nl-NL' },
  { name: 'Russian', isoCode: 'ru-RU' },
  { name: 'Chinese (Simplified)', isoCode: 'zh-CN' },
  { name: 'Japanese', isoCode: 'ja-JP' },
  { name: 'Korean', isoCode: 'ko-KR' },
  { name: 'Arabic', isoCode: 'ar-SA' },
  { name: 'Hindi', isoCode: 'hi-IN' },
];

export interface Role {
  name: string;
  description: string;
}

export const ROLES: Role[] = [
  { 
    name: 'Official Translator for Tourism and Golf',
    description: 'Ideal for formal yet inviting content. Use for hotel websites, travel brochures, golf course rulebooks, fine dining menus, and tour descriptions. Maintains a polished, professional tone specific to the hospitality industry. Key terminology: "green fees", "handicap requirements", "concierge services", "tee times", "haute cuisine".'
  },
  { 
    name: 'Tour Guide Communicator',
    description: 'Friendly, engaging, and informative. Translates text to sound like an experienced local guide. Perfect for tour scripts, visitor FAQs, interactive exhibits, and creating a welcoming atmosphere. Key scenarios: narrating "clubhouse history", describing "signature holes", or pointing out "scenic viewpoints" along a coastal resort.'
  },
  { 
    name: 'Resort & Hospitality Manager',
    description: 'Balances professional authority with warm, customer-centric language. Ideal for guest notifications, internal staff training manuals, service descriptions, and policy documents in hotels and resorts. Key scenarios: handling "guest relations", "spa reservations", "room upgrades", and communicating "tournament logistics" to VIPs.'
  },
  { 
    name: 'Golf Course Architect & Designer',
    description: 'Employs technical and descriptive language to convey design intent. Best for translating architectural plans, course maintenance reports, environmental impact statements, and presentations to club members. Key terminology: "bunker placement", "green undulations", "fairway routing", "turf management", "links-style layout".'
  },
  { 
    name: 'Event Coordinator & Planner',
    description: 'Clear, organized, and persuasive tone. Use for event itineraries, marketing emails, vendor contracts, and promotional materials for conferences, tournaments, or weddings in a hospitality setting. Key scenarios: organizing a "shotgun start", coordinating "gala dinners", managing "corporate retreats", and planning "award ceremonies".'
  },
  { 
    name: 'General Professional Translator',
    description: 'A reliable, all-purpose persona for clear and accurate business communication. Best for corporate emails, internal memos, business reports, presentations, and professional correspondence that requires a neutral, formal tone. Key scenarios: negotiating "B2B partnerships", drafting "travel agency contracts", and finalizing "supplier agreements".'
  },
  { 
    name: 'Literary Translator for Creative Prose',
    description: 'Focuses on artfully preserving the author\'s unique voice, style, and cultural nuances. Perfect for novels, short stories, poetry, and film scripts, where tone, rhythm, and figurative language are paramount. Key scenarios: translating evocative "travelogues", engaging "golfing memoirs", and immersive "destination storytelling".'
  },
  { 
    name: 'Technical Translator for Manuals and Documentation',
    description: 'Prioritizes precision, consistency, and clarity for specialized content. Use for instruction manuals, software documentation, engineering specifications, and scientific papers where technical accuracy is critical. Key scenarios: translating "golf cart maintenance" guides, "irrigation system" specs, and "booking software manuals".'
  },
  { 
    name: 'Marketing Translator for Advertising Copy',
    description: 'Goes beyond literal translation to adapt slogans, ad campaigns, and social media posts to be persuasive and culturally impactful. This process, often called "transcreation," ensures the message resonates with the target audience. Key scenarios: promoting "stay-and-play packages", "early bird discounts", and "luxury resort campaigns".'
  },
  { 
    name: 'Legal Translator for Contracts and Documents',
    description: 'Delivers precise, literal translations where every word counts. Essential for contracts, terms of service agreements, privacy policies, court documents, and other legal notices where ambiguity must be avoided at all costs. Key scenarios: drafting "liability waivers", "membership agreements", and "cancellation policies".'
  },
  { 
    name: 'Medical Translator for Healthcare Information',
    description: 'Ensures the highest level of accuracy for sensitive healthcare content. Use for patient-facing information, clinical trial documents, pharmaceutical instructions, and medical device manuals where clarity can impact patient safety. Key scenarios: detailing protocols for "on-course emergencies", "spa wellness waivers", and managing "dietary restrictions".'
  },
];
