// Server-side content generation for the "Create Content" feature on each
// person row in the company sheet. Mirrors lib/insights.js's pattern: try
// Claude via the Anthropic API if ANTHROPIC_API_KEY is set, otherwise fall
// back to a plain template so the feature still works with no key
// configured.
//
// Five content types, each pulling a different "hook" out of whatever the
// company sheet has tagged for that group (news / recall / open role /
// promotion). If a content type needs a hook that isn't there yet (e.g.
// Recall Follow-Up on a group with no tagged recall), it returns a friendly
// error instead of generating something ungrounded.

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

function firstName(name) {
  return (name || "").trim().split(/\s+/)[0] || "there";
}

// --- Introductory email ---
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
  const hookLine = hook ? ` I saw ${hook.toLowerCase()} and it seemed like a good moment to reach out.` : "";
  return `Hi ${firstName(person.name)},

I came across your work as ${person.title} at ${person.company} and wanted to reach out.${hookLine}

We work with teams across the motorcycle and powersports industry and I'd love to learn a bit more about what you're focused on at ${group.name} right now. Would you be open to a short call in the next couple of weeks?

Best,
`;
}

// --- LinkedIn connection note (short format, not an email) ---
function linkedinNotePrompt({ person, group, hook }) {
  return `Write a LinkedIn connection request note (the short note that goes with a connection invite, not an InMail).

Recipient: ${person.name}, ${person.title}, at ${person.company}.
Context: reaching out from someone working with teams across the motorcycle/powersports industry, regarding ${group.name}.
${hook ? `Optional reference, only if it fits naturally: ${hook}` : ""}

Keep it under 300 characters total. No "Dear", casual but professional, no placeholders. Sign
off with just a first name on its own line, left blank for the user to fill in. One sentence
on why you're connecting.`;
}
function linkedinNoteFallback({ person }) {
  return `Hi ${firstName(person.name)}, I came across your profile and would love to connect -- I work with teams across the motorcycle/powersports space and think it'd be great to stay in touch.

`;
}

// --- Recall follow-up email ---
function recallFollowUpPrompt({ person, group, hook }) {
  return `Write a short, professional email to a contact at a company that just had a product recall, reaching out in a helpful, non-opportunistic way -- not selling anything, just opening a conversation.

Recipient: ${person.name}, ${person.title}, at ${person.company} (part of ${group.name}).
Recall context: ${hook}

Reference the recall respectfully and factually -- don't be alarmist and don't exploit it.
Frame the outreach around understanding how their team handles quality/safety response, or
simply as a natural reason to reconnect. Under 150 words, no subject line, no placeholders,
sign off "Best," on its own line with the name left blank.`;
}
function recallFollowUpFallback({ person, hook }) {
  return `Hi ${firstName(person.name)},

I saw the recent recall notice -- ${hook} -- and wanted to check in. Hope the response process is going smoothly on your end.

If it's useful, I'd be glad to share how other teams in the space have approached similar situations. Would a short call make sense sometime soon?

Best,
`;
}

// --- Open-role follow-up email ---
function openRoleFollowUpPrompt({ person, group, hook }) {
  return `Write a short, professional outreach email that references an open job posting at the recipient's company as a natural conversation starter -- not applying for the job, using it as a signal of growth or investment to start a business conversation.

Recipient: ${person.name}, ${person.title}, at ${person.company} (part of ${group.name}).
Hiring signal: ${hook}

Under 150 words, no subject line, no placeholders, sign off "Best," on its own line with the
name left blank. One low-pressure call to action.`;
}
function openRoleFollowUpFallback({ person, hook }) {
  return `Hi ${firstName(person.name)},

I noticed ${hook} and it seemed like a good sign of where the team's headed. Wanted to reach out and learn a bit more about what's driving that growth.

Would you be open to a short call in the next few weeks?

Best,
`;
}

// --- Promotion congratulations note ---
function promoCongratsPrompt({ person, group, hook }) {
  return `Write a short, warm congratulations note for someone's recent promotion -- genuine, not salesy, no pitch of any kind.

Recipient: ${person.name}, now ${person.title}, at ${person.company} (part of ${group.name}).
Promotion detail: ${hook}

Under 100 words, no subject line, no placeholders, sign off "Best," on its own line with the
name left blank. Warm and specific, not generic corporate congrats-speak.`;
}
function promoCongratsFallback({ person, hook }) {
  return `Hi ${firstName(person.name)},

Congratulations on the new role -- ${hook}. Well deserved.

Would love to catch up sometime and hear more about what you're focused on now.

Best,
`;
}

const REGISTRY = {
  introEmail: { hookKeys: ["news", "recall"], prompt: introEmailPrompt, fallback: introEmailFallback },
  linkedinNote: { hookKeys: ["news", "recall"], prompt: linkedinNotePrompt, fallback: linkedinNoteFallback },
  recallFollowUp: { hookKeys: ["recall"], prompt: recallFollowUpPrompt, fallback: recallFollowUpFallback, requiresHook: true, missingHookMessage: "No recall is currently tagged for this group, so there's nothing to reference yet." },
  openRoleFollowUp: { hookKeys: ["job"], prompt: openRoleFollowUpPrompt, fallback: openRoleFollowUpFallback, requiresHook: true, missingHookMessage: "No open role is currently tagged for this group, so there's nothing to reference yet." },
  promoCongrats: { hookKeys: ["promo"], prompt: promoCongratsPrompt, fallback: promoCongratsFallback, requiresHook: true, missingHookMessage: "No promotion is currently tagged for this group, so there's nothing to reference yet." },
};

export async function generateContentDraft(contentType, { person, group, hooks = {} }) {
  const entry = REGISTRY[contentType];
  if (!entry) {
    return { text: "", source: "none", error: `Unknown content type: ${contentType}` };
  }

  let hook = null;
  for (const key of entry.hookKeys) {
    if (hooks[key]) {
      hook = hooks[key];
      break;
    }
  }

  if (entry.requiresHook && !hook) {
    return { text: "", source: "none", error: entry.missingHookMessage || "Not enough data for this content type yet." };
  }

  const context = { person, group, hook };
  const aiText = await callClaude(entry.prompt(context));
  if (aiText) return { text: aiText, source: "ai" };
  return { text: entry.fallback(context), source: "fallback" };
}
