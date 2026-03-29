import type { MetadataRoute } from "next";
import { getAllStates, getAllZips, getTopComparisonPairs } from "@/lib/db";
import { getAllPosts } from "@/lib/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sunpowerpeek.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const states = getAllStates();
  const zips = getAllZips();
  const comparisons = getTopComparisonPairs();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1.0 },
    { url: `${SITE_URL}/calculator`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/incentives`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/compare`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/solar-cities`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const statePages: MetadataRoute.Sitemap = states.map((s) => ({
    url: `${SITE_URL}/state/${s.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const zipPages: MetadataRoute.Sitemap = zips.map((z) => ({
    url: `${SITE_URL}/zip/${z.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const comparePages: MetadataRoute.Sitemap = comparisons.map((c) => ({
    url: `${SITE_URL}/compare/${c.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const solarCitiesPages: MetadataRoute.Sitemap = states.map((s) => ({
    url: `${SITE_URL}/solar-cities/${s.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const incentiveStatePages: MetadataRoute.Sitemap = states.map((s) => ({
    url: `${SITE_URL}/incentives/${s.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/blog/`, changeFrequency: "weekly" as const, priority: 0.8 },
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}/`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      lastModified: p.updatedAt ?? p.publishedAt,
    })),
  ];

  return [...staticPages, ...statePages, ...zipPages, ...comparePages, ...solarCitiesPages, ...incentiveStatePages, ...blogPages];
}
