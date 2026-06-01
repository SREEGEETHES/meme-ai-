"use client";

import Link from "next/link";
import { loadSettings, hasAnyApiKey } from "@/lib/settings";
import { useEffect, useState } from "react";

export function DemoBanner() {
  const [ready, setReady] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const s = loadSettings();
    setHasKey(hasAnyApiKey(s));
    setReady(true);
  }, []);

  if (!ready || hasKey) return null;

  return (
    <div className="border-b-2 border-meme-black bg-meme-red/10 px-4 py-2 text-center text-sm">
      <span className="font-medium">
        Preview mode — add your{" "}
        <Link href="/settings" className="font-bold underline">
          Fal or Replicate API key
        </Link>{" "}
        in the browser to generate for real. We never host your keys or run jobs
        on our servers.
      </span>
    </div>
  );
}
