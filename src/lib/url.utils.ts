/**
 * Extract domain/hostname from a URL
 */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch (error) {
    console.error(`Failed to extract domain from URL: ${url}`, error);
    return "";
  }
}
