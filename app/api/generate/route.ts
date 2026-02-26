import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { keywords, format } = await req.json();

  if (!keywords || !format) {
    return NextResponse.json(
      { error: "keywords and format are required" },
      { status: 400 }
    );
  }

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a creative naming engine for a service called Vanitee.me. Generate 8 clever, brandable, memorable vanity ${format} ideas based on these keywords: "${keywords}".

Return ONLY a JSON array of objects, no other text. Each object should have:
- "suggestion": the vanity text itself
- "rationale": one short sentence explaining the idea

Example format:
[{"suggestion": "SALTY1", "rationale": "Playful nautical attitude with a classic plate structure."}]`,
      },
    ],
  });

const raw = (message.content[0].type === "text" ? message.content[0].text : "")
  .replace(/```json\n?/g, "")
  .replace(/```\n?/g, "")
  .trim();
  console.log("Raw response from Claude:", raw);

try {
    const suggestions = JSON.parse(raw);
    return NextResponse.json({ suggestions });
  } catch (e) {
    console.error("Parse error:", e);
    console.error("Raw response:", raw);
    return NextResponse.json({ error: "Failed to parse response", raw }, { status: 500 });
  }
}