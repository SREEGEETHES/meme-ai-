"use client";

import clsx from "clsx";
import { MODEL_HINTS } from "@/lib/models";
import type { SwapType } from "@/lib/types";

export function SwapTypeCards({
  value,
  onChange,
  disabled,
}: {
  value: SwapType;
  onChange: (v: SwapType) => void;
  disabled?: boolean;
}) {
  const options: SwapType[] = ["face", "full_body"];

  return (
    <section className="border-2 border-meme-black bg-white">
      <div className="flex items-center justify-between border-b-2 border-meme-black px-4 py-2">
        <h2 className="text-sm font-black tracking-wide">SWAP TYPE</h2>
        <span className="text-xs font-bold text-meme-black/60">PICK ONE</span>
      </div>
      <div className="grid gap-0 md:grid-cols-2">
        {options.map((opt) => {
          const hint = MODEL_HINTS[opt === "face" ? "face" : "full_body"];
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt)}
              className={clsx(
                "border-meme-black p-4 text-left transition md:border-r-2 last:md:border-r-0",
                selected
                  ? "border-2 border-meme-red bg-meme-red/5 ring-2 ring-meme-red ring-inset"
                  : "border-b-2 md:border-b-0 hover:bg-cream",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-black">{hint.label}</span>
                {opt === "full_body" && (
                  <span className="rounded-sm bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    PREMIUM
                  </span>
                )}
              </div>
              <p className="mb-4 text-sm text-meme-black/80">{hint.description}</p>
              <div className="flex flex-wrap gap-2 text-[10px] font-bold tracking-wide text-meme-black/70">
                <span>{hint.time}</span>
                <span>·</span>
                <span>{hint.tier}</span>
                <span>·</span>
                <span>{hint.technique}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
