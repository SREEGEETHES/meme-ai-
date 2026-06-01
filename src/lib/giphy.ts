"use client";

import type { MemeItem } from "./types";
import { STATIC_MEMES } from "./static-memes";

export interface GiphyResult {
  id: string;
  title: string;
  images: {
    fixed_height: { url: string; mp4?: string };
    original: { url: string; mp4?: string };
  };
}

export async function searchGiphy(
  apiKey: string,
  query: string,
  limit = 24
): Promise<MemeItem[]> {
  if (!apiKey.trim()) {
    const q = query.toLowerCase();
    return STATIC_MEMES.filter(
      (m) =>
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.id.includes(q)
    );
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    q: query || "trending memes",
    limit: String(limit),
    rating: "pg-13",
    lang: "en",
  });

  const endpoint = query.trim()
    ? `https://api.giphy.com/v1/gifs/search?${params}`
    : `https://api.giphy.com/v1/gifs/trending?${params}`;

  const res = await fetch(endpoint);
  if (!res.ok) throw new Error("Giphy request failed");
  const data = (await res.json()) as { data: GiphyResult[] };

  return data.data.map(giphyToMeme);
}

function giphyToMeme(g: GiphyResult): MemeItem {
  const mp4 =
    g.images.original.mp4 ||
    g.images.fixed_height.mp4 ||
    g.images.original.url.replace(/\.gif$/, ".mp4");
  return {
    id: g.id,
    title: g.title || "Meme",
    previewUrl: g.images.fixed_height.url,
    mediaUrl: mp4 || g.images.original.url,
    isAnimated: true,
    source: "giphy",
  };
}

export function getMemeById(id: string, apiKey: string): MemeItem | undefined {
  const fromStatic = STATIC_MEMES.find((m) => m.id === id);
  if (fromStatic) return fromStatic;
  return undefined;
}
