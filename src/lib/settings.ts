"use client";

import { DEFAULT_SETTINGS, type AppSettings } from "./types";

const STORAGE_KEY = "meme-ai-settings";

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function hasReplicateToken(settings: AppSettings): boolean {
  return settings.replicateApiToken.trim().length > 0;
}

export function hasFalKey(settings: AppSettings): boolean {
  return settings.falApiKey.trim().length > 0;
}

export function hasAnyApiKey(settings: AppSettings): boolean {
  return hasFalKey(settings) || hasReplicateToken(settings);
}

/** Which backend runs generation */
export function resolveProvider(
  settings: AppSettings
): "mock" | "replicate" | "fal" {
  if (settings.provider === "fal" && hasFalKey(settings)) return "fal";
  if (settings.provider === "replicate" && hasReplicateToken(settings))
    return "replicate";

  if (settings.provider === "auto" || settings.provider === "mock") {
    if (hasFalKey(settings)) return "fal";
    if (hasReplicateToken(settings)) return "replicate";
  }

  return "mock";
}
