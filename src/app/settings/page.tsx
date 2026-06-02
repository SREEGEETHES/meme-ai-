"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GithubLink } from "@/components/GithubLink";
import { DEFAULT_SETTINGS, type AppSettings, type ProviderId } from "@/lib/types";
import {
  hasAnyApiKey,
  hasFalKey,
  hasReplicateToken,
  loadSettings,
  resolveProvider,
  saveSettings,
} from "@/lib/settings";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [resolved, setResolved] = useState<string>("mock");

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    setResolved(resolveProvider(s));
  }, []);

  const update = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((s) => {
      const next = { ...s, [key]: value };
      setResolved(resolveProvider(next));
      return next;
    });
    setSaved(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <h1 className="mb-2 font-serif text-3xl italic">API keys</h1>
      <p className="mb-4 text-sm text-meme-black/70">
        Keys stay in <strong>your browser</strong> only. Nothing is sent to our
        Vercel/Netlify host.
      </p>
      <p className="mb-8 border-2 border-meme-black bg-white px-3 py-2 text-sm">
        Active provider after save:{" "}
        <strong className="text-meme-red">{resolved}</strong>
        {resolved === "mock" && " — add a Fal or Replicate key below"}
      </p>

      <form
        className="space-y-6 border-2 border-meme-black bg-white p-6"
        onSubmit={(e) => {
          e.preventDefault();
          saveSettings(settings);
          setResolved(resolveProvider(settings));
          setSaved(true);
        }}
      >
        <Field
          label="AI provider"
          hint="Auto picks Fal if you have Fal credits, else Replicate."
        >
          <select
            value={settings.provider}
            onChange={(e) =>
              update("provider", e.target.value as ProviderId)
            }
            className="w-full border-2 border-meme-black px-3 py-2 text-sm"
          >
            <option value="auto">Auto (Fal → Replicate → preview)</option>
            <option value="fal">Fal only</option>
            <option value="replicate">Replicate only</option>
            <option value="mock">Preview only (no API)</option>
          </select>
        </Field>

        <Field
          label="Fal API key"
          hint="Get at fal.ai/dashboard/keys — uses your Fal credits"
        >
          <input
            type="password"
            value={settings.falApiKey}
            onChange={(e) => update("falApiKey", e.target.value)}
            placeholder="fal_… or paste from dashboard"
            className="w-full border-2 border-meme-black px-3 py-2 font-mono text-sm"
            autoComplete="off"
          />
          {hasFalKey(settings) && (
            <p className="mt-1 text-xs text-emerald-700">Fal key detected ✓</p>
          )}
        </Field>

        <Field
          label="Replicate API token"
          hint="replicate.com/account/api-tokens"
        >
          <input
            type="password"
            value={settings.replicateApiToken}
            onChange={(e) => update("replicateApiToken", e.target.value)}
            placeholder="r8_…"
            className="w-full border-2 border-meme-black px-3 py-2 font-mono text-sm"
            autoComplete="off"
          />
          {hasReplicateToken(settings) && (
            <p className="mt-1 text-xs text-emerald-700">Replicate token ✓</p>
          )}
        </Field>

        <Field
          label="Giphy API key"
          hint="Without this, bundled memes still work on Trending."
        >
          <input
            type="password"
            value={settings.giphyApiKey}
            onChange={(e) => update("giphyApiKey", e.target.value)}
            className="w-full border-2 border-meme-black px-3 py-2 font-mono text-sm"
            autoComplete="off"
          />
        </Field>

        <Field label="GitHub repo URL" hint="For Go to GitHub buttons — defaults to your repo">
          <input
            type="url"
            value={settings.githubRepoUrl}
            onChange={(e) => update("githubRepoUrl", e.target.value)}
            className="w-full border-2 border-meme-black px-3 py-2 text-sm"
          />
        </Field>

        <button
          type="submit"
          className="w-full border-2 border-meme-black bg-meme-red py-3 text-sm font-black text-white"
        >
          SAVE TO THIS BROWSER
        </button>
        {saved && (
          <p className="text-center text-sm font-bold text-emerald-700">
            Saved.{" "}
            {hasAnyApiKey(settings)
              ? `Ready to generate with ${resolved}.`
              : "Still in preview mode."}
          </p>
        )}
      </form>

      <div className="mt-8 flex gap-3">
        <Link
          href="/trending"
          className="border-2 border-meme-black px-4 py-2 text-sm font-bold"
        >
          ← Back to app
        </Link>
        <GithubLink className="border-2 border-meme-black bg-meme-black px-4 py-2 text-sm font-bold text-cream" />
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black tracking-wide">{label}</span>
      {hint && <p className="mb-1 text-xs text-meme-black/60">{hint}</p>}
      <div className="mt-1">{children}</div>
    </label>
  );
}
