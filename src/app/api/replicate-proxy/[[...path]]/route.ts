import { NextResponse } from "next/server";

const REPLICATE_API = "https://api.replicate.com";

async function proxyRequest(req: Request, pathSegments: string[]) {
  const path = pathSegments.join("/");
  const search = new URL(req.url).search;
  const targetUrl = `${REPLICATE_API}/${path}${search}`;

  const headers = new Headers();
  const auth = req.headers.get("authorization");
  if (auth) headers.set("Authorization", auth);
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  const contentDisposition = req.headers.get("content-disposition");
  if (contentDisposition) headers.set("Content-Disposition", contentDisposition);
  const prefer = req.headers.get("prefer");
  if (prefer) headers.set("Prefer", prefer);

  const hasBody = req.method !== "GET" && req.method !== "HEAD";

  console.log("[Replicate Proxy]", req.method, targetUrl, hasBody ? "with body" : "no body");

  const body = hasBody ? await req.text() : undefined;

  if (body) {
    console.log("[Replicate Proxy] body length:", body.length);
  }

  const res = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
  });

  console.log("[Replicate Proxy] response status:", res.status, res.statusText);

  const responseHeaders = new Headers();
  const ct = res.headers.get("Content-Type");
  if (ct) responseHeaders.set("Content-Type", ct);

  const responseBody = await res.text();

  if (!res.ok) {
    console.log("[Replicate Proxy] error body:", responseBody.slice(0, 500));
  }

  return new NextResponse(responseBody, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path || []);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path || []);
}
