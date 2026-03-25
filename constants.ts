
export interface Language {
  name: string;
  isoCode: string;
  nameKey: string;
}

export const LANGUAGES: Language[] = [
  { name: 'Portuguese (Portugal)', isoCode: 'pt-PT', nameKey: 'langPt' },
  { name: 'English (UK)', isoCode: 'en-GB', nameKey: 'langEnUk' },
  { name: 'English (US)', isoCode: 'en-US', nameKey: 'langEnUs' },
  { name: 'French', isoCode: 'fr-FR', nameKey: 'langFr' },
  { name: 'German', isoCode: 'de-DE', nameKey: 'langDe' },
  { name: 'Spanish', isoCode: 'es-ES', nameKey: 'langEs' },
  { name: 'Chinese (Simplified)', isoCode: 'zh-CN', nameKey: 'langZh' },
  { name: 'Danish', isoCode: 'da-DK', nameKey: 'langDa' },
  { name: 'Finnish', isoCode: 'fi-FI', nameKey: 'langFi' },
  { name: 'Afrikaans', isoCode: 'af-ZA', nameKey: 'langAf' },
  { name: 'Albanian', isoCode: 'sq-AL', nameKey: 'langSq' },
  { name: 'Amharic', isoCode: 'am-ET', nameKey: 'langAm' },
  { name: 'Arabic', isoCode: 'ar-SA', nameKey: 'langAr' },
  { name: 'Armenian', isoCode: 'hy-AM', nameKey: 'langHy' },
  { name: 'Azerbaijani', isoCode: 'az-AZ', nameKey: 'langAz' },
  { name: 'Basque', isoCode: 'eu-ES', nameKey: 'langEu' },
  { name: 'Belarusian', isoCode: 'be-BY', nameKey: 'langBe' },
  { name: 'Bengali', isoCode: 'bn-IN', nameKey: 'langBn' },
  { name: 'Bosnian', isoCode: 'bs-BA', nameKey: 'langBs' },
  { name: 'Bulgarian', isoCode: 'bg-BG', nameKey: 'langBg' },
  { name: 'Catalan', isoCode: 'ca-ES', nameKey: 'langCa' },
  { name: 'Cebuano', isoCode: 'ceb-PH', nameKey: 'langCeb' },
  { name: 'Chichewa', isoCode: 'ny-MW', nameKey: 'langNy' },
  { name: 'Chinese (Traditional)', isoCode: 'zh-TW', nameKey: 'langZhTw' },
  { name: 'Corsican', isoCode: 'co-FR', nameKey: 'langCo' },
  { name: 'Croatian', isoCode: 'hr-HR', nameKey: 'langHr' },
  { name: 'Czech', isoCode: 'cs-CZ', nameKey: 'langCs' },
  { name: 'Dutch', isoCode: 'nl-NL', nameKey: 'langNl' },
  { name: 'Esperanto', isoCode: 'eo', nameKey: 'langEo' },
  { name: 'Estonian', isoCode: 'et-EE', nameKey: 'langEt' },
  { name: 'Filipino', isoCode: 'tl-PH', nameKey: 'langTl' },
  { name: 'Frisian', isoCode: 'fy-NL', nameKey: 'langFy' },
  { name: 'Galician', isoCode: 'gl-ES', nameKey: 'langGl' },
  { name: 'Georgian', isoCode: 'ka-GE', nameKey: 'langKa' },
  { name: 'Greek', isoCode: 'el-GR', nameKey: 'langEl' },
  { name: 'Gujarati', isoCode: 'gu-IN', nameKey: 'langGu' },
  { name: 'Haitian Creole', isoCode: 'ht-HT', nameKey: 'langHt' },
  { name: 'Hausa', isoCode: 'ha-NG', nameKey: 'langHa' },
  { name: 'Hawaiian', isoCode: 'haw-US', nameKey: 'langHaw' },
  { name: 'Hebrew', isoCode: 'he-IL', nameKey: 'langHe' },
  { name: 'Hindi', isoCode: 'hi-IN', nameKey: 'langHi' },
  { name: 'Hmong', isoCode: 'hmn', nameKey: 'langHmn' },
  { name: 'Hungarian', isoCode: 'hu-HU', nameKey: 'langHu' },
  { name: 'Icelandic', isoCode: 'is-IS', nameKey: 'langIs' },
  { name: 'Igbo', isoCode: 'ig-NG', nameKey: 'langIg' },
  { name: 'Indonesian', isoCode: 'id-ID', nameKey: 'langId' },
  { name: 'Irish', isoCode: 'ga-IE', nameKey: 'langGa' },
  { name: 'Italian', isoCode: 'it-IT', nameKey: 'langIt' },
  { name: 'Japanese', isoCode: 'ja-JP', nameKey: 'langJa' },
  { name: 'Javanese', isoCode: 'jv-ID', nameKey: 'langJv' },
  { name: 'Kannada', isoCode: 'kn-IN', nameKey: 'langKn' },
  { name: 'Kazakh', isoCode: 'kk-KZ', nameKey: 'langKk' },
  { name: 'Khmer', isoCode: 'km-KH', nameKey: 'langKm' },
  { name: 'Kinyarwanda', isoCode: 'rw-RW', nameKey: 'langRw' },
  { name: 'Korean', isoCode: 'ko-KR', nameKey: 'langKo' },
  { name: 'Kurdish (Kurmanji)', isoCode: 'ku-TR', nameKey: 'langKu' },
  { name: 'Kyrgyz', isoCode: 'ky-KG', nameKey: 'langKy' },
  { name: 'Lao', isoCode: 'lo-LA', nameKey: 'langLo' },
  { name: 'Latin', isoCode: 'la', nameKey: 'langLa' },
  { name: 'Latvian', isoCode: 'lv-LV', nameKey: 'langLv' },
  { name: 'Lithuanian', isoCode: 'lt-LT', nameKey: 'langLt' },
  { name: 'Luxembourgish', isoCode: 'lb-LU', nameKey: 'langLb' },
  { name: 'Macedonian', isoCode: 'mk-MK', nameKey: 'langMk' },
  { name: 'Malagasy', isoCode: 'mg-MG', nameKey: 'langMg' },
  { name: 'Malay', isoCode: 'ms-MY', nameKey: 'langMs' },
  { name: 'Malayalam', isoCode: 'ml-IN', nameKey: 'langMl' },
  { name: 'Maltese', isoCode: 'mt-MT', nameKey: 'langMt' },
  { name: 'Maori', isoCode: 'mi-NZ', nameKey: 'langMi' },
  { name: 'Marathi', isoCode: 'mr-IN', nameKey: 'langMr' },
  { name: 'Mongolian', isoCode: 'mn-MN', nameKey: 'langMn' },
  { name: 'Myanmar (Burmese)', isoCode: 'my-MM', nameKey: 'langMy' },
  { name: 'Nepali', isoCode: 'ne-NP', nameKey: 'langNe' },
  { name: 'Norwegian', isoCode: 'no-NO', nameKey: 'langNo' },
  { name: 'Odia (Oriya)', isoCode: 'or-IN', nameKey: 'langOr' },
  { name: 'Pashto', isoCode: 'ps-AF', nameKey: 'langPs' },
  { name: 'Persian', isoCode: 'fa-IR', nameKey: 'langFa' },
  { name: 'Polish', isoCode: 'pl-PL', nameKey: 'langPl' },
  { name: 'Portuguese (Brazil)', isoCode: 'pt-BR', nameKey: 'langPtBr' },
  { name: 'Punjabi', isoCode: 'pa-IN', nameKey: 'langPa' },
  { name: 'Romanian', isoCode: 'ro-RO', nameKey: 'langRo' },
  { name: 'Russian', isoCode: 'ru-RU', nameKey: 'langRu' },
  { name: 'Samoan', isoCode: 'sm-WS', nameKey: 'langSm' },
  { name: 'Scots Gaelic', isoCode: 'gd-GB', nameKey: 'langGd' },
  { name: 'Serbian', isoCode: 'sr-RS', nameKey: 'langSr' },
  { name: 'Sesotho', isoCode: 'st-ZA', nameKey: 'langSt' },
  { name: 'Shona', isoCode: 'sn-ZW', nameKey: 'langSn' },
  { name: 'Sindhi', isoCode: 'sd-PK', nameKey: 'langSd' },
  { name: 'Sinhala', isoCode: 'si-LK', nameKey: 'langSi' },
  { name: 'Slovak', isoCode: 'sk-SK', nameKey: 'langSk' },
  { name: 'Slovenian', isoCode: 'sl-SI', nameKey: 'langSl' },
  { name: 'Somali', isoCode: 'so-SO', nameKey: 'langSo' },
  { name: 'Sundanese', isoCode: 'su-ID', nameKey: 'langSu' },
  { name: 'Swahili', isoCode: 'sw-KE', nameKey: 'langSw' },
  { name: 'Swedish', isoCode: 'sv-SE', nameKey: 'langSv' },
  { name: 'Tajik', isoCode: 'tg-TJ', nameKey: 'langTj' },
  { name: 'Tamil', isoCode: 'ta-IN', nameKey: 'langTa' },
  { name: 'Tatar', isoCode: 'tt-RU', nameKey: 'langTt' },
  { name: 'Telugu', isoCode: 'te-IN', nameKey: 'langTe' },
  { name: 'Thai', isoCode: 'th-TH', nameKey: 'langTh' },
  { name: 'Turkish', isoCode: 'tr-TR', nameKey: 'langTr' },
  { name: 'Turkmen', isoCode: 'tk-TM', nameKey: 'langTk' },
  { name: 'Ukrainian', isoCode: 'uk-UA', nameKey: 'langUk' },
  { name: 'Urdu', isoCode: 'ur-PK', nameKey: 'langUr' },
  { name: 'Uyghur', isoCode: 'ug-CN', nameKey: 'langUg' },
  { name: 'Uzbek', isoCode: 'uz-UZ', nameKey: 'langUz' },
  { name: 'Vietnamese', isoCode: 'vi-VN', nameKey: 'langVi' },
  { name: 'Welsh', isoCode: 'cy-GB', nameKey: 'langCy' },
  { name: 'Xhosa', isoCode: 'xh-ZA', nameKey: 'langXh' },
  { name: 'Yiddish', isoCode: 'yi-YD', nameKey: 'langYi' },
  { name: 'Yoruba', isoCode: 'yo-NG', nameKey: 'langYo' },
  { name: 'Zulu', isoCode: 'zu-ZA', nameKey: 'langZu' }
];

export interface Role {
  id: string;
  name: string;
  description: string;
  nameKey: string;
  descKey: string;
}

export const ROLES: Role[] = [
  { 
    id: 'official', 
    name: 'Official Translator for Tourism and Golf',
    description: 'Act as an official translator, having all languages of the world as your field, but having as an initial basis always the translation from Portuguese of Portugal to English of England, always using a professional language linked to tourism in general and golf in particular. Ideal for formal yet inviting content. Use for hotel websites, travel brochures, golf course rulebooks, fine dining menus, and tour descriptions. Maintains a polished, professional tone specific to the hospitality industry. Key terminology: "green fees", "handicap requirements", "concierge services", "tee times", "haute cuisine".',
    nameKey: 'roleOfficialName', 
    descKey: 'roleOfficialDesc' 
  },
  { 
    id: 'guide', 
    name: 'Tour Guide Communicator',
    description: 'Friendly, engaging, and informative. Translates text to sound like an experienced local guide. Perfect for tour scripts, visitor FAQs, interactive exhibits, and creating a welcoming atmosphere. Key scenarios: narrating "clubhouse history", describing "signature holes", or pointing out "scenic viewpoints" along a coastal resort.',
    nameKey: 'roleGuideName', 
    descKey: 'roleGuideDesc' 
  },
  { 
    id: 'manager', 
    name: 'Resort & Hospitality Manager',
    description: 'Balances professional authority with warm, customer-centric language. Ideal for guest notifications, internal staff training manuals, service descriptions, and policy documents in hotels and resorts. Key scenarios: handling "guest relations", "spa reservations", "room upgrades", and communicating "tournament logistics" to VIPs.',
    nameKey: 'roleManagerName', 
    descKey: 'roleManagerDesc' 
  },
  { 
    id: 'architect', 
    name: 'Golf Course Architect & Designer',
    description: 'Employs technical and descriptive language to convey design intent. Best for translating architectural plans, course maintenance reports, environmental impact statements, and presentations to club members. Key terminology: "bunker placement", "green undulations", "fairway routing", "turf management", "links-style layout".',
    nameKey: 'roleArchitectName', 
    descKey: 'roleArchitectDesc' 
  },
  { 
    id: 'coordinator', 
    name: 'Event Coordinator & Planner',
    description: 'Clear, organized, and persuasive tone. Use for event itineraries, marketing emails, vendor contracts, and promotional materials for conferences, tournaments, or weddings in a hospitality setting. Key scenarios: organizing a "shotgun start", coordinating "gala dinners", managing "corporate retreats", and planning "award ceremonies".',
    nameKey: 'roleCoordinatorName', 
    descKey: 'roleCoordinatorDesc' 
  },
  { 
    id: 'general', 
    name: 'General Professional Translator',
    description: 'A reliable, all-purpose persona for clear and accurate business communication. Best for corporate emails, internal memos, business reports, presentations, and professional correspondence that requires a neutral, formal tone. Key scenarios: negotiating "B2B partnerships", drafting "travel agency contracts", and finalizing "supplier agreements".',
    nameKey: 'roleGeneralName', 
    descKey: 'roleGeneralDesc' 
  },
  { 
    id: 'literary', 
    name: 'Literary Translator for Creative Prose',
    description: 'Focuses on artfully preserving the author\'s unique voice, style, and cultural nuances. Perfect for novels, short stories, poetry, and film scripts, where tone, rhythm, and figurative language are paramount. Key scenarios: translating evocative "travelogues", engaging "golfing memoirs", and immersive "destination storytelling".',
    nameKey: 'roleLiteraryName', 
    descKey: 'roleLiteraryDesc' 
  },
  { 
    id: 'technical', 
    name: 'Technical Translator for Manuals and Documentation',
    description: 'Prioritizes precision, consistency, and clarity for specialized content. Use for instruction manuals, software documentation, engineering specifications, and scientific papers where technical accuracy is critical. Key scenarios: translating "golf cart maintenance" guides, "irrigation system" specs, and "booking software manuals".',
    nameKey: 'roleTechnicalName', 
    descKey: 'roleTechnicalDesc' 
  },
  { 
    id: 'marketing', 
    name: 'Marketing Translator for Advertising Copy',
    description: 'Goes beyond literal translation to adapt slogans, ad campaigns, and social media posts to be persuasive and culturally impactful. This process, often called "transcreation," ensures the message resonates with the target audience. Key scenarios: promoting "stay-and-play packages", "early bird discounts", and "luxury resort campaigns".',
    nameKey: 'roleMarketingName', 
    descKey: 'roleMarketingDesc' 
  },
  { 
    id: 'legal', 
    name: 'Legal Translator for Contracts and Documents',
    description: 'Delivers precise, literal translations where every word counts. Essential for contracts, terms of service agreements, privacy policies, court documents, and other legal notices where ambiguity must be avoided at all costs. Key scenarios: drafting "liability waivers", "membership agreements", and "cancellation policies".',
    nameKey: 'roleLegalName', 
    descKey: 'roleLegalDesc' 
  },
  { 
    id: 'medical', 
    name: 'Medical Translator for Healthcare Information',
    description: 'Ensures the highest level of accuracy for sensitive healthcare content. Use for patient-facing information, clinical trial documents, pharmaceutical instructions, and medical device manuals where clarity can impact patient safety. Key scenarios: detailing protocols for "on-course emergencies", "spa wellness waivers", and managing "dietary restrictions".',
    nameKey: 'roleMedicalName', 
    descKey: 'roleMedicalDesc' 
  },
];

export const UI_LANG_TO_TARGET_LANG: Record<string, string> = {
  en: 'English (UK)',
  pt: 'Portuguese (Portugal)',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  zh: 'Chinese (Simplified)',
  da: 'Danish',
  fi: 'Finnish',
};
