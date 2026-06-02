import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = (await req.json()) as { url: string };
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    const ext = url.match(/\.(\w+)(\?|$)/)?.[1] || "mp4";
    const filename = `memes/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch source" }, { status: 502 });
    }

    const blob = await res.blob();
    const result = await put(filename, blob, { access: "public" });

    return NextResponse.json({ url: result.url });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
