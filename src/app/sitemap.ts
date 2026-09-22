import type { MetadataRoute } from "next";

const siteUrl = "https://africanrestaurant.ee";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/menu", "/catering", "/contact", "/market", "/privacy", "/terms"];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
