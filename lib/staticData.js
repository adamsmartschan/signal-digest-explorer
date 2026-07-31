// Data that doesn't have a live API/sheet source yet: Clay-sourced company
// lists (snapshots) and the Automotive client's news/recalls, which were
// pulled by hand during the 2026-07-27 digest run. These get refreshed
// manually until a live Clay query or feed is wired up.

export const automotiveCompanies = [
  { company: "KTM AG", domain: "ktm.com", country: "Austria", size: "5,001-10,000", notes: "" },
  { company: "BMW Motorrad", domain: "bmw-motorrad.com", country: "Germany", size: "10,001+", notes: "" },
  { company: "GASGAS Motorcycles GmbH", domain: "gasgas.com", country: "Austria", size: "51-200", notes: "" },
  { company: "Triumph Motorcycles", domain: "triumphmotorcycles.co.uk", country: "United Kingdom", size: "1,001-5,000", notes: "" },
  { company: "Ducati Motor Holding", domain: "ducati.com", country: "Italy", size: "1,001-5,000", notes: "" },
  { company: "Aprilia", domain: "aprilia.com", country: "Italy", size: "unknown", notes: "No distinct Clay company card, merged under Piaggio Group. Domain still works for contact search." },
  { company: "Moto Guzzi", domain: "motoguzzi.com", country: "Italy", size: "201-500", notes: "" },
  { company: "MV Agusta", domain: "mvagusta.com", country: "Italy", size: "201-500", notes: "" },
  { company: "Husqvarna Motorcycles GmbH", domain: "husqvarna-motorcycles.com", country: "Austria", size: "unknown", notes: "Unresolved in Clay - no company/contact match as of 2026-07-27." },
];

export const automotiveNews = [
  { date: "Jul 12, 2026", headline: "Marc Marquez / Ducati Lenovo Team win Sachsenring MotoGP", url: "https://www.motogp.com/en/news", detail: "Ducati's factory team took a dominant victory at the German round." },
  { date: "Jul 12, 2026", headline: "Aprilia Racing finishes 5th at Sachsenring", url: "https://www.motogp.com/en/news", detail: "Aprilia's factory squad placed 5th in the German Grand Prix." },
];

export const automotiveHires = [
  { name: "Michael Fritzsch", company: "KTM AG", title: "Vice President IT", location: "Austria" },
];

export const automotiveRecalls = [
  { date: "Jul 15, 2026", headline: "KTM North America recalls Husqvarna and GasGas over rear brake caliper", url: "https://www.rideapart.com/news/801781/husqvarna-gasgas-faulty-rear-brake-caliper-recall/", detail: "NHTSA 26V443000 — 6,257 units, Husqvarna FE 501S/350S, GasGas ES 350/500." },
];

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
