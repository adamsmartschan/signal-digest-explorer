"use client";

import {
  EUROPE_COUNTRY_PATHS,
  MAP_BOUNDS,
  MAP_SIZE,
} from "../lib/europeMapPaths";

const { lonMin: LON_MIN, lonMax: LON_MAX, latMin: LAT_MIN, latMax: LAT_MAX } =
  MAP_BOUNDS;
const { width: W, height: H } = MAP_SIZE;

function project(lat, lon) {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * W;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H;
  return [x, y];
}

const GROUP_COLORS = {
  ktm: "#ff6600",
  bmw: "#1c69d4",
  piaggio: "#2e7d32",
  ducati: "#cc0000",
};

const COUNTRY_LABELS = [
  { label: "UK", lat: 54, lon: -2.5 },
  { label: "Germany", lat: 51, lon: 10 },
  { label: "Austria", lat: 47.5, lon: 14.5 },
  { label: "Italy", lat: 42.5, lon: 12.5 },
];

/** Zoom viewBox to data points with padding; fall back to full map. */
function viewBoxForPoints(points) {
  if (!points.length) return `0 0 ${W} ${H}`;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  const padX = Math.max((maxX - minX) * 0.28, 48);
  const padY = Math.max((maxY - minY) * 0.28, 48);
  minX = Math.max(0, minX - padX);
  minY = Math.max(0, minY - padY);
  maxX = Math.min(W, maxX + padX);
  maxY = Math.min(H, maxY + padY);

  const minSpanX = W * 0.35;
  const minSpanY = H * 0.35;
  let spanX = maxX - minX;
  let spanY = maxY - minY;
  if (spanX < minSpanX) {
    const mid = (minX + maxX) / 2;
    minX = Math.max(0, mid - minSpanX / 2);
    maxX = Math.min(W, mid + minSpanX / 2);
    spanX = maxX - minX;
  }
  if (spanY < minSpanY) {
    const mid = (minY + maxY) / 2;
    minY = Math.max(0, mid - minSpanY / 2);
    maxY = Math.min(H, mid + minSpanY / 2);
    spanY = maxY - minY;
  }

  const targetAspect = W / H;
  const aspect = spanX / spanY;
  if (aspect > targetAspect) {
    const newSpanY = spanX / targetAspect;
    const mid = (minY + maxY) / 2;
    minY = mid - newSpanY / 2;
    maxY = mid + newSpanY / 2;
    spanY = newSpanY;
  } else {
    const newSpanX = spanY * targetAspect;
    const mid = (minX + maxX) / 2;
    minX = mid - newSpanX / 2;
    maxX = mid + newSpanX / 2;
    spanX = newSpanX;
  }

  return `${minX.toFixed(1)} ${minY.toFixed(1)} ${spanX.toFixed(1)} ${spanY.toFixed(1)}`;
}

function findSite(groups, siteId) {
  for (const g of groups || []) {
    for (const loc of g.manufacturingLocations || []) {
      if (loc.siteId === siteId) return { group: g, loc };
    }
  }
  return null;
}

export default function EuropeMap({
  groups,
  people = [],
  selectedSiteId,
  onSelectSite,
}) {
  const dataPoints = [];
  for (const g of groups || []) {
    for (const loc of g.manufacturingLocations || []) {
      dataPoints.push(project(loc.lat, loc.lon));
    }
  }

  const viewBox = viewBoxForPoints(dataPoints);
  const counts = {};
  for (const p of people) {
    if (!p.siteId || p.siteId === "unmapped") continue;
    counts[p.siteId] = (counts[p.siteId] || 0) + 1;
  }

  const selected = selectedSiteId ? findSite(groups, selectedSiteId) : null;
  const selectedPeople = selectedSiteId
    ? people
        .filter((p) => p.siteId === selectedSiteId)
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return (
    <div className="europe-map">
      <svg
        viewBox={viewBox}
        width="100%"
        height="auto"
        role="img"
        aria-label="EU/UK manufacturing locations map. Click a plant for people at that site."
      >
        <rect x="0" y="0" width={W} height={H} fill="#e8eef6" />

        <g className="map-basemap">
          {EUROPE_COUNTRY_PATHS.map((c) => (
            <path key={c.name} d={c.d} className="map-country">
              <title>{c.name}</title>
            </path>
          ))}
        </g>

        {COUNTRY_LABELS.map((c) => {
          const [x, y] = project(c.lat, c.lon);
          return (
            <text key={c.label} x={x} y={y} className="map-country-label">
              {c.label}
            </text>
          );
        })}

        {groups.flatMap((g) =>
          g.manufacturingLocations.map((loc, idx) => {
            const [x, y] = project(loc.lat, loc.lon);
            const isPrimary = idx === 0;
            const isSelected = selectedSiteId === loc.siteId;
            const n = counts[loc.siteId] || 0;
            const r = isSelected ? 11 : isPrimary ? 8 : 6;
            return (
              <g
                key={loc.siteId || `${g.id}-${loc.city}`}
                className={"map-pin" + (isSelected ? " selected" : "")}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  onSelectSite?.(
                    selectedSiteId === loc.siteId ? null : loc.siteId
                  )
                }
              >
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={GROUP_COLORS[g.id] || "#666"}
                  stroke={isSelected ? "#111" : "#fff"}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                >
                  <title>{`${g.name} — ${loc.name} (${loc.city})\n${n} people mapped · click to view`}</title>
                </circle>
                <text x={x + 12} y={y + 4} className="map-pin-label">
                  {loc.city}
                  {n > 0 ? ` (${n})` : ""}
                </text>
              </g>
            );
          })
        )}
      </svg>

      <div className="map-legend">
        {groups.map((g) => (
          <span key={g.id} className="map-legend-item">
            <span
              className="map-legend-swatch"
              style={{ background: GROUP_COLORS[g.id] || "#666" }}
            />
            {g.name}
          </span>
        ))}
        <span className="map-legend-item map-legend-hint">
          Click a plant to see people at that site
        </span>
      </div>

      {selected && (
        <div className="map-drilldown">
          <div className="map-drilldown-header">
            <div>
              <strong>
                {selected.loc.name}
              </strong>
              <span className="map-drilldown-meta">
                {" "}
                · {selected.group.name} · {selected.loc.city},{" "}
                {selected.loc.country}
              </span>
            </div>
            <button
              type="button"
              className="map-drilldown-clear"
              onClick={() => onSelectSite?.(null)}
            >
              Clear
            </button>
          </div>
          {selected.loc.note ? (
            <p className="map-drilldown-note">{selected.loc.note}</p>
          ) : null}
          {selectedPeople.length === 0 ? (
            <p className="map-drilldown-empty">
              No people mapped to this site yet.
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>LinkedIn</th>
                </tr>
              </thead>
              <tbody>
                {selectedPeople.map((p) => (
                  <tr key={`${p.name}-${p.title}-${p.linkedin}`}>
                    <td>{p.name}</td>
                    <td>{p.title}</td>
                    <td>{p.company}</td>
                    <td>{p.location}</td>
                    <td>
                      {p.linkedin ? (
                        <a href={p.linkedin} target="_blank" rel="noreferrer">
                          Profile
                        </a>
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
