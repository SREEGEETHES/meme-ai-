import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.giphy.com" },
      { protocol: "https", hostname: "i.giphy.com" },
      { protocol: "https", hostname: "replicate.delivery" },
    ],
  },
};

export default nextConfig;
