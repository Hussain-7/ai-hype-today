export interface Source {
  label: string;
  url: string;
}

export interface DomainFilter {
  include: string[];
  exclude: string[];
}

export interface CompanySource {
  company: string;
  slug: string;
  aliases?: string[];
  category: string[];
  dominance_bucket: string;
  domain_key: string;
  domain_filter: DomainFilter;
  sources: Source[];
}
