"use client";

import { useState } from "react";

// Small registry of content types. Add more entries here later (e.g. a
// recall follow-up email) -- the dropdown and generation flow already
// support it, no redesign needed.
const CONTENT_TYPES = [{ id: "introEmail", label: "Introductory Email" }];

export default function ContentDraftButton({ person, group, hook }) {
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
        body: JSON.stringify({ contentType: type || contentType, person, group, hook }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError("Couldn't generate content -- try again.");
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
        className="content-draft-trigger"
        onClick={() => {
          setOpen(true);
          if (!result) generate(contentType);
        }}
      >
        ✉️ Draft
      </button>

      {open && (
        <div className="content-draft-overlay" onClick={() => setOpen(false)}>
          <div className="content-draft-modal" onClick={(e) => e.stopPropagation()}>
            <div className="content-draft-header">
              <strong>Draft content for {person.name}</strong>
              <button
                type="button"
                className="content-draft-close"
                onClick={() => setOpen(false)}
              >
                Close
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
                className="btn-primary"
                onClick={() => generate(contentType)}
                disabled={loading}
              >
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
                  rows={10}
                />
                <div className="content-draft-footer">
                  <span className="content-draft-source">
                    {result.source === "ai" ? "AI-generated" : "Template-based"} — copy and
                    paste, nothing is sent automatically
                  </span>
                  <button type="button" className="btn-primary" onClick={copy}>
                    {copied ? "Copied!" : "Copy to clipboard"}
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
