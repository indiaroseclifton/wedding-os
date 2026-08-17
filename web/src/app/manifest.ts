import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vowfolk",
    short_name: "Vowfolk",
    description: "The coordination hub for the wedding you’re actually throwing.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f6f5f2",
    theme_color: "#3d4a3a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
