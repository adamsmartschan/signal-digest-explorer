// Data that doesn't have a live API/sheet source yet: Clay-sourced company
// lists (snapshots) and the Automotive client's news/recalls, which were
// pulled by hand during the 2026-07-27 digest run. These get refreshed
// manually until a live Clay query or feed is wired up.

// Automotive is tracked at the parent-group level (KTM Group, BMW Motorrad,
// Piaggio Group, Ducati) rather than by individual brand. Each plant has a
// stable siteId used to join people from the Google Sheet mapping tab. EU/UK manufacturing
// locations verified via web search 2026-08-05; NA/APAC production
// (Bajaj/CFMoto contract manufacturing, BMW Thailand/Brazil, Piaggio
// Vietnam/Indonesia) is out of scope for this client and omitted.
export const automotiveGroups = [
  {
    id: "ktm",
    name: "KTM Group",
    parent: "Pierer Mobility",
    brands: ["KTM", "GASGAS", "Husqvarna Motorcycles"],
    domain: "ktmgroup.com",
    manufacturingLocations: [
      {
        siteId: "ktm-mattighofen",
        name: "Mattighofen Plant",
        city: "Mattighofen",
        country: "Austria",
        lat: 48.0167,
        lon: 13.15,
        note: "HQ and main assembly line for KTM-branded bikes; also absorbing GASGAS motorcycle production, moved from Girona, Spain in 2026.",
      },
      {
        siteId: "ktm-munderfing",
        name: "Munderfing Plant",
        city: "Munderfing",
        country: "Austria",
        lat: 48.0575,
        lon: 13.1733,
        note: "Component/energy-linked production site in the same Austrian manufacturing cluster.",
      },
    ],
  },
  {
    id: "bmw",
    name: "BMW Motorrad",
    parent: "BMW Group",
    brands: ["BMW Motorrad"],
    domain: "bmw-motorrad.com",
    manufacturingLocations: [
      {
        siteId: "bmw-berlin",
        name: "Berlin-Spandau Plant",
        city: "Berlin",
        country: "Germany",
        lat: 52.5364,
        lon: 13.1936,
        note: "Sole manufacturing site for all BMW motorcycles worldwide; lead plant coordinating BMW Motorrad's global production network.",
      },
    ],
  },
  {
    id: "piaggio",
    name: "Piaggio Group",
    parent: "Piaggio & C. S.p.A.",
    brands: ["Piaggio", "Vespa", "Aprilia", "Moto Guzzi", "Gilera"],
    domain: "piaggiogroup.com",
    manufacturingLocations: [
      {
        siteId: "piaggio-pontedera",
        name: "Pontedera Plant",
        city: "Pontedera",
        country: "Italy",
        lat: 43.6625,
        lon: 10.6394,
        note: "Group HQ and largest plant; Piaggio, Vespa, and Gilera two-wheelers plus scooter/motorcycle engines.",
      },
      {
        siteId: "piaggio-scorze",
        name: "Scorze Plant",
        city: "Scorze",
        country: "Italy",
        lat: 45.5167,
        lon: 12.1,
        note: "Aprilia and Scarabeo two-wheeler production.",
      },
      {
        siteId: "piaggio-noale",
        name: "Noale R&D Center",
        city: "Noale",
        country: "Italy",
        lat: 45.55,
        lon: 12.0667,
        note: "Aprilia Racing and R&D hub -- development, not high-volume manufacturing.",
      },
      {
        siteId: "piaggio-mandello",
        name: "Mandello del Lario Plant",
        city: "Mandello del Lario",
        country: "Italy",
        lat: 45.9167,
        lon: 9.3167,
        note: "Moto Guzzi vehicles and engines.",
      },
    ],
  },
  {
    id: "ducati",
    name: "Ducati Motor Holding",
    parent: "Volkswagen Group (via Audi)",
    brands: ["Ducati"],
    domain: "ducati.com",
    manufacturingLocations: [
      {
        siteId: "ducati-borgopanigale",
        name: "Borgo Panigale Plant",
        city: "Bologna",
        country: "Italy",
        lat: 44.515,
        lon: 11.284,
        note: "Ducati HQ and sole manufacturing site since 1936 -- design, assembly, and global shipping all happen here. Volkswagen was reportedly exploring a sale in mid-2026 to fund its EV transition, but as of this writing Ducati's CEO has downplayed the rumors and no sale is confirmed.",
      },
    ],
  },
];

export const automotiveNews = [
  { date: "Jul 12, 2026", headline: "Marc Marquez / Ducati Lenovo Team win Sachsenring MotoGP", url: "https://www.motogp.com/en/news", detail: "Ducati's factory team took a dominant victory at the German round." },
  { date: "Jul 12, 2026", headline: "Aprilia Racing finishes 5th at Sachsenring", url: "https://www.motogp.com/en/news", detail: "Aprilia's factory squad placed 5th in the German Grand Prix.", groupId: "piaggio" },
];

export const automotiveHires = [
  { name: "Michael Fritzsch", company: "KTM AG", title: "Vice President IT", location: "Austria", groupId: "ktm" },
];

export const automotiveRecalls = [
  { date: "Jul 15, 2026", headline: "KTM North America recalls Husqvarna and GasGas over rear brake caliper", url: "https://www.rideapart.com/news/801781/husqvarna-gasgas-faulty-rear-brake-caliper-recall/", detail: "NHTSA 26V443000 — 6,257 units, Husqvarna FE 501S/350S, GasGas ES 350/500.", groupId: "ktm" },
];

// Best-guess placement of a hire/contact on the manufacturing map: match
// their free-text location to a known plant city first; if it's only a
// country, fall back to that group's primary (first-listed) site.
export function locateHire(hire, groups) {
  const group = groups.find((g) => g.id === hire.groupId);
  if (!group) return null;
  const loc = (hire.location || "").toLowerCase();
  if (!loc) return null;

  const cityMatch = group.manufacturingLocations.find((m) =>
    loc.includes(m.city.toLowerCase())
  );
  if (cityMatch) {
    return { lat: cityMatch.lat, lon: cityMatch.lon, matchType: "city", site: cityMatch.name };
  }

  const countryMatch = group.manufacturingLocations.some((m) =>
    loc.includes(m.country.toLowerCase())
  );
  if (countryMatch) {
    const primary = group.manufacturingLocations[0];
    return { lat: primary.lat, lon: primary.lon, matchType: "country-best-guess", site: primary.name };
  }

  return null;
}

export const naMedtechCompanies = [
  { company: "Medtronic", domain: "medtronic.com", country: "United States", size: "10,001+" },
  { company: "Boston Scientific", domain: "bostonscientific.com", country: "United States", size: "10,001+" },
  { company: "BD", domain: "bd.com", country: "United States", size: "10,001+" },
  { company: "Baxter International Inc.", domain: "baxter.com", country: "United States", size: "10,001+" },
  { company: "Alcon", domain: "alcon.com", country: "United States", size: "10,001+" },
  { company: "Smith+Nephew", domain: "smith-nephew.com", country: "United States", size: "10,001+" },
  { company: "B. Braun Group", domain: "bbraun.com", country: "United States", size: "10,001+" },
  { company: "Zimmer Biomet", domain: "zimmerbiomet.com", country: "United States", size: "10,001+" },
  { company: "Intuitive", domain: "intuitive.com", country: "United States", size: "10,001+" },
  { company: "Danaher", domain: "danaher.com", country: "United States", size: "10,001+" },
  { company: "Edwards Lifesciences", domain: "edwards.com", country: "United States", size: "10,001+" },
  { company: "Dentsply Sirona", domain: "dentsplysirona.com", country: "United States", size: "10,001+" },
  { company: "Arthrex", domain: "arthrex.com", country: "United States", size: "10,001+" },
  { company: "Beckman Coulter Diagnostics", domain: "beckmancoulter.com", country: "United States", size: "10,001+" },
  { company: "CONMED Corporation", domain: "conmed.com", country: "United States", size: "1,001-5,000" },
  { company: "Getinge", domain: "getinge.com", country: "United States", size: "10,001+" },
  { company: "Align Technology", domain: "aligntech.com", country: "United States", size: "10,001+" },
  { company: "Stryker", domain: "stryker.com", country: "United States", size: "10,001+" },
  { company: "Medline", domain: "medline.com", country: "United States", size: "10,001+" },
];

export const euMedtechCompanies = [
  { company: "KARL STORZ", domain: "karlstorz.com", country: "Germany", size: "5,001-10,000", notes: "" },
  { company: "BIOTRONIK", domain: "biotronik.com", country: "Germany", size: "5,001-10,000", notes: "" },
  { company: "B. Braun Group", domain: "bbraun.com", country: "Germany", size: "10,001+", notes: "" },
  { company: "ZEISS Medical Technology", domain: "zeiss.com", country: "Germany", size: "1,001-5,000", notes: "" },
  { company: "Siemens Healthineers", domain: "siemens-healthineers.com", country: "Germany", size: "10,001+", notes: "" },
  { company: "Erbe Elektromedizin", domain: "erbe-med.com", country: "Germany", size: "1,001-5,000", notes: "" },
  { company: "Drägerwerk", domain: "draeger.com", country: "Germany", size: "10,001+", notes: "" },
  { company: "Ottobock", domain: "ottobock.com", country: "Germany", size: "5,001-10,000", notes: "" },
  { company: "Convatec", domain: "convatecgroup.com", country: "United Kingdom", size: "5,001-10,000", notes: "" },
  { company: "Smith+Nephew", domain: "smith-nephew.com", country: "United Kingdom", size: "10,001+", notes: "" },
  { company: "LivaNova", domain: "livanova.com", country: "United Kingdom", size: "1,001-5,000", notes: "" },
  { company: "Brainomix", domain: "brainomix.com", country: "United Kingdom", size: "51-200", notes: "" },
  { company: "Coloplast", domain: "coloplast.com", country: "Denmark", size: "10,001+", notes: "" },
  { company: "Ambu", domain: "ambu.com", country: "Denmark", size: "1,001-5,000", notes: "" },
  { company: "Getinge", domain: "getinge.com", country: "Sweden", size: "10,001+", notes: "" },
  { company: "Elekta", domain: "elekta.com", country: "Sweden", size: "1,001-5,000", notes: "" },
  { company: "Alcon", domain: "alcon.com", country: "Switzerland", size: "10,001+", notes: "" },
  { company: "Institut Straumann", domain: "straumann.com", country: "Switzerland", size: "5,001-10,000", notes: "" },
  { company: "Medartis", domain: "medartis.com", country: "Switzerland", size: "501-1,000", notes: "" },
  { company: "Distalmotion", domain: "distalmotion.com", country: "Switzerland", size: "201-500", notes: "" },
  { company: "Philips", domain: "philips.com", country: "Netherlands", size: "10,001+", notes: "" },
  { company: "bioMerieux", domain: "biomerieux.com", country: "France", size: "10,001+", notes: "" },
  { company: "SIGNUS Medizintechnik", domain: "signus.com", country: "Germany", size: "51-200", notes: "510(k) discovery, 2026-07-22" },
  { company: "Perfuze", domain: "perfuze.com", country: "Ireland", size: "51-200", notes: "510(k) discovery, 2026-07-22" },
  { company: "BlueDop Medical", domain: "bluedop.com", country: "United Kingdom", size: "11-50", notes: "510(k) discovery, 2026-07-22" },
  { company: "Newclip Technics", domain: "newcliptechnics.us", country: "France", size: "201-500", notes: "510(k) discovery, 2026-07-22" },
  { company: "Stihler Electronic (Gentherm Medical Europe)", domain: "stihlerelectronic.de", country: "Germany", size: "11-50", notes: "510(k) discovery, 2026-07-22" },
  { company: "Capenergy Medical", domain: "capenergy.com", country: "Spain", size: "11-50", notes: "510(k) discovery, 2026-07-22" },
];
