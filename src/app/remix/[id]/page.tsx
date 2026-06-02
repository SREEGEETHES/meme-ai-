"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { RegenerateModal } from "@/components/RegenerateModal";
import { SwapTypeCards } from "@/components/SwapTypeCards";
import { generateMeme } from "@/lib/generation";
import { getMemeById } from "@/lib/giphy";
import { refineFeedbackWithOllama } from "@/lib/ollama";
import { saveJob } from "@/lib/history";
import { STATIC_MEMES } from "@/lib/static-memes";
import {
  hasAnyApiKey,
  loadSettings,
  resolveProvider,
} from "@/lib/settings";
import type {
  GenerationFeedback,
  MemeItem,
  SwapType,
} from "@/lib/types";

type GenState = "idle" | "generating" | "done" | "error";

export default function RemixPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-sm font-bold">Loading…</div>}>
      <RemixPage />
    </Suspense>
  );
}

function RemixPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const titleParam = searchParams.get("title");

  const [meme, setMeme] = useState<MemeItem | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [swapType, setSwapType] = useState<SwapType>("full_body");
  const [genState, setGenState] = useState<GenState>("idle");
  const [statusText, setStatusText] = useState("Ready when you are");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [regenOpen, setRegenOpen] = useState(false);
  const [ollamaNote, setOllamaNote] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [providerLabel, setProviderLabel] = useState("preview");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = loadSettings();
    setHasKey(hasAnyApiKey(s));
    setProviderLabel(resolveProvider(s));
    const cached = sessionStorage.getItem(`meme-${id}`);
    if (cached) {
      setMeme(JSON.parse(cached) as MemeItem);
      return;
    }
    const staticM = STATIC_MEMES.find((m) => m.id === id);
    if (staticM) {
      setMeme(staticM);
      return;
    }
    const fallback = getMemeById(id, "");
    if (fallback) setMeme(fallback);
    else if (titleParam) {
      setMeme({
        id,
        title: titleParam,
        previewUrl: "",
        mediaUrl: "",
        isAnimated: true,
        source: "giphy",
      });
    }
  }, [id, titleParam]);

  const onPhoto = (file: File | null) => {
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setOutputUrl(null);
    setGenState("idle");
  };

  const runGenerate = useCallback(
    async (feedback?: GenerationFeedback) => {
      if (!meme || !photoFile) return;
      setGenState("generating");
      setError(null);
      setOutputUrl(null);
      setStatusText("Generating, please wait…");

      const settings = loadSettings();

      if (feedback && settings.ollamaBaseUrl) {
        const note = await refineFeedbackWithOllama(
          settings.ollamaBaseUrl,
          settings.ollamaModel,
          feedback
        );
        if (note) setOllamaNote(note);
      }

      try {
        const url = await generateMeme({
          settings,
          meme,
          photoFile,
          swapType,
          feedback,
          onStatus: (s) => {
            if (s === "uploading") setStatusText("Uploading to Replicate…");
            else if (s === "processing")
              setStatusText(
                swapType === "full_body"
                  ? "Generating… ~2–4 minutes"
                  : "Generating… ~60–120 seconds"
              );
            else setStatusText(s);
          },
        });
        setOutputUrl(url);
        setGenState("done");
        setStatusText("Done! Download or regenerate.");
        saveJob({
          id: crypto.randomUUID(),
          memeId: meme.id,
          memeTitle: meme.title,
          swapType,
          status: "succeeded",
          outputUrl: url,
          feedback,
          createdAt: Date.now(),
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Generation failed";
        console.error("Generation error:", e);
        setGenState("error");
        setError(msg);
        setStatusText(msg.length > 80 ? msg.slice(0, 80) + "…" : msg);
      }
    },
    [meme, photoFile, swapType]
  );

  const displayTitle = meme?.title || titleParam || "Edit meme";
  const canGenerate = meme && photoFile && genState !== "generating";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <div className="mb-4 flex items-center justify-between text-xs font-bold">
        <span className="text-meme-red">• EDIT MEME</span>
        <Link href="/trending" className="hover:underline">
          ← BACK TO TRENDING
        </Link>
      </div>

      <h1 className="mb-6 font-serif text-3xl italic md:text-4xl">
        {displayTitle}
      </h1>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <WorkflowPanel
          step={1}
          label="MEME"
          sublabel="MP4"
          badge={meme?.isAnimated ? "ANIMATED" : "STILL"}
        >
          {meme?.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={meme.previewUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm">
              Meme not found
            </div>
          )}
        </WorkflowPanel>

        <WorkflowPanel
          step={2}
          label="YOUR PHOTO"
          sublabel=""
          badge="UPLOAD A CLEAR SELFIE"
        >
          <button
            type="button"
            className="relative h-full w-full"
            onClick={() => fileRef.current?.click()}
          >
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoPreview}
                alt="Your upload"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 p-4 text-center text-sm text-meme-black/60">
                <span className="text-4xl">+</span>
                Click to upload
              </div>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPhoto(e.target.files?.[0] ?? null)}
          />
        </WorkflowPanel>

        <WorkflowPanel
          step={3}
          label="RESULT"
          sublabel=""
          badge={
            genState === "generating"
              ? "GENERATING…"
              : outputUrl
                ? "READY"
                : "PREVIEW"
          }
        >
          {genState === "generating" && (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 p-4">
              <div className="h-16 w-16 border-2 border-meme-black" />
              <p className="text-center text-sm font-bold text-meme-red">
                GENERATING…
                <br />
                {swapType === "full_body" ? "~2–4 MINUTES" : "~60–120S"}
              </p>
            </div>
          )}
          {outputUrl && genState !== "generating" && (
            /\.(gif|jpe?g|png|webp)(\?|$)/i.test(outputUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={outputUrl}
                alt="Generated result"
                className="h-full w-full object-contain"
              />
            ) : (
              <video
                src={outputUrl}
                className="h-full w-full object-contain"
                controls
                autoPlay
                loop
                playsInline
              />
            )
          )}
          {genState === "idle" && !outputUrl && (
            <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-meme-black/50">
              Result appears here
            </div>
          )}
          {genState === "error" && (
            <div className="flex h-full items-center justify-center p-4 text-center text-sm text-meme-red">
              {error}
            </div>
          )}
        </WorkflowPanel>
      </div>

      <div className="mb-6">
        <SwapTypeCards
          value={swapType}
          onChange={setSwapType}
          disabled={genState === "generating"}
        />
      </div>

      {ollamaNote && (
        <p className="mb-4 border-2 border-meme-black bg-white p-3 text-xs">
          <strong>Ollama tip:</strong> {ollamaNote}
        </p>
      )}

      <footer className="flex flex-col gap-3 border-2 border-meme-black bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="text-xs font-bold text-meme-red">STATUS</span>
          <p className="text-sm font-medium">{statusText}</p>
          {!hasKey && (
            <p className="text-xs text-meme-black/60">
              No API key — preview uses a sample clip.{" "}
              <Link href="/settings" className="underline">
                Add Fal key
              </Link>
            </p>
          )}
          {hasKey && (
            <p className="text-xs text-meme-black/60">
              Using <strong>{providerLabel}</strong> from your browser
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {genState === "done" && (
            <>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch(outputUrl!);
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `meme-${Date.now()}.${blob.type === "image/gif" ? "gif" : "mp4"}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  } catch {
                    window.open(outputUrl!, "_blank");
                  }
                }}
                className="border-2 border-meme-black px-4 py-3 text-sm font-bold"
              >
                DOWNLOAD
              </button>
              <button
                type="button"
                onClick={() => setRegenOpen(true)}
                className="border-2 border-meme-black px-4 py-3 text-sm font-bold"
              >
                REGENERATE
              </button>
            </>
          )}
          <button
            type="button"
            disabled={!canGenerate}
            onClick={() => runGenerate()}
            className="min-w-[200px] border-2 border-meme-black bg-meme-red px-8 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-meme-black/30"
          >
            {genState === "generating"
              ? "GENERATING…"
              : hasKey
                ? `GENERATE (${providerLabel.toUpperCase()})`
                : "PREVIEW GENERATE"}
          </button>
        </div>
        {genState === "generating" && (
          <div className="h-1 w-full overflow-hidden bg-meme-black/10 md:max-w-xs">
            <div className="h-full w-1/2 animate-pulse bg-meme-red" />
          </div>
        )}
      </footer>

      <RegenerateModal
        open={regenOpen}
        onClose={() => setRegenOpen(false)}
        onSubmit={(fb) => runGenerate(fb)}
      />
    </div>
  );
}

function WorkflowPanel({
  step,
  label,
  sublabel,
  badge,
  children,
}: {
  step: number;
  label: string;
  sublabel: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col border-2 border-meme-black bg-white">
      <div className="flex items-baseline gap-2 border-b-2 border-meme-black px-3 py-2">
        <span className="text-lg font-black text-meme-red">{step}</span>
        <span className="text-xs font-black tracking-wide">
          {label}
          {sublabel && ` ${sublabel}`}
        </span>
      </div>
      <div className="relative aspect-[4/3] min-h-[200px] overflow-hidden bg-meme-black/5">
        {children}
      </div>
      <div className="border-t-2 border-meme-black px-3 py-1.5">
        <span className="text-[10px] font-bold tracking-wide">{badge}</span>
      </div>
    </div>
  );
}
