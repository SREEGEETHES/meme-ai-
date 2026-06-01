import Link from "next/link";
import { GithubLink } from "@/components/GithubLink";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:py-20">
      <p className="mb-2 text-xs font-bold tracking-[0.3em] text-meme-red">
        OPEN SOURCE · CLIENT-SIDE KEYS
      </p>
      <h1 className="mb-6 font-serif text-4xl italic leading-tight md:text-6xl">
        Swap yourself into viral memes
      </h1>
      <p className="mb-8 max-w-2xl text-lg text-meme-black/80">
        Pick a GIF, upload a selfie, generate. No code required — but the repo is
        yours to fork, self-host, and wire to Replicate, local ComfyUI, or any
        provider you choose. This site is a UI preview; we never run AI on our
        servers.
      </p>

      <div className="mb-12 flex flex-wrap gap-3">
        <Link
          href="/trending"
          className="border-2 border-meme-black bg-meme-red px-6 py-3 text-sm font-black text-white shadow-brutal hover:bg-meme-black"
        >
          TRY THE APP
        </Link>
        <GithubLink className="border-2 border-meme-black bg-white px-6 py-3 text-sm font-black shadow-brutal hover:bg-cream" />
        <Link
          href="/settings"
          className="border-2 border-meme-black px-6 py-3 text-sm font-black hover:bg-white"
        >
          ADD API KEYS
        </Link>
      </div>

      <section className="grid gap-4 border-2 border-meme-black bg-white p-6 md:grid-cols-3">
        {[
          {
            step: "1",
            title: "Select meme",
            text: "Browse trending GIFs (Giphy key optional — bundled catalog works offline).",
          },
          {
            step: "2",
            title: "Upload photo",
            text: "Clear selfie works best. Face-only or full-body Wan 2.2 replace.",
          },
          {
            step: "3",
            title: "Generate",
            text: "Your Replicate token runs in your browser. Regenerate with notes if needed.",
          },
        ].map((item) => (
          <div key={item.step} className="border-2 border-meme-black p-4">
            <span className="text-2xl font-black text-meme-red">{item.step}</span>
            <h2 className="mt-2 font-bold">{item.title}</h2>
            <p className="mt-1 text-sm text-meme-black/70">{item.text}</p>
          </div>
        ))}
      </section>

      <section className="mt-12 border-2 border-meme-black bg-cream p-6">
        <h2 className="mb-2 font-serif text-2xl italic">Models (same as the tutorial)</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-meme-black/80">
          <li>
            <strong>Face only:</strong> codeplugtech/face-swap (images) or
            faceswap-a-gif (animated)
          </li>
          <li>
            <strong>Full body:</strong> wan-video/wan-2.2-animate-replace — video +
            character_image (no text prompt)
          </li>
          <li>
            <strong>Ollama:</strong> optional — refines regenerate notes only, not
            pixels
          </li>
        </ul>
        <p className="mt-4 text-xs text-meme-black/60">
          See <code className="font-mono">docs/MODELS.md</code> in the repo for exact API
          fields.
        </p>
      </section>
    </div>
  );
}
