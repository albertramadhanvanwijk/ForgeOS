import type { DesignSystemSpec, DesignImpactResult } from './types.js';

export function analyzeDesignImpact(v1: DesignSystemSpec, v2: DesignSystemSpec): DesignImpactResult {
  const tokenChanges = {
    added: [] as string[],
    modified: [] as string[],
    removed: [] as string[],
  };

  // Compare Color Tokens
  const v1Colors = v1.tokens.colors || {};
  const v2Colors = v2.tokens.colors || {};

  for (const [key, val] of Object.entries(v2Colors)) {
    if (!(key in v1Colors)) {
      tokenChanges.added.push(`colors.${key}`);
    } else if (v1Colors[key] !== val) {
      tokenChanges.modified.push(`colors.${key}`);
    }
  }

  for (const key of Object.keys(v1Colors)) {
    if (!(key in v2Colors)) {
      tokenChanges.removed.push(`colors.${key}`);
    }
  }

  // Compare Components
  const componentChanges = {
    added: [] as string[],
    modified: [] as string[],
    removed: [] as string[],
  };

  const v1CompMap = new Map(v1.components.map((c) => [c.name, c]));
  const v2CompMap = new Map(v2.components.map((c) => [c.name, c]));

  for (const [name, comp] of v2CompMap.entries()) {
    if (!v1CompMap.has(name)) {
      componentChanges.added.push(name);
    } else {
      const oldComp = v1CompMap.get(name)!;
      if (JSON.stringify(oldComp) !== JSON.stringify(comp)) {
        componentChanges.modified.push(name);
      }
    }
  }

  for (const name of v1CompMap.keys()) {
    if (!v2CompMap.has(name)) {
      componentChanges.removed.push(name);
    }
  }

  // Compare Sitemap
  const sitemapChanges = {
    added: [] as string[],
    modified: [] as string[],
    removed: [] as string[],
  };

  const v1SiteMap = new Map(v1.sitemap.map((s) => [s.route, s]));
  const v2SiteMap = new Map(v2.sitemap.map((s) => [s.route, s]));

  for (const [route, site] of v2SiteMap.entries()) {
    if (!v1SiteMap.has(route)) {
      sitemapChanges.added.push(route);
    } else {
      const oldSite = v1SiteMap.get(route)!;
      if (JSON.stringify(oldSite) !== JSON.stringify(site)) {
        sitemapChanges.modified.push(route);
      }
    }
  }

  for (const route of v1SiteMap.keys()) {
    if (!v2SiteMap.has(route)) {
      sitemapChanges.removed.push(route);
    }
  }

  const affectedRoutes = Array.from(new Set([
    ...sitemapChanges.added,
    ...sitemapChanges.modified,
    ...sitemapChanges.removed,
  ]));

  const requiresReApproval =
    tokenChanges.added.length > 0 ||
    tokenChanges.modified.length > 0 ||
    tokenChanges.removed.length > 0 ||
    componentChanges.modified.length > 0 ||
    componentChanges.removed.length > 0;

  return {
    tokenChanges,
    componentChanges,
    sitemapChanges,
    affectedRoutes,
    requiresReApproval,
  };
}
