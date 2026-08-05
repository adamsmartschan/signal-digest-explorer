js
// Generates a short "Insight" callout per vertical from the rows page.js
// already fetched. If ANTHROPIC_API_KEY is set (Vercel env var), asks Claude
// for a punchy 2-3 sentence trend synthesis grounded strictly in the counts
// below. Otherwise falls back to a rule-based sentence -- the app never
// breaks or shows nothing just because the key isn't configured yet.

function companyActivity(items) {
  const byCompany = {};
  for (const it of items) {
    const company = (it.company || "").trim();
    if (!company) continue;
    byCompany[company] = byCompany[company] || { total: 0, bySection: {} };
    byCompany[company].total++;
    byCompany[company].bySection[it.section] = (byCompany[company].bySection[it.section] || 0) + 1;
  }
  return Object.entries(byCompany)
    .map(([company, v]) => ({ company, ...v }))
    .sort((a, b) => b.total - a.total);
}

async function callClaude(prompt, dataSummary) {
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
        max_tokens: 200,
        messages: [{ role: "user", content: `${prompt}\n\nData:\n${JSON.stringify(dataSummary)}` }],
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("Anthropic API error:", res.status, await res.text());
      return null;
    }
    const json = await res.json();
    const text = json?.content?.[0]?.text;
    return text ? text.trim() : null;
  } catch (e) {
    console.error("Insight generation failed:", e);
    return null;
  }
}

function fallbackSentence(clientLabel, leaderboard, totalItems) {
  if (totalItems === 0) return `No activity captured yet for ${clientLabel} this period.`;
  if (!leaderboard.length) return `${totalItems} item(s) tracked this period -- no single company stands out yet.`;
  const top = leaderboard[0];
  const sectionsHit = Object.keys(top.bySection).length;
  if (sectionsHit >= 2) {
    const sectionNames = Object.keys(top.bySection).join(" + ");
    return `${top.company} is the standout this period, showing up across ${sectionNames} (${top.total} total mentions) -- worth a closer look.`;
  }
  return `${top.company} leads this period with ${top.total} mentions, though activity is otherwise spread thin across ${leaderboard.length} companies.`;
}

// items: [{ section, company, title, location, date }, ...] already flattened
// by the caller from whichever section rows apply to this vertical.
export async function generateInsight(clientLabel, items) {
  const leaderboard = companyActivity(items);
  const totalItems = items.length;

  if (totalItems < 4) {
    return {
      text: `Not enough data yet for ${clientLabel} -- only ${totalItems} item(s) this period. Check back after a couple more runs.`,
      source: "sparse",
    };
  }

  const top = leaderboard.slice(0, 8).map((c) => ({
    company: c.company,
    total: c.total,
    activity: c.bySection,
    examples: items
      .filter((it) => it.company === c.company)
      .slice(0, 6)
      .map((it) => ({ section: it.section, title: it.title, location: it.location, date: it.date })),
  }));

  const prompt =
    `You write a one-glance "Insight" callout for a sales/marketing signal-tracking dashboard on ${clientLabel}. ` +
    `Based ONLY on the data provided (real counts of hires, promotions, FDA 510(k) clearances, recalls, and open roles per company from this digest period), write 2-3 punchy sentences identifying the single most notable trend or cluster of activity. ` +
    `Name specific companies and geographies ONLY if they appear in the data. Look for patterns like a company clustering hiring or postings in a region, a competitor showing up across multiple signal types (real momentum), or unusual regulatory activity. ` +
    `If nothing stands out strongly, say plainly that activity is spread thin rather than inventing a trend. Plain sentences, no markdown, don't mention "data" or "JSON" explicitly.`;

  const aiText = await callClaude(prompt, { clientLabel, topCompanies: top, totalItems });
  if (aiText) return { text: aiText, source: "ai" };

  return { text: fallbackSentence(clientLabel, leaderboard, totalItems), source: "fallback" };
}