// Product codes covering the RFID/UDI-relevant medical device categories
// HID sells into (sterile trays, orthopedic/cardiovascular implants,
// sterilization wrap/indicators, sponges, endoscopes, blood/specimen
// containers, anesthesia kits, infusion sets). Documented in
// hid-listener-builds.md.
const PRODUCT_CODES = [
  "PXV","LRO","LRP","LXH","OGR","HRS","HWC","HTY","KTT","JDO","LZO","JDI",
  "LPH","MBL","MEH","JWH","KRQ","NKB","OSH","KWQ","DYE","PAL","MAF","NIQ",
  "NIO","DSY","DYF","FRG","KCT","LRT","FRC","SBE","GDY","LWH","MRL","FAJ",
  "FDF","FDT","GDB","PHT","KSR","MMH","QYC","FMH","NNI","KDT","NNK","KDW",
  "OFQ","OFT","OFV","OFU","OGE","OGD","FPA","LZH","LZG","PRM",
];

// Country codes for EU/UK applicants (european-medtech config)
const EU_COUNTRY_CODES = [
  "DE","GB","IE","FR","IT","CH","SE","NL","DK","BE","AT","ES","FI","NO",
];

function fmtDate(d) {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function productCodeClause() {
  return PRODUCT_CODES.map((c) => `product_code:${c}`).join("+");
}

async function fetchOpenFda(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 404) return { results: [], error: null }; // no matches
    return { results: [], error: `HTTP ${res.status}` };
  }
  const json = await res.json();
  return { results: json.results || [], error: null };
}

// 510(k): 120-day lookback (openFDA has a 3-6 month publish lag), split by
// applicant country into US (MD-NA) vs EU/UK (MD-EU) buckets.
export async function fetch510k() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 120);
  const url =
    `https://api.fda.gov/device/510k.json?search=(${productCodeClause()})` +
    `+AND+date_received:[${fmtDate(from)}+TO+${fmtDate(to)}]` +
    `&limit=100&sort=date_received:desc`;

  const { results, error } = await fetchOpenFda(url);
  if (error) return { us: [], eu: [], error };

  // Dedupe by k_number
  const seen = new Set();
  const deduped = [];
  for (const r of results) {
    if (r.k_number && seen.has(r.k_number)) continue;
    if (r.k_number) seen.add(r.k_number);
    deduped.push(r);
  }

  const rows = deduped.map((r) => ({
    date: r.date_received,
    applicant: r.applicant,
    device: r.device_name,
    code: r.product_code,
    kNumber: r.k_number,
    country: r.contact ? undefined : undefined,
    countryCode: r.country_code || (r.contact_country) || null,
    url: r.k_number
      ? `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=${r.k_number}`
      : null,
  }));

  // openFDA 510k results carry country info under different keys depending
  // on record vintage; fall back to raw result inspection.
  const withCountry = deduped.map((r, i) => ({
    ...rows[i],
    rawCountry: r.country_code || r.contact?.country || null,
  }));

  const us = withCountry.filter((r) => !r.rawCountry || r.rawCountry === "US");
  const eu = withCountry.filter((r) => EU_COUNTRY_CODES.includes(r.rawCountry));
  const other = withCountry.filter(
    (r) => r.rawCountry && r.rawCountry !== "US" && !EU_COUNTRY_CODES.includes(r.rawCountry)
  );

  us.sort((a, b) => (a.date < b.date ? 1 : -1));
  eu.sort((a, b) => (a.date < b.date ? 1 : -1));

  return { us, eu, other, error: null };
}

// Recalls: 14-day lookback, US-only section (no EU equivalent configured).
export async function fetchRecalls() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 14);
  const url =
    `https://api.fda.gov/device/recall.json?search=(${productCodeClause()})` +
    `+AND+event_date_posted:[${fmtDate(from)}+TO+${fmtDate(to)}]` +
    `&limit=100&sort=event_date_posted:desc`;

  const { results, error } = await fetchOpenFda(url);
  if (error) return { rows: [], error };

  // Dedupe by res_event_number (one event can have multiple line items)
  const seen = new Set();
  const rows = [];
  for (const r of results) {
    if (r.res_event_number && seen.has(r.res_event_number)) continue;
    if (r.res_event_number) seen.add(r.res_event_number);
    rows.push({
      date: r.event_date_posted,
      firm: r.recalling_firm,
      product: r.product_description,
      code: r.product_code,
      status: r.recall_status,
    });
  }
  return { rows, error: null };
}
