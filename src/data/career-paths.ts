export interface CareerPath {
  id: string;
  name: { de: string; en: string };
  category:
    | "vocational"
    | "academic"
    | "voluntary"
    | "international"
    | "entrepreneurship"
    | "public";
  duration: { de: string; en: string };
  requirements: { de: string; en: string };
  description: { de: string; en: string };
  tags: string[];
}

export const careerPaths: CareerPath[] = [
  {
    id: "ausbildung",
    name: { de: "Ausbildung (Berufsausbildung)", en: "Vocational Training (Ausbildung)" },
    category: "vocational",
    duration: { de: "2–3,5 Jahre", en: "2–3.5 years" },
    requirements: { de: "Mind. Hauptschulabschluss", en: "Min. lower secondary school certificate" },
    description: {
      de: "Das duale Ausbildungssystem kombiniert praktisches Lernen im Betrieb mit theoretischem Unterricht in der Berufsschule. Ca. 325 anerkannte Ausbildungsberufe — von IT über Handwerk bis zum Kaufmännischen. Bezahlte Ausbildungsvergütung.",
      en: "The dual vocational training system combines hands-on learning in a company with theory at a vocational school. ~325 recognized professions — from IT to trades to business. You receive a training allowance.",
    },
    tags: ["hands-on", "practical", "earning", "structured", "technical", "commercial", "social", "craft"],
  },
  {
    id: "duales-studium",
    name: { de: "Duales Studium", en: "Dual Study Program" },
    category: "academic",
    duration: { de: "3–4 Jahre", en: "3–4 years" },
    requirements: { de: "Abitur oder Fachabitur", en: "Abitur or Fachabitur" },
    description: {
      de: "Verbindet ein Hochschulstudium (Bachelor) mit praktischer Unternehmenserfahrung. Die ausbildende Firma zahlt Vergütung. Abschluss: Bachelor + ggf. Berufsabschluss. Sehr beliebt in Deutschland.",
      en: "Combines a university Bachelor's degree with hands-on company experience. The partner company pays a salary. You graduate with a Bachelor's degree and optionally a vocational certificate. Very popular in Germany.",
    },
    tags: ["academic", "practical", "earning", "structured", "business", "technical"],
  },
  {
    id: "studium-universitaet",
    name: { de: "Studium an der Universität", en: "University Study" },
    category: "academic",
    duration: { de: "3–5 Jahre (Bachelor/Master)", en: "3–5 years (Bachelor/Master)" },
    requirements: { de: "Abitur", en: "Abitur" },
    description: {
      de: "Akademisch, forschungsorientiert. Breites Fächerspektrum von Naturwissenschaften über Geisteswissenschaften bis Medizin und Jura. Tiefes theoretisches Wissen und wissenschaftliches Arbeiten.",
      en: "Academic, research-oriented. Wide range of subjects from natural sciences to humanities, medicine, and law. Deep theoretical knowledge and scientific methodology.",
    },
    tags: ["academic", "intellectual", "research", "science", "arts", "medicine", "law"],
  },
  {
    id: "studium-fh",
    name: { de: "Studium an der Fachhochschule / HAW", en: "University of Applied Sciences" },
    category: "academic",
    duration: { de: "3,5–4 Jahre", en: "3.5–4 years" },
    requirements: { de: "Abitur oder Fachabitur", en: "Abitur or Fachabitur" },
    description: {
      de: "Praxisorientierter als die Universität. Pflichtpraktika integriert. Schwerpunkte: Technik, Wirtschaft, Soziales, Design, Informatik. Starke Unternehmensvernetzung.",
      en: "More practice-oriented than university. Mandatory internships included. Focus areas: engineering, business, social work, design, computer science. Strong industry connections.",
    },
    tags: ["academic", "practical", "technical", "business", "design", "social"],
  },
  {
    id: "meister",
    name: { de: "Meisterbrief / Meisterausbildung", en: "Master Craftsman Certificate" },
    category: "vocational",
    duration: { de: "1–2 Jahre Vollzeit oder berufsbegleitend", en: "1–2 years full-time or part-time" },
    requirements: { de: "Abgeschlossene Ausbildung + Berufserfahrung", en: "Completed Ausbildung + work experience" },
    description: {
      de: "Höchste Qualifikation im Handwerk. Erlaubt eigene Betriebsgründung und Ausbildung von Lehrlingen. Seit 2020 dem Bachelor gleichgestellt. Meistertitel in ca. 130 Handwerksberufen.",
      en: "Highest qualification in the trades. Allows running your own business and training apprentices. Equivalent to a Bachelor's degree since 2020. Available in ~130 trade professions.",
    },
    tags: ["hands-on", "craft", "leadership", "entrepreneurship", "earning", "technical"],
  },
  {
    id: "techniker",
    name: { de: "Staatlich geprüfter Techniker", en: "State-Certified Technician" },
    category: "vocational",
    duration: { de: "2 Jahre Vollzeit oder 4 Jahre Teilzeit", en: "2 years full-time or 4 years part-time" },
    requirements: { de: "Abgeschlossene Ausbildung im technischen Bereich", en: "Completed vocational training in a technical field" },
    description: {
      de: "Weiterbildung nach der Ausbildung an einer Fachschule. Technisch-ingenieurnahe Qualifikation. Eröffnet oft den Weg zum Fachhochschulstudium (Fachhochschulreife).",
      en: "Further education after vocational training at a specialist school. Near-engineering qualification. Often opens the path to a university of applied sciences.",
    },
    tags: ["technical", "practical", "structured", "engineering"],
  },
  {
    id: "fachwirt",
    name: { de: "Fachwirt / Betriebswirt (IHK)", en: "Business Specialist (IHK)" },
    category: "vocational",
    duration: { de: "1,5–2 Jahre berufsbegleitend", en: "1.5–2 years part-time" },
    requirements: { de: "Abgeschlossene kaufmännische Ausbildung", en: "Completed commercial vocational training" },
    description: {
      de: "Kaufmännische Weiterbildung nach der Ausbildung. IHK-Zertifikat. Fokus auf Betriebswirtschaft, Management und Führung. Viele Fachrichtungen verfügbar.",
      en: "Business further education after vocational training. IHK certificate. Focus on business administration, management, and leadership. Many specializations available.",
    },
    tags: ["business", "management", "commercial", "structured"],
  },
  {
    id: "erzieher",
    name: { de: "Erzieher/-in (Fachschule)", en: "Early Childhood Educator (Fachschule)" },
    category: "vocational",
    duration: { de: "3 Jahre (inkl. Praktikum)", en: "3 years (incl. internship)" },
    requirements: { de: "Mittlere Reife + Vorpraktikum oder Ausbildung", en: "Mittlere Reife + preparatory internship or training" },
    description: {
      de: "Staatlich anerkannte Ausbildung zur Erzieherin / zum Erzieher an einer Fachschule für Sozialpädagogik. Arbeit in Kitas, Horten, Jugendzentren.",
      en: "State-recognized training as early childhood educator at a specialist school for social pedagogy. Work in daycare centers, after-school care, and youth centers.",
    },
    tags: ["social", "children", "caring", "creative", "people"],
  },
  {
    id: "pflegefachmann",
    name: { de: "Pflegefachmann/-frau", en: "Nursing Professional" },
    category: "vocational",
    duration: { de: "3 Jahre", en: "3 years" },
    requirements: { de: "Mind. Mittlere Reife", en: "Min. Mittlere Reife" },
    description: {
      de: "Generalistische Pflegeausbildung seit 2020. Umfasst Kranken-, Alten- und Kinderkrankenpflege. Sehr gute Berufsaussichten. Ausbildungsvergütung.",
      en: "Generalist nursing training since 2020. Covers adult, elderly, and pediatric nursing. Excellent job prospects. Training allowance included.",
    },
    tags: ["caring", "medical", "social", "hands-on", "people", "practical"],
  },
  {
    id: "fsj",
    name: { de: "Freiwilliges Soziales Jahr (FSJ)", en: "Voluntary Social Year (FSJ)" },
    category: "voluntary",
    duration: { de: "6–18 Monate", en: "6–18 months" },
    requirements: { de: "Mind. 16 Jahre, Schulabschluss", en: "Min. 16 years, school certificate" },
    description: {
      de: "Freiwilliger Dienst in sozialen Einrichtungen: Krankenhäuser, Kitas, Schulen, Behinderteneinrichtungen. Kleines Taschengeld (~450€/Monat). Unterkunft und Verpflegung ggf. gestellt. Hervorragend zur Orientierung.",
      en: "Voluntary service in social institutions: hospitals, daycare, schools, disability care. Small stipend (~€450/month). Accommodation and meals may be provided. Excellent for orientation.",
    },
    tags: ["social", "caring", "orientation", "people", "experience", "gap-year"],
  },
  {
    id: "foej",
    name: { de: "Freiwilliges Ökologisches Jahr (FÖJ)", en: "Voluntary Ecological Year (FÖJ)" },
    category: "voluntary",
    duration: { de: "6–18 Monate", en: "6–18 months" },
    requirements: { de: "Mind. 16 Jahre", en: "Min. 16 years" },
    description: {
      de: "Freiwilliger Dienst im Umwelt- und Naturschutzbereich: Naturschutzgebiete, Umweltorganisationen, Nationalparks. Für Naturbegeisterte und Umweltbewusste.",
      en: "Voluntary service in environmental and nature conservation: nature reserves, environmental organizations, national parks. For nature and ecology enthusiasts.",
    },
    tags: ["nature", "environment", "outdoor", "orientation", "gap-year"],
  },
  {
    id: "bfd",
    name: { de: "Bundesfreiwilligendienst (BFD)", en: "Federal Voluntary Service (BFD)" },
    category: "voluntary",
    duration: { de: "6–18 Monate", en: "6–18 months" },
    requirements: { de: "Mind. 16 Jahre", en: "Min. 16 years" },
    description: {
      de: "Staatliches Freiwilligenprogramm in sozialen, ökologischen und kulturellen Bereichen. Ähnlich FSJ. Auch Auslandsoptionen verfügbar.",
      en: "Government voluntary program in social, ecological, and cultural fields. Similar to FSJ. International options also available.",
    },
    tags: ["social", "environment", "cultural", "orientation", "gap-year"],
  },
  {
    id: "europaeisches-solidaritaetskorps",
    name: { de: "Europäisches Solidaritätskorps (ESK)", en: "European Solidarity Corps (ESC)" },
    category: "voluntary",
    duration: { de: "2–12 Monate", en: "2–12 months" },
    requirements: { de: "18–30 Jahre, EU-Bürger/-in", en: "18–30 years, EU citizen" },
    description: {
      de: "EU-finanzierter Freiwilligendienst in einem anderen EU-Land. Unterkunft, Verpflegung und Taschengeld werden gestellt. Toll für Spracherwerb und europäische Erfahrungen.",
      en: "EU-funded voluntary service in another EU country. Accommodation, meals, and stipend provided. Great for language learning and European experience.",
    },
    tags: ["international", "europe", "social", "language", "adventure", "gap-year"],
  },
  {
    id: "weltwaerts",
    name: { de: "weltwärts (Entwicklungsfreiwilligendienst)", en: "weltwärts (Development Volunteer Service)" },
    category: "voluntary",
    duration: { de: "6–24 Monate", en: "6–24 months" },
    requirements: { de: "18–28 Jahre", en: "18–28 years" },
    description: {
      de: "Bundesregierungsprogramm für Entwicklungsfreiwillige. Einsatz in Afrika, Asien oder Lateinamerika. Kosten werden übernommen. Für Menschen mit Interesse an globaler Gerechtigkeit.",
      en: "German government development volunteer program. Deployments in Africa, Asia, or Latin America. Costs covered. For those interested in global development and justice.",
    },
    tags: ["international", "development", "social", "adventure", "global", "gap-year"],
  },
  {
    id: "work-and-travel",
    name: { de: "Work & Travel", en: "Work & Travel" },
    category: "international",
    duration: { de: "1–2 Jahre", en: "1–2 years" },
    requirements: { de: "Mind. 18 Jahre, Working Holiday Visum (Australien, Neuseeland, Kanada, ...)", en: "Min. 18 years, Working Holiday Visa (Australia, New Zealand, Canada, ...)" },
    description: {
      de: "Leben und Arbeiten im Ausland — Australien, Neuseeland, Kanada, Irland und weitere. Temporäre Jobs finanzieren das Reisen. Englischkenntnisse verbessern, Weltoffenheit entwickeln.",
      en: "Live and work abroad — Australia, New Zealand, Canada, Ireland, and more. Temporary jobs fund travel. Improve English skills and develop global perspective.",
    },
    tags: ["adventure", "international", "freedom", "language", "travel", "earning"],
  },
  {
    id: "au-pair",
    name: { de: "Au Pair", en: "Au Pair" },
    category: "international",
    duration: { de: "6–24 Monate", en: "6–24 months" },
    requirements: { de: "18–26 Jahre, Grundkenntnisse Zielsprache", en: "18–26 years, basic knowledge of target language" },
    description: {
      de: "Leben bei einer Gastfamilie im Ausland, Kinderbetreuung im Austausch für Unterkunft, Verpflegung und Taschengeld. Intensive Spracherfahrung. Beliebt in USA, Frankreich, UK, Spanien.",
      en: "Live with a host family abroad, providing childcare in exchange for accommodation, meals, and pocket money. Intensive language immersion. Popular in USA, France, UK, Spain.",
    },
    tags: ["international", "children", "language", "family", "social", "adventure"],
  },
  {
    id: "sprachkurs-ausland",
    name: { de: "Sprachkurs im Ausland", en: "Language Course Abroad" },
    category: "international",
    duration: { de: "1–12 Monate", en: "1–12 months" },
    requirements: { de: "Keine formalen Voraussetzungen", en: "No formal requirements" },
    description: {
      de: "Intensiver Sprachkurs in englischsprachigen Ländern (UK, Irland, USA, Australien) oder anderen Sprachräumen. Schneller Sprachfortschritt durch Immersion.",
      en: "Intensive language course in English-speaking countries (UK, Ireland, USA, Australia) or other language regions. Rapid language progress through immersion.",
    },
    tags: ["language", "international", "adventure", "self-improvement"],
  },
  {
    id: "bundeswehr",
    name: { de: "Bundeswehr", en: "German Armed Forces (Bundeswehr)" },
    category: "public",
    duration: { de: "7 Monate (freiwillig) bis Berufslaufbahn", en: "7 months (voluntary) to full career" },
    requirements: { de: "Mind. 17 Jahre, deutsche Staatsangehörigkeit", en: "Min. 17 years, German citizenship" },
    description: {
      de: "Freiwilliger Wehrdienst (7–23 Monate), Zeitsoldat oder Berufssoldat. Breite Ausbildungs- und Karrieremöglichkeiten: Offizierslaufbahn (mit Studium an Bundeswehr-Universität), Techniker, Pilot u.v.m.",
      en: "Voluntary military service (7–23 months), time-limited or career soldier. Wide training and career options: officer track (with Bundeswehr University study), technician, pilot, and more.",
    },
    tags: ["structured", "physical", "leadership", "technical", "security", "discipline"],
  },
  {
    id: "polizei",
    name: { de: "Polizei / Feuerwehr (Öffentlicher Dienst)", en: "Police / Fire Service (Public Sector)" },
    category: "public",
    duration: { de: "2,5–3 Jahre Ausbildung/Studium", en: "2.5–3 years training/study" },
    requirements: { de: "Mittlerer Dienst: Mittlere Reife; Gehobener Dienst: Abitur", en: "Middle level: Mittlere Reife; Senior level: Abitur" },
    description: {
      de: "Ausbildung oder Studium (gehobener Dienst: Polizei-Bachelor). Sicherer Arbeitsplatz im öffentlichen Dienst. Körperlicher Eignungstest und psychologische Prüfung erforderlich.",
      en: "Vocational training or study (senior level: Police Bachelor's degree). Secure public sector job. Physical fitness test and psychological assessment required.",
    },
    tags: ["physical", "social", "security", "structured", "public-service", "leadership"],
  },
  {
    id: "selbstaendigkeit",
    name: { de: "Selbstständigkeit / Gründung", en: "Self-employment / Entrepreneurship" },
    category: "entrepreneurship",
    duration: { de: "Sofortig möglich", en: "Can start immediately" },
    requirements: { de: "Gewerbeanmeldung oder freiberufliche Tätigkeit", en: "Business registration or freelance status" },
    description: {
      de: "Eigenes Unternehmen gründen (UG, GmbH) oder als Freiberufler tätig sein. Förderprogramme: EXIST (für Studenten), KfW-Gründerkredit, Gründungszuschuss der Arbeitsagentur. Hohe Eigenverantwortung, maximale Freiheit.",
      en: "Start your own company (UG, GmbH) or work as a freelancer. Support programs: EXIST (for students), KfW start-up loan, founding grant from employment agency. High responsibility, maximum freedom.",
    },
    tags: ["creative", "freedom", "risk", "innovative", "leadership", "ambitious"],
  },
  {
    id: "fernstudium",
    name: { de: "Fernstudium", en: "Distance / Online Study" },
    category: "academic",
    duration: { de: "3–5 Jahre (neben dem Beruf)", en: "3–5 years (alongside work)" },
    requirements: { de: "Abitur oder gleichwertig", en: "Abitur or equivalent" },
    description: {
      de: "Studieren ohne Präsenzpflicht. FernUniversität Hagen (staatlich) oder private Anbieter (IU, IUBH). Ideal für Berufstätige oder Menschen mit eingeschränkter Mobilität. Bachelor- und Masterabschlüsse.",
      en: "Study without attending campus. FernUniversität Hagen (public) or private providers (IU, IUBH). Ideal for working adults or those with limited mobility. Bachelor's and Master's degrees.",
    },
    tags: ["academic", "flexible", "self-directed", "digital", "independent"],
  },
  {
    id: "gap-year",
    name: { de: "Gap Year / Orientierungsjahr", en: "Gap Year" },
    category: "international",
    duration: { de: "6–12 Monate", en: "6–12 months" },
    requirements: { de: "Keine formalen Voraussetzungen", en: "No formal requirements" },
    description: {
      de: "Selbstorganisiertes Jahr zur Orientierung: Reisen, Jobben, Freiwilligenarbeit, Selbstreflexion. Hilfreich, wenn noch keine klare Richtung gefunden ist. Sorgfältige Planung empfohlen.",
      en: "Self-organized year for orientation: travel, working, volunteering, self-reflection. Helpful when no clear direction has been found yet. Careful planning recommended.",
    },
    tags: ["adventure", "freedom", "orientation", "self-improvement", "travel", "flexible"],
  },
  {
    id: "zweiter-bildungsweg",
    name: { de: "Zweiter Bildungsweg / Abendschule", en: "Second Educational Path / Evening School" },
    category: "academic",
    duration: { de: "1–3 Jahre", en: "1–3 years" },
    requirements: { de: "Bestehendes Schulzeugnis, Berufstätigkeit möglich", en: "Existing school certificate, can work simultaneously" },
    description: {
      de: "Nachholen von Schulabschlüssen (Mittlere Reife, Abitur) neben dem Beruf. Volkshochschule, Abendgymnasium, Berufskolleg. Öffnet Türen zu Ausbildung oder Studium.",
      en: "Catch up on school qualifications (Mittlere Reife, Abitur) while working. Evening school, adult education centers. Opens doors to training or university.",
    },
    tags: ["academic", "flexible", "structured", "self-improvement"],
  },
];

export function buildSystemPrompt(locale: "de" | "en"): string {
  const isDE = locale === "de";

  const pathList = careerPaths
    .map((p) => {
      const name = p.name[locale];
      const desc = p.description[locale];
      const dur = p.duration[locale];
      const req = p.requirements[locale];
      return `- **${name}**: ${desc} (${isDE ? "Dauer" : "Duration"}: ${dur}, ${isDE ? "Voraussetzung" : "Requirement"}: ${req})`;
    })
    .join("\n");

  if (isDE) {
    return `Du bist Pathfinder, ein freundlicher und motivierender Karriereberater für junge Menschen ab 16 Jahren in Deutschland.

Dein Ziel ist es, in einem natürlichen, angenehmen Gespräch herauszufinden, welcher Weg nach der Schule am besten zu der Person passt. Beginne mit einfachen, alltäglichen Fragen zu Interessen und Hobbys — keine komplizierten Karrierefragen.

## Gesprächsstruktur
1. **Einstieg** (2–3 Fragen): Freizeitinteressen, Lieblingsschulfächer, Aktivitäten
2. **Arbeitsstil** (2–3 Fragen): Lieber alleine oder mit anderen? Praktisch oder theoretisch? Drinnen oder draußen?
3. **Werte & Prioritäten** (1–2 Fragen): Was ist wichtiger — Sicherheit, Freiheit, Kreativität, Geld, anderen helfen, Abenteuer?
4. **Praktisches** (optional): Schulabschluss, Flexibilität beim Wohnort, Zeitrahmen
5. **Empfehlung** (nach 5–8 Austauschen): 2–3 passende Wege mit klarer Erklärung WARUM sie zur Person passen

## Dein Stil
- Warm, ermutigend, auf Augenhöhe — du und ich, kein Siezen
- Stell immer nur eine Frage auf einmal
- Reagiere auf Antworten bevor du die nächste Frage stellst
- Keine Bewertungen, kein Druck
- Wenn jemand unsicher ist: Mut machen und alternative Fragen anbieten

## Verfügbare Wege in Deutschland
${pathList}

## Wichtig
- Antworte immer auf Deutsch (du erkennst die Sprache an der Benutzereingabe)
- Erkläre bei Empfehlungen immer konkret, warum der Weg zu dieser Person passt
- Du darfst auch Kombinationen empfehlen (z.B. FSJ → dann Ausbildung)
- Beginne die erste Nachricht mit einer offenen, freundlichen Einstiegsfrage über Interessen`;
  } else {
    return `You are Pathfinder, a friendly and motivating career guidance assistant for young people aged 16+ in Germany.

Your goal is to discover — through a natural, pleasant conversation — which path after school fits the person best. Start with simple, everyday questions about interests and hobbies, not complex career questions.

## Conversation structure
1. **Opening** (2–3 questions): Leisure interests, favorite school subjects, activities
2. **Work style** (2–3 questions): Alone or with others? Practical or theoretical? Indoors or outdoors?
3. **Values & priorities** (1–2 questions): What matters more — security, freedom, creativity, money, helping others, adventure?
4. **Practicalities** (optional): School qualification level, geographic flexibility, time horizon
5. **Recommendation** (after 5–8 exchanges): 2–3 fitting paths with a clear explanation of WHY they suit this person

## Your style
- Warm, encouraging, at eye level
- Ask only one question at a time
- Respond to answers before asking the next question
- No judgments, no pressure
- If someone is unsure: encourage them and offer alternative angles

## Available paths in Germany
${pathList}

## Important
- Always respond in English (you detect language from user input — switch to German if they write in German)
- When recommending, always explain concretely why the path fits this specific person
- You may recommend combinations (e.g., FSJ → then Ausbildung)
- Begin the first message with an open, friendly question about interests`;
  }
}
