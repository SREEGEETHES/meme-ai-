"use client";

/**
 * Browser-only Replicate API client.
 * All calls use the user's API token from localStorage — nothing hits your Vercel server.
 */

const REPLICATE_API = "/api/replicate-proxy/v1";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") resolve(result);
      else reject(new Error("FileReader did not produce a data URL"));
    };
    reader.onerror = () => reject(reader.error || new Error("FileReader failed"));
    reader.readAsDataURL(blob);
  });
}

export async function uploadFileToReplicate(
  _token: string,
  file: Blob,
  _filename: string
): Promise<string> {
  // Replicate models accept base64 data URLs directly as input.
  // Uploading via the /files endpoint doesn't work reliably through
  // a local proxy because Next.js App Router doesn't expose raw
  // binary request bodies for forwarding. Base64 is simpler and
  // avoids the problem entirely.
  return blobToDataUrl(file);
}

async function fetchModel(
  token: string,
  modelOwner: string,
  modelName: string
): Promise<{ latest_version?: { id: string } }> {
  const res = await fetch(
    `${REPLICATE_API}/models/${modelOwner}/${modelName}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Replicate model lookup failed (${res.status}): ${tryParseReplicateError(errText)}`
    );
  }
  return res.json();
}

export async function createPrediction(
  token: string,
  model: string,
  input: Record<string, unknown>
): Promise<{ id: string; status: string; output?: unknown; error?: string }> {
  let versionHash: string;

  if (model.includes(":")) {
    versionHash = model.split(":")[1];
  } else {
    const [owner, name] = model.split("/");
    const modelInfo = await fetchModel(token, owner, name);
    if (!modelInfo.latest_version?.id) {
      throw new Error(
        `Replicate model "${model}" has no latest_version — use a pinned version hash`
      );
    }
    versionHash = modelInfo.latest_version.id;
  }

  const endpoint = `${REPLICATE_API}/predictions`;
  console.log("Replicate createPrediction endpoint:", endpoint, "version:", versionHash);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "wait=60",
    },
    body: JSON.stringify({ version: versionHash, input }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Replicate prediction failed:", res.status, errText);
    const clean = tryParseReplicateError(errText) || `HTTP ${res.status}`;
    throw new Error(`Replicate prediction failed (${res.status}): ${clean}`);
  }

  return res.json();
}

export async function createPredictionWithRetry(
  token: string,
  model: string,
  input: Record<string, unknown>,
  maxRetries = 2
): Promise<{ id: string; status: string; output?: unknown; error?: string }> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await createPrediction(token, model, input);
    } catch (e) {
      const isServerError =
        e instanceof Error && /\(5\d{2}\)/.test(e.message);
      if (isServerError && attempt < maxRetries) {
        console.log(`createPrediction retry ${attempt + 1}/${maxRetries}...`);
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      throw e;
    }
  }
  throw new Error("createPrediction exhausted retries");
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
    const errText = await res.text();
    console.error("Replicate poll failed:", res.status, errText);
    const clean = tryParseReplicateError(errText);
    throw new Error(`Replicate poll failed (${res.status}): ${clean}`);
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

    if (pred.status === "succeeded") {
      if (pred.output != null) return pred.output;
      console.log("pollPrediction: status succeeded but output null, retrying...");
    }
    if (pred.status === "failed" || pred.status === "canceled") {
      const detail = pred.error || `Prediction ${pred.status}`;
      console.error("Replicate prediction failed:", detail, "id:", pred.id);
      throw new Error(detail);
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error("Generation timed out");
}

function tryParseReplicateError(text: string): string {
  if (!text) return "";
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    if (typeof parsed.detail === "string") return parsed.detail;
    if (Array.isArray(parsed.detail)) {
      const msgs = parsed.detail
        .filter((i) => i && typeof (i as Record<string, unknown>).msg === "string")
        .map((i) => (i as Record<string, unknown>).msg as string);
      if (msgs.length > 0) return msgs.join("; ");
    }
    if (typeof parsed.message === "string") return parsed.message;
    if (typeof parsed.error === "string") return parsed.error;
    return text;
  } catch {
    return text;
  }
}

export function extractOutputUrl(output: unknown): string {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];
  if (output && typeof output === "object") {
    const obj = output as Record<string, unknown>;
    const urlVal = obj.url || obj.video || obj.image || obj.output;
    if (typeof urlVal === "string") return urlVal;
  }
  console.error("extractOutputUrl: unexpected output format", JSON.stringify(output).slice(0, 300));
  throw new Error(`Unexpected Replicate output format: ${JSON.stringify(output).slice(0, 150)}`);
}
