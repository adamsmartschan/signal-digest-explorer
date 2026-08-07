// Server-side content generation for the "Create Content" feature on each
// person row in the company sheet. Mirrors lib/insights.js's pattern: try
// Claude via the Anthropic API if ANTHROPIC_API_KEY is set, otherwise fall
// back to a plain template so the feature still works with no key
// configured (same as the Insight banner does today).
//
// contentType is deliberately a small registry (just "introEmail" for now)
// so adding more later -- e.g. a recall-follow-up email -- is just another
// entry, not a redesign.

async function callClaude(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.content?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

function introEmailPrompt({ person, group, hook }) {
  return `Write a short, warm, professional introductory email to a prospect at a target company.

Recipient: ${person.name}, ${person.title}, at ${person.company}.
Company context: ${group.name} (part of ${group.parent}). Brands: ${group.brands.join(", ")}.
${hook ? `Relevant hook to reference naturally, don't force it: ${hook}` : ""}

Write it as if from a sales/business development person reaching out cold for the first
time. Keep it under 150 words, no subject line, no placeholders like [Your Name] -- sign off
with "Best," on its own line and leave the name blank after it. Don't be salesy, don't use
exclamation points. End with one clear, low-pressure call to action (e.g. a short call).`;
}

function introEmailFallback({ person, group, hook }) {
  const firstName = (person.name || "").split(" ")[0] || "there";
  const hookLine = hook ? ` I saw ${hook.toLowerCase()} and it seemed like a good moment to reach out.` : "";
  return `Hi ${firstName},

I came across your work as ${person.title} at ${person.company} and wanted to reach out.${hookLine}

We work with teams across the motorcycle and powersports industry and I'd love to learn a bit more about what you're focused on at ${group.name} right now. Would you be open to a short call in the next couple of weeks?

Best,
`;
}

const REGISTRY = {
  introEmail: { prompt: introEmailPrompt, fallback: introEmailFallback },
};

export async function generateContentDraft(contentType, context) {
  const entry = REGISTRY[contentType];
  if (!entry) {
    return { text: "", source: "none", error: `Unknown content type: ${contentType}` };
  }
  const aiText = await callClaude(entry.prompt(context));
  if (aiText) return { text: aiText, source: "ai" };
  return { text: entry.fallback(context), source: "fallback" };
}
