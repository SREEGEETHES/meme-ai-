"use client";

/**
 * Browser-only Fal.ai client (queue API).
 * https://fal.ai/models/fal-ai/wan/v2.2-14b/animate/replace/api
 */

const FAL_QUEUE = "https://queue.fal.run";
const FAL_STORAGE = "https://rest.alpha.fal.ai/storage/upload/initiate";

export const FAL_MODELS = {
  fullBody: "fal-ai/wan/v2.2-14b/animate/replace",
  faceGif: "easel-ai/easel-gifswap",
  faceImage: "easel-ai/advanced-face-swap",
} as const;

export async function uploadToFal(key: string, file: File): Promise<string> {
  const initRes = await fetch(
    `${FAL_STORAGE}?storage_type=fal-cdn-v2`,
    {
      method: "POST",
      headers: {
        Authorization: `Key ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_name: file.name || "selfie.jpg",
        content_type: file.type || "image/jpeg",
      }),
    }
  );

  if (!initRes.ok) {
    throw new Error(`Fal storage init failed: ${await initRes.text()}`);
  }

  const init = (await initRes.json()) as {
    upload_url: string;
    file_url: string;
  };

  const putRes = await fetch(init.upload_url, {
    method: "PUT",
    headers: { "Content-Type": file.type || "image/jpeg" },
    body: file,
  });

  if (!putRes.ok) {
    throw new Error("Fal file upload failed");
  }

  return init.file_url;
}

async function submitFal(
  key: string,
  modelId: string,
  input: Record<string, unknown>
): Promise<string> {
  const res = await fetch(`${FAL_QUEUE}/${modelId}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(`Fal submit failed: ${await res.text()}`);
  }

  const data = (await res.json()) as { request_id: string };
  return data.request_id;
}

async function pollFal(
  key: string,
  modelId: string,
  requestId: string,
  onStatus?: (s: string) => void,
  maxAttempts = 120,
  intervalMs = 3000
): Promise<unknown> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${FAL_QUEUE}/${modelId}/requests/${requestId}/status`,
      { headers: { Authorization: `Key ${key}` } }
    );

    if (!res.ok) {
      throw new Error(`Fal status failed: ${await res.text()}`);
    }

    const status = (await res.json()) as {
      status: string;
      response_url?: string;
    };

    onStatus?.(status.status);

    if (status.status === "COMPLETED") {
      const resultRes = await fetch(
        `${FAL_QUEUE}/${modelId}/requests/${requestId}`,
        { headers: { Authorization: `Key ${key}` } }
      );
      if (!resultRes.ok) {
        throw new Error(`Fal result failed: ${await resultRes.text()}`);
      }
      const result = await resultRes.json();
      return (result as { response?: unknown }).response ?? result;
    }

    if (status.status === "FAILED") {
      throw new Error("Fal generation failed");
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error("Fal generation timed out");
}

export function extractFalMediaUrl(response: unknown): string {
  if (!response || typeof response !== "object") {
    throw new Error("Invalid Fal response");
  }

  const r = response as Record<string, unknown>;

  if (r.video && typeof r.video === "object" && r.video !== null) {
    const url = (r.video as { url?: string }).url;
    if (url) return url;
  }

  if (r.image && typeof r.image === "object" && r.image !== null) {
    const url = (r.image as { url?: string }).url;
    if (url) return url;
  }

  if (typeof r.url === "string") return r.url;

  throw new Error("Could not find output URL in Fal response");
}

export async function runFalModel(
  key: string,
  modelId: string,
  input: Record<string, unknown>,
  onStatus?: (s: string) => void
): Promise<string> {
  const requestId = await submitFal(key, modelId, input);
  onStatus?.("IN_QUEUE");
  const response = await pollFal(key, modelId, requestId, onStatus);
  return extractFalMediaUrl(response);
}
