"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadHistory } from "@/lib/history";
import type { GenerationJob } from "@/lib/types";

export default function MyMemesPage() {
  const [jobs, setJobs] = useState<GenerationJob[]>([]);

  useEffect(() => {
    setJobs(loadHistory());
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <h1 className="mb-2 font-serif text-3xl italic">My memes</h1>
      <p className="mb-8 text-sm text-meme-black/70">
        Stored in your browser only — nothing on our servers.
      </p>

      {jobs.length === 0 ? (
        <div className="border-2 border-meme-black bg-white p-8 text-center">
          <p className="mb-4">No generations yet.</p>
          <Link
            href="/trending"
            className="inline-block border-2 border-meme-black bg-meme-red px-4 py-2 text-sm font-bold text-white"
          >
            BROWSE TRENDING
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="border-2 border-meme-black bg-white shadow-brutal"
            >
              {job.outputUrl && (
                <video
                  src={job.outputUrl}
                  className="aspect-video w-full object-cover"
                  muted
                  playsInline
                />
              )}
              <div className="border-t-2 border-meme-black p-3">
                <p className="truncate text-sm font-bold">{job.memeTitle}</p>
                <p className="text-xs text-meme-black/60">
                  {job.swapType === "full_body" ? "Full body" : "Face"} ·{" "}
                  {new Date(job.createdAt).toLocaleString()}
                </p>
                <Link
                  href={`/remix/${job.memeId}`}
                  className="mt-2 inline-block text-xs font-bold underline"
                >
                  Open in editor
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
