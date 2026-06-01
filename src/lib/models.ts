/**
 * Model registry — mirrors the NotebookLM / Rocket tutorial stack.
 * These models do NOT use text prompts; only image/video URLs + options.
 */

export const REPLICATE_MODELS = {
  /** Face on static image meme — codeplugtech */
  faceImage:
    "codeplugtech/face-swap:278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34",
  /** Face on animated GIF — frame-by-frame style */
  faceGif: "zetyquickly-org/faceswap-a-gif",
  /** Full character replace in video — Wan 2.2 (UI label: WAN-VIDEO 2.2) */
  fullBodyVideo: "wan-video/wan-2.2-animate-replace",
} as const;

export const MODEL_HINTS = {
  face: {
    label: "FACE ONLY",
    time: "~60–120S",
    tier: "STANDARD",
    technique: "FRAME BY FRAME",
    description: "Swaps just the face. Body and clothes stay the same.",
  },
  full_body: {
    label: "FULL BODY",
    time: "~2–4 MIN",
    tier: "PREMIUM",
    technique: "WAN-VIDEO 2.2",
    description: "Replaces the whole character. You become the meme.",
  },
} as const;
