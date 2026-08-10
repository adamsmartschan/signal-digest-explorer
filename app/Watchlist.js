"use client";

import { useState } from "react";
import { IconPlus, IconX } from "./Icons";

export default function Watchlist({ companies = [], vertical, verticalLabel }) {
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState("");
  const [domain, setDomain] = useState("");
  const [why, setWhy] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const reset = () => {
    setCompany("");
    setDomain("");
    setWhy("");
    setStatus(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/suggest-account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ company, domain, why, vertical }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't send suggestion");
      if (data.delivery === "mailto" && data.mailto) {
        window.location.href = data.mailto;
        setStatus({
          ok: true,
          text: "Opened an email draft to ops. Nothing is added to Clay until they review it.",
        });
      } else if (data.delivery === "mailto" && data.summary) {
        try {
          await navigator.clipboard.writeText(data.summary);
          setStatus({
            ok: true,
            text: "Copied a summary for ops — paste it into Slack or email. Nothing is added to Clay automatically.",
          });
        } catch {
          setStatus({ ok: true, text: data.summary });
        }
      } else {
        setStatus({
          ok: true,
          text: "Sent to ops for review. Nothing is added to Clay automatically.",
        });
      }
      setCompany("");
      setDomain("");
      setWhy("");
    } catch (err) {
      setStatus({ ok: false, text: err.message || "Couldn't send suggestion." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="watchlist">
      <div className="watchlist-header">
        <span className="watchlist-title">Watchlist</span>
        <span className="pill watchlist-count">{companies.length}</span>
      </div>
      <p className="watchlist-note">
        Signals below are limited to this list
        {verticalLabel ? ` · ${verticalLabel}` : ""}.
      </p>
      <ul className="watchlist-list">
        {companies.map((c, i) => (
          <li key={`${c.company}-${i}`} className="watchlist-item">
            <div className="watchlist-name">{c.company}</div>
            <div className="watchlist-meta">
              {[c.country, c.size].filter(Boolean).join(" · ")}
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="ghost-btn watchlist-suggest"
        onClick={() => {
          reset();
          setOpen(true);
        }}
      >
        <IconPlus size={14} />
        Suggest an account
      </button>

      {open && (
        <div
          className="content-draft-overlay"
          onClick={() => setOpen(false)}
        >
          <div
            className="content-draft-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="content-draft-header">
              <span className="content-draft-title">Suggest an account</span>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <IconX size={16} />
              </button>
            </div>
            <p className="watchlist-modal-lede">
              Ops reviews suggestions before anything is added to Clay. This
              does not write to the target list.
            </p>
            <form className="suggest-form" onSubmit={submit}>
              <label>
                Company
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  placeholder="e.g. Stryker"
                />
              </label>
              <label>
                Domain <span className="suggest-optional">(optional)</span>
                <input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="stryker.com"
                />
              </label>
              <label>
                Why this account <span className="suggest-optional">(optional)</span>
                <textarea
                  value={why}
                  onChange={(e) => setWhy(e.target.value)}
                  rows={3}
                  placeholder="ICP fit, recent signal, coverage gap…"
                />
              </label>
              {status && (
                <p className={status.ok ? "suggest-status ok" : "content-draft-error"}>
                  {status.text}
                </p>
              )}
              <div className="content-draft-footer">
                <button type="button" className="ghost-btn" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="pill-btn" disabled={loading || !company.trim()}>
                  {loading ? "Sending…" : "Send to ops"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
