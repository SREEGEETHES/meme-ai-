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
  const [url, setUrl] = useState("https://github.com");

  useEffect(() => {
    setUrl(loadSettings().githubRepoUrl || "https://github.com");
    const els = document.querySelectorAll("#github-header-cta");
    els.forEach((el) => {
      if (el instanceof HTMLAnchorElement) el.href = loadSettings().githubRepoUrl;
    });
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
