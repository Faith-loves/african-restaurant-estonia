import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "African Restaurant Estonia",
    short_name: "African Restaurant",
    description: "Authentic Nigerian & West African food in Tallinn.",
    start_url: "/",
    display: "standalone",
    theme_color: "#FFF8EC",
    background_color: "#FFF8EC",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
