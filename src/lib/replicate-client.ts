"use client";

/**
 * Browser-only Replicate API client.
 * All calls use the user's API token from localStorage — nothing hits your Vercel server.
 */

const REPLICATE_API = "https://api.replicate.com/v1";

export async function uploadFileToReplicate(
  token: string,
  file: Blob,
  filename: string
): Promise<string> {
  const res = await fetch(`${REPLICATE_API}/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": file.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
    body: file,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Replicate file upload failed: ${err}`);
  }

  const data = (await res.json()) as { urls?: { get: string } };
  const url = data.urls?.get;
  if (!url) throw new Error("Replicate file upload returned no URL");
  return url;
}

export async function createPrediction(
  token: string,
  model: string,
  input: Record<string, unknown>
): Promise<{ id: string; status: string; output?: unknown; error?: string }> {
  let endpoint: string;

  if (model.includes(":")) {
    const [modelPath, versionHash] = model.split(":");
    const [owner, name] = modelPath.split("/");
    endpoint = `${REPLICATE_API}/models/${owner}/${name}/versions/${versionHash}/predictions`;
  } else {
    const [owner, name] = model.split("/");
    endpoint = `${REPLICATE_API}/models/${owner}/${name}/predictions`;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "wait=60",
    },
    body: JSON.stringify({ input }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Replicate prediction failed: ${err}`);
  }

  return res.json();
}

export async function getPrediction(
  token: string,
  id: string
): Promise<{
  id: string;
  status: string;
  output?: unknown;
  error?: string;
}> {
  const res = await fetch(`${REPLICATE_API}/predictions/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Replicate poll failed: ${err}`);
  }
  return res.json();
}

export async function pollPrediction(
  token: string,
  id: string,
  onStatus?: (status: string) => void,
  intervalMs = 3000,
  maxAttempts = 120
): Promise<unknown> {
  for (let i = 0; i < maxAttempts; i++) {
    const pred = await getPrediction(token, id);
    onStatus?.(pred.status);

    if (pred.status === "succeeded") return pred.output;
    if (pred.status === "failed" || pred.status === "canceled") {
      throw new Error(pred.error || `Prediction ${pred.status}`);
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error("Generation timed out");
}

export function extractOutputUrl(output: unknown): string {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];
  if (output && typeof output === "object" && "url" in output) {
    const u = (output as { url: () => string }).url;
    if (typeof u === "function") return u();
  }
  throw new Error("Unexpected Replicate output format");
}
