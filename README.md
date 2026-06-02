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

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SREEGEETHES/meme-ai)

1. Clone the repo and push to your GitHub
2. Import into Vercel — zero config
3. All API keys stay in the browser — no server env vars required

### Permanent storage (optional)

Generated meme URLs from Replicate/Fal expire after a while. To keep your history working forever:

1. In your Vercel dashboard, go to **Storage → Create Blob Store**
2. Copy the `BLOB_READ_WRITE_TOKEN`
3. Add it to your project's **Environment Variables** on Vercel
4. Redeploy

Now every generated meme is automatically stored permanently in your own Blob store. History, MY MEMES page, and shared links will always show the image — even years later.

Free Hobby tier: 250 MB storage, 10 GB bandwidth/month — plenty for meme history.

## License

MIT — use, fork, self-host.
