import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { envVars } from "../../config/env";
import { Service } from "../service/service.model";
import { Project } from "../project/project.model";
import { Product } from "../product/product.model";
import { Client } from "../client/client.model";
import { Employee } from "../employee/employee.model";

const SITE_URL = envVars.FRONTEND_URL.replace(/\/$/, "");

const staticRoutes: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/services", changefreq: "weekly", priority: "0.9" },
  { path: "/projects", changefreq: "weekly", priority: "0.9" },
  { path: "/product", changefreq: "weekly", priority: "0.7" },
  { path: "/client", changefreq: "monthly", priority: "0.7" },
  { path: "/employees", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.8" },
];

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const formatDate = (value?: Date | string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
};

type UrlEntry = { loc: string; lastmod?: string; changefreq: string; priority: string };

const urlEntry = ({ loc, lastmod, changefreq, priority }: UrlEntry) => {
  const lines = ["  <url>", `    <loc>${escapeXml(loc)}</loc>`];
  if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
  lines.push(`    <changefreq>${changefreq}</changefreq>`, `    <priority>${priority}</priority>`, "  </url>");
  return lines.join("\n");
};

/**
 * Generates sitemap.xml fresh from the database on every request — no
 * build step, no stale snapshot. New/edited services, projects,
 * products, clients and employees show up the moment they're saved.
 * Mounted at the site root (not under /api/v1) and proxied through the
 * frontend's own domain via a Vercel rewrite, since a sitemap must live
 * on the same domain as the URLs it lists.
 */
const getSitemap = catchAsync(async (req: Request, res: Response) => {
  const [services, projects, products, clients, employees] = await Promise.all([
    Service.find().select("_id updatedAt createdAt").lean(),
    Project.find().select("_id updatedAt createdAt").lean(),
    Product.find().select("_id updatedAt createdAt").lean(),
    Client.find().select("_id updatedAt createdAt").lean(),
    Employee.find().select("_id slug updatedAt createdAt").lean(),
  ]);

  const entries: UrlEntry[] = staticRoutes.map((route) => ({
    loc: `${SITE_URL}${route.path}`,
    changefreq: route.changefreq,
    priority: route.priority,
  }));

  const addDynamic = (
    items: { _id: unknown; slug?: string; updatedAt?: Date; createdAt?: Date }[],
    routePrefix: string,
    changefreq: string,
    priority: string,
  ) => {
    for (const item of items) {
      entries.push({
        loc: `${SITE_URL}${routePrefix}/${item.slug || item._id}`,
        lastmod: formatDate(item.updatedAt || item.createdAt),
        changefreq,
        priority,
      });
    }
  };

  addDynamic(services, "/service", "monthly", "0.7");
  addDynamic(projects, "/project", "monthly", "0.8");
  addDynamic(products, "/product", "weekly", "0.6");
  addDynamic(clients, "/client", "monthly", "0.5");
  addDynamic(employees, "/employee", "monthly", "0.5");

  const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...entries.map(urlEntry), "</urlset>", ""].join(
    "\n",
  );

  res.set("Content-Type", "application/xml");
  // Crawlers hit this occasionally, not on every pageview — a short
  // cache still means "updated within minutes", not "stale for weeks".
  res.set("Cache-Control", "public, max-age=300, s-maxage=300");
  res.status(200).send(xml);
});

export const SitemapController = { getSitemap };
