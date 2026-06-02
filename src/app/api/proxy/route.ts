import { NextResponse } from "next/server";

const ALLOWED_HOSTS = [
  "media.giphy.com",
  "media1.giphy.com",
  "media2.giphy.com",
  "media3.giphy.com",
  "media4.giphy.com",
  "i.giphy.com",
  "giphy.com",
];

const MAX_SIZE_MB = 50;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.includes(targetUrl.hostname)) {
    return NextResponse.json(
      { error: "Domain not allowed" },
      { status: 403 }
    );
  }

  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    return NextResponse.json(
      { error: "Invalid protocol" },
      { status: 400 }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${res.status}` },
        { status: 502 }
      );
    }

    const contentType = res.headers.get("Content-Type") || "";
    if (!contentType.startsWith("image/") && !contentType.startsWith("video/")) {
      return NextResponse.json(
        { error: `Invalid content type: ${contentType}` },
        { status: 400 }
      );
    }

    const contentLength = res.headers.get("Content-Length");
    if (contentLength) {
      const sizeMB = parseInt(contentLength, 10) / (1024 * 1024);
      if (sizeMB > MAX_SIZE_MB) {
        return NextResponse.json(
          { error: `File too large (${sizeMB.toFixed(1)} MB > ${MAX_SIZE_MB} MB)` },
          { status: 413 }
        );
      }
    }

    if (!res.body) {
      return NextResponse.json(
        { error: "Empty response body" },
        { status: 502 }
      );
    }

    return new NextResponse(res.body, {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    clearTimeout(timeout);
    const message = err instanceof Error ? err.message : "Fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
