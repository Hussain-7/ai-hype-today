import type { DomainFilter } from '@/types/sources.types';

export class DomainFilterService {
  /**
   * Check if a URL is allowed based on domain filter rules
   * Supports subdomain matching (e.g., platform.openai.com matches openai.com)
   */
  static isUrlAllowed(url: string, domainFilter: DomainFilter): boolean {
    try {
      const urlDomain = new URL(url).hostname.toLowerCase();

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
  static extractDomain(url: string): string {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch (error) {
      console.error(`Failed to extract domain from URL: ${url}`, error);
      return '';
    }
  }

  /**
   * Check if a domain matches a pattern (including subdomains)
   */
  static domainMatchesPattern(domain: string, pattern: string): boolean {
    const normalizedDomain = domain.toLowerCase();
    const normalizedPattern = pattern.toLowerCase();

    return (
      normalizedDomain === normalizedPattern ||
      normalizedDomain.endsWith(`.${normalizedPattern}`)
    );
  }
}
