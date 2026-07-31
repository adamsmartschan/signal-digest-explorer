"use client";

import { useState, useMemo } from "react";
import {
  automotiveCompanies,
  automotiveNews,
  automotiveHires,
  automotiveRecalls,
  naMedtechCompanies,
  euMedtechCompanies,
} from "../lib/staticData";

const CAP = 15;

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Section({ id, title, meta, note, children, error }) {
  return (
    <div className="section" data-section={id}>
      <div className="section-header">
        <span className="section-title">{title}</span>
        <span className="section-meta">{meta}</span>
      </div>
      {note && <div className="placeholder-note">{note}</div>}
      {error ? <div className="error-state">Couldn&apos;t load this section: {error}</div> : children}
    </div>
  );
}

function DataTable({ sectionId, columns, rows, selected, onToggle, emptyMessage }) {
  if (!rows || rows.length === 0) {
    return <div className="empty-state">{emptyMessage || "No rows."}</div>;
  }
  return (
    <table>
      <thead>
        <tr>
          <th style={{ width: 28 }}></th>
          {columns.map((c) => (
            <th key={c.key}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => {
          const rowKey = `${sectionId}-${i}`;
          return (
            <tr key={rowKey}>
              <td>
                <input
                  type="checkbox"
                  checked={!!selected[rowKey]}
                  onChange={() => onToggle(sectionId, rowKey, columns, row)}
                />
              </td>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function toCsvValue(v) {
  const s = v === null || v === undefined ? "" : String(v);
  return '"' + s.replace(/"/g, '""') + '"';
}

function downloadCsv(filename, columns, rows) {
  const header = columns.map((c) => toCsvValue(c.label)).join(",");
  const lines = rows.map((r) =>
    columns.map((c) => toCsvValue(c.csv ? c.csv(r) : c.render ? stripHtmlText(c, r) : r[c.key])).join(",")
  );
  const csv = [header, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function stripHtmlText(col, row) {
  // Fallback for columns whose render() returns JSX we can't stringify simply;
  // callers should supply csv() for those. This just tries the raw key.
  return row[col.key] ?? "";
}

export default function Explorer({ data }) {
  const [activeTab, setActiveTab] = useState("automotive");
  const [selected, setSelected] = useState({}); // { rowKey: { section, columns, row } }

  const toggle = (sectionId, rowKey, columns, row) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[rowKey]) {
        delete next[rowKey];
      } else {
        next[rowKey] = { sectionId, columns, row };
      }
      return next;
    });
  };

  const selectedCount = Object.keys(selected).length;

  const exportSelected = () => {
    const groups = new Map();
    Object.values(selected).forEach(({ sectionId, columns, row }) => {
      const key = sectionId;
      if (!groups.has(key)) groups.set(key, { columns, rows: [] });
      groups.get(key).rows.push(row);
    });
    let i = 0;
    groups.forEach(({ columns, rows }, sectionId) => {
      setTimeout(() => {
        downloadCsv(`signal-digest-${activeTab}-${sectionId}.csv`, columns, rows);
      }, i * 150);
      i++;
    });
  };

  const naHireRows = (data.newHireNA.rows || []).slice(0, CAP);
  const euHireRows = (data.newHireEU.rows || []).slice(0, CAP);
  const naJobRows = (data.jobsNA.rows || []).slice(0, CAP);
  const euJobRows = (data.jobsEU.rows || []).slice(0, CAP);
  const autoJobRows = (data.jobsAuto.rows || []).slice(0, CAP);
  const naPromoRows = (data.promoNA.rows || []).slice(0, CAP);
  const euPromoRows = (data.promoEU.rows || []).slice(0, CAP);
  const autoPromoRows = (data.promoAuto.rows || []).slice(0, CAP);
  const naRecallRows = (data.fdaRecalls.rows || []).slice(0, CAP);
  const na510kRows = (data.fda510k.us || []).slice(0, CAP);
  const eu510kRows = (data.fda510k.eu || []).slice(0, CAP);

  const hireColumns = [
    { key: "Name", label: "Name" },
    { key: "Company", label: "Company" },
    { key: "Title", label: "Title" },
    {
      key: "LinkedIn Profile",
      label: "LinkedIn",
      render: (r) =>
        r["LinkedIn Profile"] ? (
          <a href={r["LinkedIn Profile"]} target="_blank" rel="noreferrer">
            Profile
          </a>
        ) : (
          ""
        ),
      csv: (r) => r["LinkedIn Profile"] || "",
    },
  ];

  const jobColumns = [
    { key: "Company Name", label: "Company" },
    { key: "Job Title", label: "Job Title" },
    { key: "Location", label: "Location" },
    {
      key: "Job LinkedIn URL",
      label: "Link",
      render: (r) =>
        r["Job LinkedIn URL"] ? (
          <a href={r["Job LinkedIn URL"]} target="_blank" rel="noreferrer">
            View
          </a>
        ) : (
          ""
        ),
      csv: (r) => r["Job LinkedIn URL"] || "",
    },
    {
      key: "Post On",
      label: "Posted",
      render: (r) => fmtDate(r["Post On"]),
      csv: (r) => r["Post On"] || "",
    },
  ];

  const promoColumns = [
    { key: "Name", label: "Name" },
    { key: "Company", label: "Company" },
    { key: "Previous Title", label: "Previous Title" },
    { key: "New Title", label: "New Title" },
    {
      key: "Start Date",
      label: "Start Date",
      render: (r) => fmtDate(r["Start Date"]),
      csv: (r) => r["Start Date"] || "",
    },
    {
      key: "LinkedIn Profile",
      label: "LinkedIn",
      render: (r) =>
        r["LinkedIn Profile"] ? (
          <a href={r["LinkedIn Profile"]} target="_blank" rel="noreferrer">
            Profile
          </a>
        ) : (
          ""
        ),
      csv: (r) => r["LinkedIn Profile"] || "",
    },
  ];

  const recallColumns = [
    { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
    { key: "firm", label: "Firm" },
    { key: "product", label: "Product" },
    { key: "code", label: "Code" },
    {
      key: "status",
      label: "Status",
      render: (r) => <span className="badge amber">{r.status || "Open"}</span>,
      csv: (r) => r.status || "",
    },
    {
      key: "url",
      label: "Detail",
      render: (r) =>
        r.url ? (
          <a href={r.url} target="_blank" rel="noreferrer">
            FDA record
          </a>
        ) : (
          ""
        ),
      csv: (r) => r.url || "",
    },
  ];

  const fda510kColumns = [
    { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
    { key: "applicant", label: "Applicant" },
    { key: "device", label: "Device" },
    { key: "code", label: "Code" },
    {
      key: "kNumber",
      label: "K#",
      render: (r) =>
        r.url ? (
          <a href={r.url} target="_blank" rel="noreferrer">
            {r.kNumber}
          </a>
        ) : (
          r.kNumber
        ),
      csv: (r) => r.kNumber || "",
    },
  ];

  const companyColumns = [
    { key: "company", label: "Company" },
    { key: "domain", label: "Domain" },
    { key: "country", label: "Country" },
    { key: "size", label: "Size" },
  ];

  return (
    <div className="wrap">
      <h1>Signal Digest Explorer</h1>
      <p className="subtitle">
        Pick what you want, export just that. Hires, jobs, promotions pull live from the shared
        Google Sheet on every load; FDA sections pull live from openFDA.
      </p>
      <p className="generated">Data refreshed: {new Date(data.generatedAt).toLocaleString()}</p>

      <div className="tabs">
        {[
          { id: "automotive", label: "Automotive" },
          { id: "na-medtech", label: "NA MedTech (HID)" },
          { id: "eu-medtech", label: "EU MedTech" },
        ].map((t) => (
          <button
            key={t.id}
            className={"tab" + (activeTab === t.id ? " active" : "")}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "automotive" && (
        <div>
          <Section id="Companies" title="Target Companies" meta={`${automotiveCompanies.length} companies`}>
            <table>
              <thead>
                <tr><th style={{width:28}}></th><th>Company</th><th>Domain</th><th>Country</th><th>Size</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {automotiveCompanies.map((c, i) => (
                  <tr key={i}><td></td><td>{c.company}</td><td>{c.domain}</td><td>{c.country}</td><td>{c.size}</td><td>{c.notes}</td></tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section id="News" title="Industry & Competitor News" meta={`${automotiveNews.length} items`}>
            <table>
              <thead><tr><th style={{width:28}}></th><th>Date</th><th>Headline</th><th>Detail</th></tr></thead>
              <tbody>
                {automotiveNews.map((n, i) => (
                  <tr key={i}><td></td><td>{n.date}</td><td><a href={n.url} target="_blank" rel="noreferrer">{n.headline}</a></td><td>{n.detail}</td></tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section id="Hires" title="New Hires at Target Companies" meta={`${automotiveHires.length} item`}>
            <table>
              <thead><tr><th style={{width:28}}></th><th>Name</th><th>Company</th><th>Title</th><th>Location</th></tr></thead>
              <tbody>
                {automotiveHires.map((h, i) => (
                  <tr key={i}><td></td><td>{h.name}</td><td><span className="badge">{h.company}</span></td><td>{h.title}</td><td>{h.location}</td></tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section id="Promotions" title="Promotions & Leadership Moves" meta={`${autoPromoRows.length} rows in Promo: Automotive sheet`}>
            <DataTable sectionId="auto-promo" columns={promoColumns} rows={autoPromoRows} selected={selected} onToggle={toggle}
              emptyMessage="No entries yet — the Promo: Automotive sheet tab is currently empty (header row only)." />
          </Section>

          <Section id="Recalls" title="Recalls & Safety Actions" meta={`${automotiveRecalls.length} item`}>
            <table>
              <thead><tr><th style={{width:28}}></th><th>Date</th><th>Recall</th><th>Detail</th></tr></thead>
              <tbody>
                {automotiveRecalls.map((r, i) => (
                  <tr key={i}><td></td><td>{r.date}</td><td><a href={r.url} target="_blank" rel="noreferrer">{r.headline}</a></td><td>{r.detail}</td></tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section id="Open Roles" title="Open Engineering / R&D Roles" meta={`${autoJobRows.length} rows in Jobs: Automotive sheet`} error={data.jobsAuto.error}>
            <DataTable sectionId="auto-jobs" columns={jobColumns} rows={autoJobRows} selected={selected} onToggle={toggle} />
          </Section>
        </div>
      )}

      {activeTab === "na-medtech" && (
        <div>
          <Section id="Companies" title="Target Companies" meta={`${naMedtechCompanies.length} companies (first page - more available)`}>
            <table>
              <thead><tr><th style={{width:28}}></th><th>Company</th><th>Domain</th><th>Country</th><th>Size</th></tr></thead>
              <tbody>
                {naMedtechCompanies.map((c, i) => (
                  <tr key={i}><td></td><td>{c.company}</td><td>{c.domain}</td><td>{c.country}</td><td>{c.size}</td></tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section id="Hires" title="New Hires at Target Accounts"
            meta={`${data.newHireNA.rows?.length || 0} rows in New Hire: MD-NA sheet, showing first ${CAP}`}
            error={data.newHireNA.error}>
            <DataTable sectionId="na-hires" columns={hireColumns} rows={naHireRows} selected={selected} onToggle={toggle} />
          </Section>

          <Section id="Open Roles" title="Open R&D / NPI Roles"
            meta={`${data.jobsNA.rows?.length || 0} rows in Jobs: MD-NA sheet, showing first ${CAP}`}
            error={data.jobsNA.error}>
            <DataTable sectionId="na-jobs" columns={jobColumns} rows={naJobRows} selected={selected} onToggle={toggle} />
          </Section>

          <Section id="Promotions" title="Promotions at Target Accounts"
            meta={`${data.promoNA.rows?.length || 0} rows in Promo: MD-NA sheet, showing first ${CAP}`}
            error={data.promoNA.error}>
            <DataTable sectionId="na-promo" columns={promoColumns} rows={naPromoRows} selected={selected} onToggle={toggle} />
          </Section>

          <Section id="Recalls" title="FDA Recalls & Adverse Events"
            meta={`${data.fdaRecalls.rows?.length || 0} unique events, last 14 days`}
            error={data.fdaRecalls.error}>
            <DataTable sectionId="na-recalls" columns={recallColumns} rows={naRecallRows} selected={selected} onToggle={toggle} />
          </Section>

          <Section id="510k" title="FDA 510(k) Submissions"
            meta={`${na510kRows.length} US clearances, 120-day window`}
            note="Same underlying openFDA query feeds this table and the EU MedTech one, split by applicant country. Non-US/non-EU applicants (e.g. South Korea) are excluded from both."
            error={data.fda510k.error}>
            <DataTable sectionId="na-510k" columns={fda510kColumns} rows={na510kRows} selected={selected} onToggle={toggle} />
          </Section>
        </div>
      )}

      {activeTab === "eu-medtech" && (
        <div>
          <Section id="Companies" title="Target Companies" meta={`${euMedtechCompanies.length} companies`}>
            <table>
              <thead><tr><th style={{width:28}}></th><th>Company</th><th>Domain</th><th>Country</th><th>Size</th><th>Notes</th></tr></thead>
              <tbody>
                {euMedtechCompanies.map((c, i) => (
                  <tr key={i}><td></td><td>{c.company}</td><td>{c.domain}</td><td>{c.country}</td><td>{c.size}</td><td>{c.notes}</td></tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section id="510k" title="New FDA 510(k) Clearances — EU/UK Applicants"
            meta={`${eu510kRows.length} clearances, 120-day window`}
            note="Same underlying openFDA query as NA MedTech's 510(k) table, filtered to applicant countries DE/GB/IE/FR/IT/CH/SE/NL/DK/BE/AT/ES/FI/NO."
            error={data.fda510k.error}>
            <DataTable sectionId="eu-510k" columns={fda510kColumns} rows={eu510kRows} selected={selected} onToggle={toggle} />
          </Section>

          <Section id="Hires" title="New R&D / Engineering Hires"
            meta={`${data.newHireEU.rows?.length || 0} rows in New Hire: MD-EU sheet, showing first ${CAP}`}
            error={data.newHireEU.error}>
            <DataTable sectionId="eu-hires" columns={hireColumns} rows={euHireRows} selected={selected} onToggle={toggle} />
          </Section>

          <Section id="Promotions" title="Promotions & Leadership Moves"
            meta={`${data.promoEU.rows?.length || 0} rows in Promo: MD-EU sheet, showing first ${CAP}`}
            error={data.promoEU.error}>
            <DataTable sectionId="eu-promo" columns={promoColumns} rows={euPromoRows} selected={selected} onToggle={toggle} />
          </Section>

          <Section id="Open Roles" title="Open R&D / Engineering Roles"
            meta={`${data.jobsEU.rows?.length || 0} rows in Jobs: MD-EU sheet, showing first ${CAP}`}
            error={data.jobsEU.error}>
            <DataTable sectionId="eu-jobs" columns={jobColumns} rows={euJobRows} selected={selected} onToggle={toggle} />
          </Section>
        </div>
      )}

      <div className="export-bar">
        <span className="export-count">{selectedCount} row{selectedCount === 1 ? "" : "s"} selected</span>
        <div>
          <button className="btn-primary" disabled={selectedCount === 0} onClick={exportSelected}>
            Export selected as CSV
          </button>
        </div>
      </div>
    </div>
  );
}
