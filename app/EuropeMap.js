const LON_MIN = -11;
const LON_MAX = 21;
const LAT_MIN = 39;
const LAT_MAX = 60;
const W = 640;
const H = 460;

function project(lat, lon) {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * W;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H;
  return [x, y];
}

const GROUP_COLORS = {
  ktm: "#ff6600",
  bmw: "#1c69d4",
  piaggio: "#2e7d32",
};

const COUNTRY_LABELS = [
  { label: "UK", lat: 54, lon: -2.5 },
  { label: "Germany", lat: 51, lon: 10 },
  { label: "Austria", lat: 47.5, lon: 14.5 },
  { label: "Italy", lat: 42.5, lon: 12.5 },
];

export default function EuropeMap({ groups, hires }) {
  return (
    <div className="europe-map">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="auto"
        role="img"
        aria-label="EU/UK manufacturing locations map"
      >
        <rect x="0" y="0" width={W} height={H} rx="8" fill="#f4f6fb" />

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
            return (
              <g key={`${g.id}-${loc.city}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={isPrimary ? 8 : 6}
                  fill={GROUP_COLORS[g.id] || "#666"}
                  stroke="#fff"
                  strokeWidth="1.5"
                >
                  <title>{`${g.name} -- ${loc.name} (${loc.city}, ${loc.country})\n${loc.note}`}</title>
                </circle>
                <text x={x + 10} y={y + 4} className="map-pin-label">
                  {loc.city}
                </text>
              </g>
            );
          })
        )}

        {(hires || []).map((h, i) => {
          if (!h.coords) return null;
          const [x, y] = project(h.coords.lat, h.coords.lon);
          const uncertain = h.coords.matchType === "country-best-guess";
          return (
            <rect
              key={`hire-${i}`}
              x={x - 4}
              y={y - 4}
              width="8"
              height="8"
              fill="#fff"
              stroke={GROUP_COLORS[h.groupId] || "#333"}
              strokeWidth="2"
              opacity={uncertain ? 0.7 : 1}
              transform={`rotate(45 ${x} ${y})`}
            >
              <title>{`${h.name} -- ${h.title} (${h.company})${
                uncertain ? "\nLocation is a best guess, country-level only" : ""
              }`}</title>
            </rect>
          );
        })}
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
        <span className="map-legend-item">
          <span className="map-legend-swatch map-legend-swatch-hire" />
          People (best-guess location)
        </span>
      </div>
    </div>
  );
}
