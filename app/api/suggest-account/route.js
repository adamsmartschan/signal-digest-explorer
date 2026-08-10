// Intake only -- never writes to Clay. Forwards a suggested account to ops
// via SUGGEST_ACCOUNT_WEBHOOK_URL (Slack / Apps Script / etc). If no webhook
// is configured, returns a mailto + copyable summary so the user can still
// send it to ops.

const VERTICAL_LABELS = {
  automotive: "European Automotive",
  "na-medtech": "NA MedTech (HID)",
  "eu-medtech": "EU MedTech",
};

function summaryText({ company, domain, why, vertical, submittedAt }) {
  const label = VERTICAL_LABELS[vertical] || vertical || "Unknown vertical";
  return [
    `Suggested account: ${company}`,
    domain ? `Domain: ${domain}` : null,
    `Vertical: ${label}`,
    why ? `Why: ${why}` : null,
    `Submitted: ${submittedAt}`,
    "",
    "Not added to Clay. Ops review required.",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const company = (body?.company || "").trim();
  const domain = (body?.domain || "").trim();
  const why = (body?.why || "").trim();
  const vertical = (body?.vertical || "").trim();

  if (!company) {
    return Response.json({ error: "Company name is required" }, { status: 400 });
  }

  const payload = {
    company,
    domain,
    why,
    vertical,
    submittedAt: new Date().toISOString(),
  };

  const webhook = process.env.SUGGEST_ACCOUNT_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        return Response.json(
          { error: "Ops inbox unavailable -- try again or email the team directly." },
          { status: 502 }
        );
      }
      return Response.json({ ok: true, delivery: "webhook" });
    } catch {
      return Response.json(
        { error: "Couldn't reach ops -- try again or email the team directly." },
        { status: 502 }
      );
    }
  }

  const text = summaryText(payload);
  const to = process.env.SUGGEST_ACCOUNT_EMAIL || "";
  const subject = encodeURIComponent(`[Suggest account] ${company}${vertical ? ` (${vertical})` : ""}`);
  const mailBody = encodeURIComponent(text);
  const mailto = to ? `mailto:${to}?subject=${subject}&body=${mailBody}` : null;

  return Response.json({ ok: true, delivery: "mailto", mailto, summary: text });
}
