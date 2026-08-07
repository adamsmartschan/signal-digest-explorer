"use client";

import { useState } from "react";
import { IconMail, IconCopy, IconX, IconRefresh } from "./Icons";

// Registry of content types. Each pulls a different "hook" out of whatever
// the company sheet has tagged for that group -- see the `hooks` prop below
// and lib/contentGen.js on the server side for how each type resolves its
// hook and what it does if that hook isn't available yet.
const CONTENT_TYPES = [
  { id: "introEmail", label: "Introductory email" },
  { id: "linkedinNote", label: "LinkedIn connection note" },
  { id: "recallFollowUp", label: "Recall follow-up email" },
  { id: "openRoleFollowUp", label: "Open-role follow-up email" },
  { id: "promoCongrats", label: "Promotion congratulations note" },
];

export default function ContentDraftButton({ person, group, hooks = {}, children }) {
  const [open, setOpen] = useState(false);
  const [contentType, setContentType] = useState(CONTENT_TYPES[0].id);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generate = async (type) => {
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contentType: type || contentType, person, group, hooks }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e.message || "Couldn't generate content -- try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!result?.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable -- textarea is still selectable/copyable manually
    }
  };

  return (
    <>
      <button
        type="button"
        className="ghost-btn content-draft-trigger"
        onClick={() => {
          setOpen(true);
          if (!result) generate(contentType);
        }}
      >
        {children || (
          <>
            <IconMail size={15} />
            Draft
          </>
        )}
      </button>

      {open && (
        <div className="content-draft-overlay" onClick={() => setOpen(false)}>
          <div className="content-draft-modal" onClick={(e) => e.stopPropagation()}>
            <div className="content-draft-header">
              <span className="content-draft-title">Draft for {person.name}</span>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <IconX size={16} />
              </button>
            </div>

            <div className="content-draft-controls">
              <select
                value={contentType}
                onChange={(e) => {
                  const next = e.target.value;
                  setContentType(next);
                  setResult(null);
                  generate(next);
                }}
              >
                {CONTENT_TYPES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => generate(contentType)}
                disabled={loading}
              >
                <IconRefresh size={14} />
                {loading ? "Generating…" : "Regenerate"}
              </button>
            </div>

            {error && <p className="content-draft-error">{error}</p>}

            {result?.text && (
              <>
                <textarea
                  className="content-draft-textarea"
                  readOnly
                  value={result.text}
                  rows={9}
                />
                <div className="content-draft-footer">
                  <span className="content-draft-source">
                    {result.source === "ai" ? "AI-generated" : "Template-based"} &middot; copy and
                    paste only
                  </span>
                  <button type="button" className="pill-btn" onClick={copy}>
                    <IconCopy size={14} />
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
