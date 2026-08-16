"use client";

import { useEffect } from "react";

export function applyTheme(theme: string) {
  const id = theme || "linen";
  document.documentElement.dataset.theme = id;
  document.cookie = `wedding_os_theme=${id}; path=/; max-age=31536000; samesite=lax`;
}

export function ThemeProvider() {
  useEffect(() => {
    const fromCookie = document.cookie.match(/wedding_os_theme=([^;]+)/)?.[1];
    if (fromCookie) applyTheme(fromCookie);
    fetch("/api/workspace")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.meta?.theme) applyTheme(d.meta.theme);
      })
      .catch(() => {});
  }, []);
  return null;
}
