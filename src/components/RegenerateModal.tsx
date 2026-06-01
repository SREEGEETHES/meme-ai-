"use client";

import { useState } from "react";
import type { GenerationFeedback } from "@/lib/types";

export function RegenerateModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (feedback: GenerationFeedback) => void;
}) {
  const [missing, setMissing] = useState("");
  const [add, setAdd] = useState("");
  const [remove, setRemove] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md border-2 border-meme-black bg-cream p-6 shadow-brutal">
        <h3 className="mb-4 font-serif text-2xl italic">Regenerate</h3>
        <p className="mb-4 text-sm text-meme-black/70">
          Wan 2.2 and face-swap models don&apos;t use text prompts. Your notes are
          saved locally; we retry with a new seed and you can adjust your photo.
        </p>
        <label className="mb-3 block text-xs font-bold">
          What was missing?
          <textarea
            className="mt-1 w-full border-2 border-meme-black bg-white p-2 text-sm"
            rows={2}
            value={missing}
            onChange={(e) => setMissing(e.target.value)}
            placeholder="e.g. hat wasn't swapped"
          />
        </label>
        <label className="mb-3 block text-xs font-bold">
          What should be added?
          <textarea
            className="mt-1 w-full border-2 border-meme-black bg-white p-2 text-sm"
            rows={2}
            value={add}
            onChange={(e) => setAdd(e.target.value)}
          />
        </label>
        <label className="mb-4 block text-xs font-bold">
          What should be removed?
          <textarea
            className="mt-1 w-full border-2 border-meme-black bg-white p-2 text-sm"
            rows={2}
            value={remove}
            onChange={(e) => setRemove(e.target.value)}
          />
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border-2 border-meme-black py-2 text-sm font-bold"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={() => {
              onSubmit({ missing, add, remove });
              onClose();
            }}
            className="flex-1 border-2 border-meme-black bg-meme-red py-2 text-sm font-bold text-white"
          >
            REGENERATE
          </button>
        </div>
      </div>
    </div>
  );
}
