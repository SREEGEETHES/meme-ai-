"use client";

import { FAL_MODELS, runFalModel, uploadToFal, uploadUrlToFal } from "./fal-client";
import { REPLICATE_MODELS } from "./models";
import {
  createPredictionWithRetry,
  extractOutputUrl,
  pollPrediction,
  uploadFileToReplicate,
} from "./replicate-client";
import { resolveProvider } from "./settings";
import type { AppSettings, GenerationFeedback, MemeItem, SwapType } from "./types";

export interface GenerateParams {
  settings: AppSettings;
  meme: MemeItem;
  photoFile: File;
  swapType: SwapType;
  feedback?: GenerationFeedback;
  onStatus?: (status: string) => void;
}

const DEMO_OUTPUT =
  "https://media.giphy.com/media/26BRuo6sKonk9h2Fi/giphy.mp4";

async function mockGenerate(onStatus?: (s: string) => void): Promise<string> {
  onStatus?.("uploading");
  await delay(800);
  onStatus?.("processing");
  await delay(2500);
  onStatus?.("succeeded");
  return DEMO_OUTPUT;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isGifUrl(url: string): boolean {
  return (
    /\.gif(\?|$)/i.test(url) ||
    (url.includes("giphy.com") && !url.endsWith(".mp4"))
  );
}

function toGifUrl(url: string): string {
  return url.replace(/\.mp4(\?|$)/i, ".gif$1");
}

function isExternalGiphyUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return hostname.includes("giphy.com");
  } catch {
    return false;
  }
}

function pickVideoUrl(meme: MemeItem): string {
  if (meme.mediaUrl.includes(".mp4")) return meme.mediaUrl;
  return meme.mediaUrl.replace(/\.gif(\?.*)?$/i, ".mp4$1") || meme.mediaUrl;
}

async function generateWithReplicate(
  params: GenerateParams,
  token: string
): Promise<string> {
  const { meme, photoFile, swapType, onStatus } = params;

  onStatus?.("uploading");
  const characterUrl = await uploadFileToReplicate(
    token,
    photoFile,
    photoFile.name || "selfie.jpg"
  );
  console.log("Replicate character uploaded:", characterUrl);

  const videoUrl = pickVideoUrl(meme);
  const mediaIsGif =
    isGifUrl(meme.mediaUrl) && !videoUrl.includes(".mp4");
  console.log("Replicate inputs — video:", videoUrl, "gif:", meme.mediaUrl, "isGif:", mediaIsGif);

  if (swapType === "full_body") {
    onStatus?.("processing");
    const input: Record<string, unknown> = {
      video: videoUrl,
      character_image: characterUrl,
      resolution: "480p",
      go_fast: true,
      merge_audio: true,
    };
    if (params.feedback?.missing || params.feedback?.add) {
      input.seed = Math.floor(Math.random() * 1_000_000);
    }

    const pred = await createPredictionWithRetry(
      token,
      REPLICATE_MODELS.fullBodyVideo,
      input
    );
    if (pred.status === "succeeded" && pred.output) {
      onStatus?.("succeeded");
      return extractOutputUrl(pred.output);
    }
    const output = await pollPrediction(token, pred.id, onStatus);
    return extractOutputUrl(output);
  }

  if (mediaIsGif || meme.isAnimated) {
    onStatus?.("processing");
    const pred = await createPredictionWithRetry(token, REPLICATE_MODELS.faceGif, {
      target: toGifUrl(meme.mediaUrl),
      source: characterUrl,
    });
    if (pred.status === "succeeded" && pred.output) {
      onStatus?.("succeeded");
      return extractOutputUrl(pred.output);
    }
    const output = await pollPrediction(token, pred.id, onStatus);
    return extractOutputUrl(output);
  }

  onStatus?.("processing");
  const pred = await createPredictionWithRetry(token, REPLICATE_MODELS.faceImage, {
    input_image: meme.previewUrl || meme.mediaUrl,
    swap_image: characterUrl,
  });
  if (pred.status === "succeeded" && pred.output) {
    onStatus?.("succeeded");
    return extractOutputUrl(pred.output);
  }
  const output = await pollPrediction(token, pred.id, onStatus);
  return extractOutputUrl(output);
}

async function generateWithFal(
  params: GenerateParams,
  key: string
): Promise<string> {
  const { meme, photoFile, swapType, onStatus } = params;

  const resolveMediaUrl = async (url: string) => {
    if (isExternalGiphyUrl(url)) {
      return await uploadUrlToFal(key, url);
    }
    return url;
  };

  onStatus?.("uploading");
  const [faceUrl, videoUrl, gifUrl, targetImageUrl] = await Promise.all([
    uploadToFal(key, photoFile),
    resolveMediaUrl(pickVideoUrl(meme)),
    resolveMediaUrl(meme.mediaUrl),
    resolveMediaUrl(meme.previewUrl || meme.mediaUrl),
  ]);

  const useGifFace =
    swapType === "face" &&
    (isGifUrl(meme.mediaUrl) || meme.isAnimated);

  if (swapType === "full_body") {
    onStatus?.("processing");
    return runFalModel(
      key,
      FAL_MODELS.fullBody,
      {
        video_url: videoUrl,
        image_url: faceUrl,
        use_turbo: true,
      },
      onStatus
    );
  }

  if (useGifFace) {
    onStatus?.("processing");
    return runFalModel(
      key,
      FAL_MODELS.faceGif,
      {
        face_image: faceUrl,
        gif_image: gifUrl,
      },
      onStatus
    );
  }

  onStatus?.("processing");
  return runFalModel(
    key,
    FAL_MODELS.faceImage,
    {
      face_image_0: faceUrl,
      target_image: targetImageUrl,
      gender_0: "male",
      workflow_type: "user_hair",
    },
    onStatus
  );
}

export async function generateMeme(params: GenerateParams): Promise<string> {
  const provider = resolveProvider(params.settings);
  const onStatus = params.onStatus;

  let outputUrl: string;

  if (provider === "mock") {
    outputUrl = await mockGenerate(onStatus);
  } else if (provider === "fal") {
    outputUrl = await generateWithFal(params, params.settings.falApiKey.trim());
  } else {
    outputUrl = await generateWithReplicate(
      params,
      params.settings.replicateApiToken.trim()
    );
  }

  onStatus?.("uploading");

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: outputUrl }),
    });
    if (res.ok) {
      const data = (await res.json()) as { url: string };
      return data.url;
    }
  } catch {
    // fall through to return original URL
  }

  return outputUrl;
}
