"use client";

import { useCallback, useEffect, useState } from "react";
import { MemeCard } from "@/components/MemeCard";
import { searchGiphy } from "@/lib/giphy";
import { loadSettings } from "@/lib/settings";
import type { MemeItem } from "@/lib/types";

export default function TrendingPage() {
  const [query, setQuery] = useState("");
  const [memes, setMemes] = useState<MemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const settings = loadSettings();
      const results = await searchGiphy(settings.giphyApiKey, q);
      setMemes(results);
    } catch {
      setError("Could not load memes. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load("");
  }, [load]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-3xl italic md:text-4xl">Trending</h1>
          <p className="mt-1 text-sm text-meme-black/70">
            Pick a meme to open the editor
          </p>
        </div>
        <form
          className="flex w-full max-w-md gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            load(query);
          }}
        >
          <input
            type="search"
            placeholder="Search Will Ferrell, Tom Cruise..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border-2 border-meme-black bg-white px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="border-2 border-meme-black bg-meme-black px-4 py-2 text-sm font-bold text-cream"
          >
            SEARCH
          </button>
        </form>
      </div>

      {error && (
        <p className="mb-4 border-2 border-meme-red bg-meme-red/10 p-3 text-sm">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm font-bold">Loading memes…</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {memes.map((meme) => (
            <div
              key={meme.id}
              onClick={() => {
                sessionStorage.setItem(
                  `meme-${meme.id}`,
                  JSON.stringify(meme)
                );
              }}
            >
              <MemeCard meme={meme} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
