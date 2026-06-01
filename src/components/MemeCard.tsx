import Link from "next/link";
import type { MemeItem } from "@/lib/types";

export function MemeCard({ meme }: { meme: MemeItem }) {
  return (
    <Link
      href={`/remix/${meme.id}?title=${encodeURIComponent(meme.title)}`}
      className="group block border-2 border-meme-black bg-white shadow-brutal transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#0A0A0A]"
    >
      <div className="relative aspect-video overflow-hidden bg-meme-black/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meme.previewUrl}
          alt={meme.title}
          className="h-full w-full object-cover"
        />
        {meme.isAnimated && (
          <span className="absolute bottom-2 left-2 border border-meme-black bg-cream px-1.5 py-0.5 text-[10px] font-bold">
            ANIMATED
          </span>
        )}
      </div>
      <p className="truncate border-t-2 border-meme-black px-2 py-2 text-xs font-bold uppercase">
        {meme.title}
      </p>
    </Link>
  );
}
