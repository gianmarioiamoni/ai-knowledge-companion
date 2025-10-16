import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI Knowledge Companion",
    short_name: "AI Companion",
    description: "Your Personal Learning Assistant - Build your own AI tutor",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    icons: [
      {
        src: "/icons/icon-16x16.svg",
        sizes: "16x16",
        type: "image/svg+xml",
      },
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/icons/icon-48x48.svg",
        sizes: "48x48",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-64x64.svg",
        sizes: "64x64",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-72x72.svg",
        sizes: "72x72",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-96x96.svg",
        sizes: "96x96",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-128x128.svg",
        sizes: "128x128",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-144x144.svg",
        sizes: "144x144",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-152x152.svg",
        sizes: "152x152",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icons/icon-192x192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-256x256.svg",
        sizes: "256x256",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-384x384.svg",
        sizes: "384x384",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-512x512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
