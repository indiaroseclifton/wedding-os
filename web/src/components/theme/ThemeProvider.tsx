"use client";

import { useEffect } from "react";

export function applyTheme(theme: string) {
  const id = theme || "linen";
  document.documentElement.dataset.theme = id;
  document.cookie = `wedding_os_theme=${id}; path=/; max-age=31536000; samesite=lax`;
}

export function applyLook(opts: {
  theme?: string;
  glass?: string;
  density?: string;
  typeScale?: string;
  motion?: string;
}) {
  if (opts.theme) applyTheme(opts.theme);
  if (opts.glass) {
    document.documentElement.dataset.glass = opts.glass;
    document.cookie = `wedding_os_glass=${opts.glass}; path=/; max-age=31536000; samesite=lax`;
  }
  if (opts.density) {
    document.documentElement.dataset.density = opts.density;
    document.cookie = `wedding_os_density=${opts.density}; path=/; max-age=31536000; samesite=lax`;
  }
  if (opts.typeScale) {
    document.documentElement.dataset.type = opts.typeScale;
    document.cookie = `wedding_os_type=${opts.typeScale}; path=/; max-age=31536000; samesite=lax`;
  }
  if (opts.motion) {
    document.documentElement.dataset.motion = opts.motion;
    document.cookie = `wedding_os_motion=${opts.motion}; path=/; max-age=31536000; samesite=lax`;
  }
}

function fromCookie(key: string) {
  return document.cookie.match(new RegExp(`${key}=([^;]+)`))?.[1];
}

export function ThemeProvider() {
  useEffect(() => {
    applyLook({
      theme: fromCookie("wedding_os_theme") || "linen",
      glass: fromCookie("wedding_os_glass") || "mid",
      density: fromCookie("wedding_os_density") || "regular",
      typeScale: fromCookie("wedding_os_type") || "regular",
      motion: fromCookie("wedding_os_motion") || "calm",
    });
    fetch("/api/workspace")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.meta) return;
        applyLook({
          theme: d.meta.theme,
          glass: d.meta.glass,
          density: d.meta.density,
          typeScale: d.meta.typeScale,
          motion: d.meta.motion,
        });
      })
      .catch(() => {});
  }, []);
  return null;
}
