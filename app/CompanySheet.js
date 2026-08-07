"use client";

import ContentDraftButton from "./ContentDraftButton";
import { IconMail, IconMapPin } from "./Icons";

const GROUP_ACCENTS = {
  ktm: { fg: "#9a3412", bg: "#ffedd5" },
  bmw: { fg: "#1e3a8a", bg: "#dbeafe" },
  piaggio: { fg: "#14532d", bg: "#dcfce7" },
  ducati: { fg: "#7f1d1d", bg: "#fee2e2" },
};

function accentFor(groupId) {
  return GROUP_ACCENTS[groupId] || { fg: "#3f3f46", bg: "#f1f1f1" };
}

function initials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function CompanySheet({
  group,
  people = [],
  news = [],
  recalls = [],
  promoRows = [],
  jobRows = [],
  onClose,
}) {
  if (!group) return null;

  const hooks = {
    news: news[0]?.headline || null,
    recall: recalls[0] ? `${recalls[0].headline} -- ${recalls[0].detail}` : null,
    promo:
      promoRows[0] && promoRows[0].Name
        ? `${promoRows[0].Name} was promoted from ${promoRows[0]["Previous Title"] || "a prior role"} to ${promoRows[0]["New Title"]}`
        : null,
    job:
      jobRows[0] && jobRows[0]["Job Title"]
        ? `${group.name} is currently hiring for ${jobRows[0]["Job Title"]}${jobRows[0].Location ? ` (${jobRows[0].Location})` : ""}`
        : null,
  };
  const accent = accentFor(group.id);

  return (
    <div className="company-sheet">
      <div className="company-sheet-header">
        <div className="company-sheet-title">
          <span className="company-sheet-dot" style={{ background: accent.fg }} />
          <strong>{group.name}</strong>
          <span className="company-sheet-meta">
            {group.parent} &middot; {group.brands.join(", ")}
          </span>
        </div>
        <button type="button" className="ghost-btn" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="company-sheet-section">
        <div className="company-sheet-section-title">
          Plants ({group.manufacturingLocations.length})
        </div>
        <div className="plant-list">
          {group.manufacturingLocations.map((loc) => (
            <div className="plant-card" key={loc.siteId}>
              <IconMapPin size={18} />
              <div>
                <div className="plant-card-title">
                  {loc.name} &middot; {loc.city}, {loc.country}
                </div>
                <div className="plant-card-note">{loc.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="company-sheet-section">
        <div className="company-sheet-section-title">People ({people.length})</div>
        {people.length === 0 ? (
          <p className="company-sheet-empty">No people mapped to this group yet.</p>
        ) : (
          <div className="person-list">
            {people.map((p, i) => (
              <div className="person-row" key={`${p.name}-${i}`}>
                <div className="person-avatar" style={{ background: accent.bg, color: accent.fg }}>
                  {initials(p.name)}
                </div>
                <div className="person-info">
                  <div className="person-name">{p.name}</div>
                  <div className="person-title">{p.title}</div>
                </div>
                {p.siteId && p.siteId !== "unmapped" ? (
                  <span className="pill" style={{ background: accent.bg, color: accent.fg }}>
                    {p.siteId}
                  </span>
                ) : null}
                {p.linkedin ? (
                  <a href={p.linkedin} target="_blank" rel="noreferrer" className="ghost-btn">
                    Profile
                  </a>
                ) : null}
                <ContentDraftButton person={p} group={group} hooks={hooks}>
                  <IconMail size={15} />
                  Draft
                </ContentDraftButton>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="company-sheet-section">
        <div className="company-sheet-section-title">News ({news.length})</div>
        {news.length === 0 ? (
          <p className="company-sheet-empty">No news items tagged to this group.</p>
        ) : (
          <table className="sheet-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Headline</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {news.map((n, i) => (
                <tr key={i}>
                  <td>{n.date}</td>
                  <td>
                    <a href={n.url} target="_blank" rel="noreferrer">
                      {n.headline}
                    </a>
                  </td>
                  <td>{n.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="company-sheet-section">
        <div className="company-sheet-section-title">Recalls ({recalls.length})</div>
        {recalls.length === 0 ? (
          <p className="company-sheet-empty">No recalls tagged to this group.</p>
        ) : (
          <table className="sheet-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Recall</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {recalls.map((r, i) => (
                <tr key={i}>
                  <td>{r.date}</td>
                  <td>
                    <a href={r.url} target="_blank" rel="noreferrer">
                      {r.headline}
                    </a>
                  </td>
                  <td>{r.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="company-sheet-section">
        <div className="company-sheet-section-title">
          Promotions &amp; leadership moves ({promoRows.length})
        </div>
        {promoRows.length === 0 ? (
          <p className="company-sheet-empty">No promotions tagged to this group.</p>
        ) : (
          <table className="sheet-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Previous title</th>
                <th>New title</th>
                <th>Start date</th>
                <th>LinkedIn</th>
              </tr>
            </thead>
            <tbody>
              {promoRows.map((r, i) => (
                <tr key={i}>
                  <td>{r.Name}</td>
                  <td>{r["Previous Title"]}</td>
                  <td>{r["New Title"]}</td>
                  <td>{fmtDate(r["Start Date"])}</td>
                  <td>
                    {r["LinkedIn Profile"] ? (
                      <a href={r["LinkedIn Profile"]} target="_blank" rel="noreferrer">
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

      <div className="company-sheet-section">
        <div className="company-sheet-section-title">Open roles ({jobRows.length})</div>
        {jobRows.length === 0 ? (
          <p className="company-sheet-empty">No open roles tagged to this group.</p>
        ) : (
          <table className="sheet-table">
            <thead>
              <tr>
                <th>Job title</th>
                <th>Location</th>
                <th>Posted</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {jobRows.map((r, i) => (
                <tr key={i}>
                  <td>{r["Job Title"]}</td>
                  <td>{r.Location}</td>
                  <td>{fmtDate(r["Post On"])}</td>
                  <td>
                    {r["Job LinkedIn URL"] ? (
                      <a href={r["Job LinkedIn URL"]} target="_blank" rel="noreferrer">
                        View
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
    </div>
  );
}
