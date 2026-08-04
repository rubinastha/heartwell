import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router: Router = Router();

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

router.post("/explain", async (req, res) => {
  const { term, category } = req.body as {
    term?: unknown;
    category?: unknown;
  };

  if (!term || typeof term !== "string" || term.trim().length === 0) {
    res.status(400).json({ error: "term is required" });
    return;
  }

  try {
    const client = getClient();

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `You are a compassionate cardiac health educator speaking directly to a patient or their family. Explain the cardiac term "${term.trim()}"${typeof category === "string" ? ` (category: ${category})` : ""} in plain, everyday language.

Use a warm, calm, reassuring tone — never use alarming or frightening language.

Respond in this exact JSON format with no other text:
{
  "explanation": "<2-3 sentences explaining what this term means in simple language>",
  "whyItMatters": "<exactly one sentence about why knowing this helps in day-to-day life>"
}`,
        },
      ],
    });

    const block = message.content[0];
    if (block.type !== "text") {
      throw new Error("Unexpected response type from model");
    }

    // Strip markdown code fences if the model wraps the JSON
    const raw = block.text
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(raw) as {
      explanation?: unknown;
      whyItMatters?: unknown;
    };

    if (
      typeof parsed.explanation !== "string" ||
      typeof parsed.whyItMatters !== "string"
    ) {
      throw new Error("Unexpected response shape from model");
    }

    res.json({
      explanation: parsed.explanation,
      whyItMatters: parsed.whyItMatters,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[explain] error:", msg);
    res.status(500).json({ error: "Failed to generate explanation" });
  }
});

export default router;
