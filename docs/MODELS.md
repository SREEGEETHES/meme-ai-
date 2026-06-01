# Models & API (no text prompts)

The NotebookLM / Rocket tutorial uses **Replicate** with **image/video inputs only** — there is no hidden text prompt. Flow: select GIF → upload selfie → API call.

## Full body (premium) — Wan 2.2 Animate Replace

- **Model:** `wan-video/wan-2.2-animate-replace`
- **Docs:** https://replicate.com/wan-video/wan-2.2-animate-replace/api
- **Inputs:**

| Field | Required | Description |
|-------|----------|-------------|
| `video` | yes | MP4 URL of the meme (Giphy `.mp4` works) |
| `character_image` | yes | User selfie URL (uploaded via Replicate Files API) |
| `resolution` | no | e.g. `480p`, `720p` |
| `go_fast` | no | boolean |
| `merge_audio` | no | boolean |
| `seed` | no | integer — we randomize on regenerate |

## Face only — static image

- **Model:** `codeplugtech/face-swap:278a81e7…`
- **Inputs:**

| Field | Description |
|-------|-------------|
| `input_image` | Target (meme frame / still) |
| `swap_image` | User face |

## Face only — animated GIF

- **Model:** `zetyquickly-org/faceswap-a-gif`
- **Inputs:** `gif`, `swap_image` (verify in Replicate playground if a version changes schema)

## Ollama

Ollama runs **LLMs**, not Wan or InsightFace. In this repo it only optionally summarizes regenerate feedback in `/settings`. For local pixels, run ComfyUI / Docker face-swap and add a provider adapter (future).

## Cost (approximate)

- Face image: ~$0.002/run
- GIF face: ~$0.004/run  
- Wan full body: higher; ~2–4 min GPU time
