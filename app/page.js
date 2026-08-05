import { fetchSheet } from "../lib/sheets";
import { fetch510k, fetchRecalls, EU_COUNTRY_CODES } from "../lib/openfda";
import { generateInsight } from "../lib/insights";
import {
  automotiveHires,
  automotiveNews,
  automotiveRecalls,
} from "../lib/staticData";
import Explorer from "./Explorer";

export const dynamic = "force-dynamic"; // always fetch fresh data, no caching

const DATE_WINDOW_DAYS = 60;

function withinWindow(dateStr, days) {
  if (!dateStr) return true;
  const d = new Date(dateStr);
  if (isNaN(d)) return true;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return d >= cutoff;
}

export default async function Page() {
  const [
    newHireNA,
    newHireEU,
    jobsNA,
    jobsEU,
    jobsAuto,
    promoNA,
    promoEU,
    promoAuto,
    fda510k,
    fdaRecalls,
  ] = await Promise.all([
    fetchSheet("New Hire: MD-NA"),
    fetchSheet("New Hire: MD-EU"),
    fetchSheet("Jobs: MD-NA"),
    fetchSheet("Jobs: MD-EU"),
    fetchSheet("Jobs: Automotive"),
    fetchSheet("Promo: MD-NA"),
    fetchSheet("Promo: MD-EU"),
    fetchSheet("Promo: Automotive"),
    fetch510k(),
    fetchRecalls(),
  ]);

  const data = {
    generatedAt: new Date().toISOString(),
    newHireNA,
    newHireEU,
    jobsNA,
    jobsEU,
    jobsAuto,
    promoNA,
    promoEU,
    promoAuto,
    fda510k,
    fdaRecalls,
  };

  // Lightweight flattened item lists per vertical, just for insight
  // generation. Mirrors Explorer.js's own filtering (60-day window, NA/EU
  // country split) closely enough for a "what's notable this period"
  // summary -- doesn't need to be pixel-identical to the table rendering.
  const naHires = (newHireNA.rows || [])
    .filter((r) => (!r.Country || r.Country === "US") && withinWindow(r["Date Added"], DATE_WINDOW_DAYS))
    .map((r) => ({ section: "hires", company: r.Company, title: r.Title, location: r.Location || "", date: r["Date Added"] }));
  const euHires = (newHireEU.rows || [])
    .filter((r) => (!r.Country || EU_COUNTRY_CODES.includes(r.Country)) && withinWindow(r["Date Added"], DATE_WINDOW_DAYS))
    .map((r) => ({ section: "hires", company: r.Company, title: r.Title, location: r.Location || "", date: r["Date Added"] }));
  const naJobs = (jobsNA.rows || [])
    .filter((r) => withinWindow(r["Post On"], DATE_WINDOW_DAYS))
    .map((r) => ({ section: "open_roles", company: r["Company Name"], title: r["Job Title"], location: r.Location || "", date: r["Post On"] }));
  const euJobs = (jobsEU.rows || [])
    .filter((r) => withinWindow(r["Post On"], DATE_WINDOW_DAYS))
    .map((r) => ({ section: "open_roles", company: r["Company Name"], title: r["Job Title"], location: r.Location || "", date: r["Post On"] }));
  const autoJobs = (jobsAuto.rows || [])
    .filter((r) => withinWindow(r["Post On"], DATE_WINDOW_DAYS))
    .map((r) => ({ section: "open_roles", company: r["Company Name"], title: r["Job Title"], location: r.Location || "", date: r["Post On"] }));
  const naPromos = (promoNA.rows || [])
    .filter((r) => withinWindow(r["Start Date"], DATE_WINDOW_DAYS))
    .map((r) => ({ section: "promotions", company: r.Company, title: `${r["Previous Title"] || "?"} -> ${r["New Title"] || "?"}`, location: "", date: r["Start Date"] }));
  const euPromos = (promoEU.rows || [])
    .filter((r) => withinWindow(r["Start Date"], DATE_WINDOW_DAYS))
    .map((r) => ({ section: "promotions", company: r.Company, title: `${r["Previous Title"] || "?"} -> ${r["New Title"] || "?"}`, location: "", date: r["Start Date"] }));
  const autoPromos = (promoAuto.rows || [])
    .filter((r) => withinWindow(r["Start Date"], DATE_WINDOW_DAYS))
    .map((r) => ({ section: "promotions", company: r.Company, title: `${r["Previous Title"] || "?"} -> ${r["New Title"] || "?"}`, location: "", date: r["Start Date"] }));
  const naRecalls = (fdaRecalls.rows || []).map((r) => ({ section: "recalls", company: r.firm, title: r.product, location: "", date: r.date }));
  const na510k = (fda510k.us || []).map((r) => ({ section: "fda_510k", company: r.applicant, title: r.device, location: "", date: r.date }));
  const eu510k = (fda510k.eu || []).map((r) => ({ section: "fda_510k", company: r.applicant, title: r.device, location: "", date: r.date }));

  const autoItems = [
    ...automotiveHires.map((h) => ({ section: "hires", company: h.company, title: h.title, location: h.location, date: "" })),
    ...automotiveRecalls.map((r) => ({ section: "recalls", company: r.headline, title: r.detail, location: "", date: r.date })),
    ...automotiveNews.map((n) => ({ section: "news", company: "", title: n.headline, location: "", date: n.date })),
    ...autoJobs,
    ...autoPromos,
  ];
  const naItems = [...naHires, ...naJobs, ...naPromos, ...naRecalls, ...na510k];
  const euItems = [...euHires, ...euJobs, ...euPromos, ...eu510k];

  const [insightAuto, insightNA, insightEU] = await Promise.all([
    generateInsight("European Motorcycle", autoItems),
    generateInsight("HID Medical Device (NA)", naItems),
    generateInsight("European MedTech", euItems),
  ]);

  data.insights = { automotive: insightAuto, "na-medtech": insightNA, "eu-medtech": insightEU };

  return <Explorer data={data} />;
}
