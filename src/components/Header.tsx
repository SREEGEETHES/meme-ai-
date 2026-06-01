"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV = [
  { href: "/", label: "HOME" },
  { href: "/trending", label: "TRENDING" },
  { href: "/my-memes", label: "MY MEMES" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b-2 border-meme-black bg-cream">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-3 w-3 bg-meme-red" aria-hidden />
          <span className="text-lg font-black tracking-tight">MEME AI</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "text-xs font-bold tracking-widest transition-colors",
                pathname === item.href
                  ? "text-meme-red"
                  : "hover:text-meme-red"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="border-2 border-meme-black px-3 py-1.5 text-xs font-bold hover:bg-meme-black hover:text-cream"
          >
            API KEYS
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden border-2 border-meme-black bg-meme-red px-3 py-1.5 text-xs font-bold text-white hover:bg-meme-black sm:inline-block"
            id="github-header-cta"
          >
            GITHUB
          </a>
        </div>
      </div>

      <nav className="flex justify-center gap-4 border-t border-meme-black/10 py-2 md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-[10px] font-bold tracking-widest"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
