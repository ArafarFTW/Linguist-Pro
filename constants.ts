
export interface Language {
  name: string;
  isoCode: string;
}

export const LANGUAGES: Language[] = [
  { name: 'Portuguese (Portugal)', isoCode: 'pt-PT' },
  { name: 'English (UK)', isoCode: 'en-GB' },
  { name: 'Afrikaans', isoCode: 'af-ZA' },
  { name: 'Albanian', isoCode: 'sq-AL' },
  { name: 'Amharic', isoCode: 'am-ET' },
  { name: 'Arabic', isoCode: 'ar-SA' },
  { name: 'Armenian', isoCode: 'hy-AM' },
  { name: 'Azerbaijani', isoCode: 'az-AZ' },
  { name: 'Basque', isoCode: 'eu-ES' },
  { name: 'Belarusian', isoCode: 'be-BY' },
  { name: 'Bengali', isoCode: 'bn-IN' },
  { name: 'Bosnian', isoCode: 'bs-BA' },
  { name: 'Bulgarian', isoCode: 'bg-BG' },
  { name: 'Catalan', isoCode: 'ca-ES' },
  { name: 'Cebuano', isoCode: 'ceb-PH' },
  { name: 'Chichewa', isoCode: 'ny-MW' },
  { name: 'Chinese (Simplified)', isoCode: 'zh-CN' },
  { name: 'Chinese (Traditional)', isoCode: 'zh-TW' },
  { name: 'Corsican', isoCode: 'co-FR' },
  { name: 'Croatian', isoCode: 'hr-HR' },
  { name: 'Czech', isoCode: 'cs-CZ' },
  { name: 'Danish', isoCode: 'da-DK' },
  { name: 'Dutch', isoCode: 'nl-NL' },
  { name: 'English (US)', isoCode: 'en-US' },
  { name: 'Esperanto', isoCode: 'eo' },
  { name: 'Estonian', isoCode: 'et-EE' },
  { name: 'Filipino', isoCode: 'tl-PH' },
  { name: 'Finnish', isoCode: 'fi-FI' },
  { name: 'French', isoCode: 'fr-FR' },
  { name: 'Frisian', isoCode: 'fy-NL' },
  { name: 'Galician', isoCode: 'gl-ES' },
  { name: 'Georgian', isoCode: 'ka-GE' },
  { name: 'German', isoCode: 'de-DE' },
  { name: 'Greek', isoCode: 'el-GR' },
  { name: 'Gujarati', isoCode: 'gu-IN' },
  { name: 'Haitian Creole', isoCode: 'ht-HT' },
  { name: 'Hausa', isoCode: 'ha-NG' },
  { name: 'Hawaiian', isoCode: 'haw-US' },
  { name: 'Hebrew', isoCode: 'he-IL' },
  { name: 'Hindi', isoCode: 'hi-IN' },
  { name: 'Hmong', isoCode: 'hmn' },
  { name: 'Hungarian', isoCode: 'hu-HU' },
  { name: 'Icelandic', isoCode: 'is-IS' },
  { name: 'Igbo', isoCode: 'ig-NG' },
  { name: 'Indonesian', isoCode: 'id-ID' },
  { name: 'Irish', isoCode: 'ga-IE' },
  { name: 'Italian', isoCode: 'it-IT' },
  { name: 'Japanese', isoCode: 'ja-JP' },
  { name: 'Javanese', isoCode: 'jv-ID' },
  { name: 'Kannada', isoCode: 'kn-IN' },
  { name: 'Kazakh', isoCode: 'kk-KZ' },
  { name: 'Khmer', isoCode: 'km-KH' },
  { name: 'Kinyarwanda', isoCode: 'rw-RW' },
  { name: 'Korean', isoCode: 'ko-KR' },
  { name: 'Kurdish (Kurmanji)', isoCode: 'ku-TR' },
  { name: 'Kyrgyz', isoCode: 'ky-KG' },
  { name: 'Lao', isoCode: 'lo-LA' },
  { name: 'Latin', isoCode: 'la' },
  { name: 'Latvian', isoCode: 'lv-LV' },
  { name: 'Lithuanian', isoCode: 'lt-LT' },
  { name: 'Luxembourgish', isoCode: 'lb-LU' },
  { name: 'Macedonian', isoCode: 'mk-MK' },
  { name: 'Malagasy', isoCode: 'mg-MG' },
  { name: 'Malay', isoCode: 'ms-MY' },
  { name: 'Malayalam', isoCode: 'ml-IN' },
  { name: 'Maltese', isoCode: 'mt-MT' },
  { name: 'Maori', isoCode: 'mi-NZ' },
  { name: 'Marathi', isoCode: 'mr-IN' },
  { name: 'Mongolian', isoCode: 'mn-MN' },
  { name: 'Myanmar (Burmese)', isoCode: 'my-MM' },
  { name: 'Nepali', isoCode: 'ne-NP' },
  { name: 'Norwegian', isoCode: 'no-NO' },
  { name: 'Odia (Oriya)', isoCode: 'or-IN' },
  { name: 'Pashto', isoCode: 'ps-AF' },
  { name: 'Persian', isoCode: 'fa-IR' },
  { name: 'Polish', isoCode: 'pl-PL' },
  { name: 'Portuguese (Brazil)', isoCode: 'pt-BR' },
  { name: 'Punjabi', isoCode: 'pa-IN' },
  { name: 'Romanian', isoCode: 'ro-RO' },
  { name: 'Russian', isoCode: 'ru-RU' },
  { name: 'Samoan', isoCode: 'sm-WS' },
  { name: 'Scots Gaelic', isoCode: 'gd-GB' },
  { name: 'Serbian', isoCode: 'sr-RS' },
  { name: 'Sesotho', isoCode: 'st-ZA' },
  { name: 'Shona', isoCode: 'sn-ZW' },
  { name: 'Sindhi', isoCode: 'sd-PK' },
  { name: 'Sinhala', isoCode: 'si-LK' },
  { name: 'Slovak', isoCode: 'sk-SK' },
  { name: 'Slovenian', isoCode: 'sl-SI' },
  { name: 'Somali', isoCode: 'so-SO' },
  { name: 'Spanish', isoCode: 'es-ES' },
  { name: 'Sundanese', isoCode: 'su-ID' },
  { name: 'Swahili', isoCode: 'sw-KE' },
  { name: 'Swedish', isoCode: 'sv-SE' },
  { name: 'Tajik', isoCode: 'tg-TJ' },
  { name: 'Tamil', isoCode: 'ta-IN' },
  { name: 'Tatar', isoCode: 'tt-RU' },
  { name: 'Telugu', isoCode: 'te-IN' },
  { name: 'Thai', isoCode: 'th-TH' },
  { name: 'Turkish', isoCode: 'tr-TR' },
  { name: 'Turkmen', isoCode: 'tk-TM' },
  { name: 'Ukrainian', isoCode: 'uk-UA' },
  { name: 'Urdu', isoCode: 'ur-PK' },
  { name: 'Uyghur', isoCode: 'ug-CN' },
  { name: 'Uzbek', isoCode: 'uz-UZ' },
  { name: 'Vietnamese', isoCode: 'vi-VN' },
  { name: 'Welsh', isoCode: 'cy-GB' },
  { name: 'Xhosa', isoCode: 'xh-ZA' },
  { name: 'Yiddish', isoCode: 'yi-YD' },
  { name: 'Yoruba', isoCode: 'yo-NG' },
  { name: 'Zulu', isoCode: 'zu-ZA' }
];

export interface Role {
  name: string;
  description: string;
}

export const ROLES: Role[] = [
  { 
    name: 'Official Translator for Tourism and Golf',
    description: 'Act as an official translator, having all languages of the world as your field, but having as an initial basis always the translation from Portuguese of Portugal to English of England, always using a professional language linked to tourism in general and golf in particular. Ideal for formal yet inviting content. Use for hotel websites, travel brochures, golf course rulebooks, fine dining menus, and tour descriptions. Maintains a polished, professional tone specific to the hospitality industry. Key terminology: "green fees", "handicap requirements", "concierge services", "tee times", "haute cuisine".'
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
