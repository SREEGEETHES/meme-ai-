"use client";

import type { GenerationFeedback } from "./types";

/**
 * Ollama does NOT run face-swap or Wan video models.
 * Use it optionally to turn regenerate feedback into a short operator note
 * (stored locally / shown in UI). Generation still uses Replicate or mock.
 */
export async function refineFeedbackWithOllama(
  baseUrl: string,
  model: string,
  feedback: GenerationFeedback
): Promise<string | null> {
  const prompt = `You help operators fix AI meme swaps. Given user feedback, reply in 2 short bullet points (max 40 words total). No markdown.

What was missing: ${feedback.missing || "n/a"}
What to add: ${feedback.add || "n/a"}
What to remove: ${feedback.remove || "n/a"}

Note: Wan 2.2 and face-swap models cannot take text prompts—suggest retaking photo, clearer selfie, or retry with different seed.`;

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { response?: string };
    return data.response?.trim() || null;
  } catch {
    return null;
  }
}
