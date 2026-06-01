"use client";

import type { GenerationJob } from "./types";

const KEY = "meme-ai-history";

export function loadHistory(): GenerationJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GenerationJob[]) : [];
  } catch {
    return [];
  }
}

export function saveJob(job: GenerationJob): void {
  const list = loadHistory();
  list.unshift(job);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
}
