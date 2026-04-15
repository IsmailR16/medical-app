import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/cases", "/sessions", "/billing", "/settings", "/evaluations", "/api/"],
      },
    ],
    sitemap: "https://diagnostika.se/sitemap.xml",
  };
}
