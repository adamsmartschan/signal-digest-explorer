import Papa from "papaparse";

const SHEET_ID = "1W4tsa6fvGfAH-UrApPw3TY-_CRfOHLckA6Gx-hsIca8";

/** Canonical Automotive people ↔ plant mapping tab (gid from Sheet URL). */
export const AUTOMOTIVE_PEOPLE_GID = "1798239969";

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

/** Fetch a tab by gid (preferred when the tab name may change). */
export async function fetchSheetByGid(gid, label = `gid:${gid}`) {
  const nonce = Date.now();
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${encodeURIComponent(
    gid
  )}&_=${nonce}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return { rows: [], error: `HTTP ${res.status} fetching ${label}`, tabName: label };
  }
  const text = await res.text();
  // Google sometimes returns an HTML login/interstitial page instead of CSV
  // when the sheet isn't publicly readable.
  if (text.trimStart().startsWith("<!DOCTYPE") || text.trimStart().startsWith("<html")) {
    return { rows: [], error: `Non-CSV response fetching ${label} (sheet may not be public)`, tabName: label };
  }
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  return { rows: parsed.data, error: null, tabName: label };
}

/** Normalize Sheet / CSV people rows into the app person shape. */
export function normalizeAutomotivePeople(rows) {
  return (rows || [])
    .map((row) => {
      const name = (row.Name || row.name || "").trim();
      if (!name) return null;
      return {
        name,
        title: (row.Title || row.title || "").trim(),
        company: (row.Company || row.company || "").trim(),
        location: (row.Location || row.location || "").trim(),
        linkedin: (row.LinkedIn || row.linkedin || row["LinkedIn Profile"] || "").trim(),
        groupId: (row.groupId || "").trim(),
        siteId: (row.siteId || "unmapped").trim() || "unmapped",
        matchNote: (row.matchNote || "").trim(),
      };
    })
    .filter(Boolean);
}
