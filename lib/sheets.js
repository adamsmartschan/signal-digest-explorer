import Papa from "papaparse";

const SHEET_ID = "1W4tsa6fvGfAH-UrApPw3TY-_CRfOHLckA6Gx-hsIca8";

export async function fetchSheet(tabName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
    tabName
  )}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return { rows: [], error: `HTTP ${res.status} fetching "${tabName}"` };
  }
  const text = await res.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  return { rows: parsed.data, error: null };
}
