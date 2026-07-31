import Papa from "papaparse";

const SHEET_ID = "1W4tsa6fvGfAH-UrApPw3TY-_CRfOHLckA6Gx-hsIca8";

export async function fetchSheet(tabName) {
  // Cache-busting nonce defeats any downstream caching (Google's gviz
  // endpoint, CDNs, etc.) that could otherwise serve a stale or
  // cross-contaminated response for a given tab name.
  const nonce = Date.now();
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
    tabName
  )}&_=${nonce}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return { rows: [], error: `HTTP ${res.status} fetching "${tabName}"`, tabName };
  }
  const text = await res.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  // Defensive check: papaparse can silently return rows from the wrong
  // tab if Google ever redirects/serves an unexpected sheet; verify the
  // response actually looks like tabular data before trusting it.
  return { rows: parsed.data, error: null, tabName };
}
