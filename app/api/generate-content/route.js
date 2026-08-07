// New file: app/api/generate-content/route.js
// Next.js App Router API route -- runs server-side, so it's the only place
// that can hold ANTHROPIC_API_KEY. The client (ContentDraftButton) posts
// here instead of calling Anthropic directly.

import { generateContentDraft } from "../../../lib/contentGen";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const { contentType, person, group, hook } = body || {};

  if (!contentType || !person || !group) {
    return Response.json(
      { error: "Missing contentType, person, or group" },
      { status: 400 }
    );
  }

  const result = await generateContentDraft(contentType, { person, group, hook });
  return Response.json(result);
}
