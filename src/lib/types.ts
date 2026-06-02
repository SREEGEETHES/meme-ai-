export type SwapType = "face" | "full_body";

export type ProviderId = "mock" | "replicate" | "fal" | "auto";

export interface MemeItem {
  id: string;
  title: string;
  previewUrl: string;
  /** MP4 preferred for video models; GIF fallback */
  mediaUrl: string;
  isAnimated: boolean;
  source: "giphy" | "static";
}

export interface GenerationFeedback {
  missing?: string;
  add?: string;
  remove?: string;
}

export interface GenerationJob {
  id: string;
  memeId: string;
  memeTitle: string;
  swapType: SwapType;
  status: "idle" | "uploading" | "queued" | "processing" | "succeeded" | "failed";
  outputUrl?: string;
  error?: string;
  feedback?: GenerationFeedback;
  parentJobId?: string;
  createdAt: number;
}

export interface AppSettings {
  replicateApiToken: string;
  falApiKey: string;
  giphyApiKey: string;
  provider: ProviderId;
  /** Ollama base URL — optional, for feedback notes only */
  ollamaBaseUrl: string;
  ollamaModel: string;
  githubRepoUrl: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  replicateApiToken: "",
  falApiKey: "",
  giphyApiKey: "",
  provider: "auto",
  ollamaBaseUrl: "http://localhost:11434",
  ollamaModel: "llama3.2",
  githubRepoUrl: "https://github.com/SREEGEETHES/meme-ai-",
};
