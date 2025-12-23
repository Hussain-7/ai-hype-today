import type { DomainFilter } from "@/types/sources.types";

/**
 * Check if a URL is a valid article URL (not a listing/category page)
 */
function isValidArticleUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();

    // Reject bare /blog or /blog/ URLs (listing pages)
    if (pathname === "/blog" || pathname === "/blog/") {
      return false;
    }

    // Reject other common listing page patterns
    const listingPatterns = [
      "/news",
      "/news/",
      "/updates",
      "/updates/",
      "/articles",
      "/articles/",
      "/posts",
      "/posts/",
      "/changelog",
      "/changelog/",
      "/releases",
      "/releases/",
    ];

    if (listingPatterns.includes(pathname)) {
      return false;
    }

    // Reject category/tag pages
    if (
      pathname.includes("/category/") ||
      pathname.includes("/tag/") ||
      pathname.includes("/tags/")
    ) {
      return false;
    }

    // Reject pagination pages
    if (/\/page\/\d+\/?$/i.test(pathname)) {
      return false;
    }

    // URL should have some content after /blog/ or similar paths
    // Valid: /blog/article-slug, /news/article-title
    // Invalid: /blog, /blog/, /news
    const segments = pathname.split("/").filter((s) => s.length > 0);
    if (segments.length === 0) {
      return false; // Just domain, no path
    }

    return true;
  } catch (_error) {
    return false;
  }
}

/**
 * Check if a URL is from a forum or community site
 */
function isForumUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.toLowerCase();

    // Check for forum subdomains
    const forumSubdomains = [
      "forum.",
      "forums.",
      "community.",
      "discuss.",
      "discussions.",
      "support.",
    ];

    if (forumSubdomains.some((subdomain) => hostname.startsWith(subdomain))) {
      return true;
    }

    // Check for forum path patterns
    const forumPaths = [
      "/forum/",
      "/forums/",
      "/community/",
      "/discuss/",
      "/discussions/",
      "/t/", // Discourse forums
      "/topic/",
      "/thread/",
    ];

    if (forumPaths.some((path) => pathname.includes(path))) {
      return true;
    }

    return false;
  } catch (_error) {
    return false;
  }
}

/**
 * Check if a URL is allowed based on domain filter rules
 * Supports subdomain matching (e.g., platform.openai.com matches openai.com)
 */
export function isUrlAllowed(url: string, domainFilter: DomainFilter): boolean {
  try {
    const urlDomain = new URL(url).hostname.toLowerCase();

    // Reject forum URLs immediately
    if (isForumUrl(url)) {
      return false;
    }

    // Reject invalid article URLs (listing pages, etc.)
    if (!isValidArticleUrl(url)) {
      return false;
    }

    // Check if domain matches any include pattern
    const isIncluded = domainFilter.include.some((pattern) => {
      const normalizedPattern = pattern.toLowerCase();
      return (
        urlDomain === normalizedPattern ||
        urlDomain.endsWith(`.${normalizedPattern}`)
      );
    });

    // Check if domain matches any exclude pattern
    const isExcluded = domainFilter.exclude.some((pattern) => {
      const normalizedPattern = pattern.toLowerCase();
      return (
        urlDomain === normalizedPattern ||
        urlDomain.endsWith(`.${normalizedPattern}`)
      );
    });

    return isIncluded && !isExcluded;
  } catch (error) {
    console.error(`Invalid URL: ${url}`, error);
    return false;
  }
}

/**
 * Extract domain from URL for storage
 */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch (error) {
    console.error(`Failed to extract domain from URL: ${url}`, error);
    return "";
  }
}

/**
 * Check if a domain matches a pattern (including subdomains)
 */
export function domainMatchesPattern(domain: string, pattern: string): boolean {
  const normalizedDomain = domain.toLowerCase();
  const normalizedPattern = pattern.toLowerCase();

  return (
    normalizedDomain === normalizedPattern ||
    normalizedDomain.endsWith(`.${normalizedPattern}`)
  );
}
