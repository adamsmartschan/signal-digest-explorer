"use client";

import ContentDraftButton from "./ContentDraftButton";

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

  // Most-recent tagged news/recall headline for this group, used as an
  // optional natural "why reach out now" hook in generated content.
  const hook = news[0]?.headline || recalls[0]?.headline || null;

  return (
    <div className="company-sheet">
      <div className="company-sheet-header">
        <div>
          <strong>{group.name}</strong>
          <span className="company-sheet-meta">
            {" "}
            · {group.parent} · {group.brands.join(", ")}
          </span>
        </div>
        <button type="button" className="company-sheet-clear" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="company-sheet-section">
        <div className="company-sheet-section-title">
          Plants ({group.manufacturingLocations.length})
        </div>
        <table>
          <thead>
            <tr>
              <th>Site</th>
              <th>City</th>
              <th>Country</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {group.manufacturingLocations.map((loc) => (
              <tr key={loc.siteId}>
                <td>{loc.name}</td>
                <td>{loc.city}</td>
                <td>{loc.country}</td>
                <td>{loc.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="company-sheet-section">
        <div className="company-sheet-section-title">People ({people.length})</div>
        {people.length === 0 ? (
          <p className="company-sheet-empty">No people mapped to this group yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Title</th>
                <th>Company</th>
                <th>Site</th>
                <th>LinkedIn</th>
                <th>Content</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p, i) => (
                <tr key={`${p.name}-${i}`}>
                  <td>{p.name}</td>
                  <td>{p.title}</td>
                  <td>{p.company}</td>
                  <td>{p.siteId && p.siteId !== "unmapped" ? p.siteId : "—"}</td>
                  <td>
                    {p.linkedin ? (
                      <a href={p.linkedin} target="_blank" rel="noreferrer">
                        Profile
                      </a>
                    ) : (
                      ""
                    )}
                  </td>
                  <td>
                    <ContentDraftButton person={p} group={group} hook={hook} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="company-sheet-section">
        <div className="company-sheet-section-title">News ({news.length})</div>
        {news.length === 0 ? (
          <p className="company-sheet-empty">No news items tagged to this group.</p>
        ) : (
          <table>
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
          <table>
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
          Promotions &amp; Leadership Moves ({promoRows.length})
        </div>
        {promoRows.length === 0 ? (
          <p className="company-sheet-empty">No promotions tagged to this group.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Previous Title</th>
                <th>New Title</th>
                <th>Start Date</th>
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
        <div className="company-sheet-section-title">Open Roles ({jobRows.length})</div>
        {jobRows.length === 0 ? (
          <p className="company-sheet-empty">No open roles tagged to this group.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
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
