# Meme AI (open source)

Swap yourself into viral memes — **client-side only**. This repo is meant for:

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## How it works

| Step | What happens |
|------|----------------|
| Browse | Giphy (optional key) or bundled GIF catalog |
| Remix | 3-panel editor matching the tutorial UI |
| Generate | **Your** Replicate token calls `api.replicate.com` from the browser |
| No key | Mock mode plays a sample MP4 after a short delay |

Keys are stored in `localStorage` only — never sent to our static host.

## Settings

- **Replicate** — https://replicate.com/account/api-tokens  
- **Giphy** (optional) — https://developers.giphy.com/  
- **GitHub URL** — for “Go to GitHub” buttons on the demo site  
- **Ollama** (optional) — feedback text helper only  

See [docs/MODELS.md](./docs/MODELS.md) for exact model IDs and JSON fields.

## License

MIT — use, fork, self-host.
