"use client";

const GROUP_ACCENTS = {
  ktm: { fg: "#9a3412", bg: "#ffedd5" },
  bmw: { fg: "#1e3a8a", bg: "#dbeafe" },
  piaggio: { fg: "#14532d", bg: "#dcfce7" },
  ducati: { fg: "#7f1d1d", bg: "#fee2e2" },
};

export default function GroupPills({ groups = [], selectedId, onSelect }) {
  return (
    <div className="group-pills-wrap">
      <div className="group-pills" role="tablist" aria-label="Target groups">
        {groups.map((g) => {
          const accent = GROUP_ACCENTS[g.id] || { fg: "#3f3f46", bg: "#f1f1f1" };
          const selected = selectedId === g.id;
          return (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={"group-pill" + (selected ? " selected" : "")}
              style={{
                "--pill-fg": accent.fg,
                "--pill-bg": accent.bg,
              }}
              onClick={() => onSelect(selected ? null : g.id)}
            >
              <span className="group-pill-dot" />
              {g.name}
              <span className="group-pill-meta">
                {g.manufacturingLocations?.length || 0}
              </span>
            </button>
          );
        })}
      </div>
      <p className="group-pills-hint">Select a group for the full company sheet</p>
    </div>
  );
}
