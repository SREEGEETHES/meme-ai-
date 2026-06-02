"use client";

import { loadSettings } from "@/lib/settings";
import { useEffect, useState } from "react";

export function GithubLink({
  className = "",
  children = "GO TO GITHUB",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [url, setUrl] = useState("https://github.com/SREEGEETHES/meme-ai");

  useEffect(() => {
    const saved = loadSettings().githubRepoUrl;
    if (saved) {
      setUrl(saved);
      const els = document.querySelectorAll("#github-header-cta");
      els.forEach((el) => {
        if (el instanceof HTMLAnchorElement) el.href = saved;
      });
    }
  }, []);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
