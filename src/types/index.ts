export interface SeriesMetadata {
  series: string;
  sequence: string;
}

export interface BookMetadata {
  title: string;
  subtitle?: string;
  author?: string;
  narrator?: string;
  publisher?: string;
  publishedYear?: string;
  description?: string;
  cover?: string;
  isbn?: string;
  asin?: string;
  genres?: string[];
  tags?: string[];
  series?: SeriesMetadata[];
  language?: string;
  duration?: number;
  _providerId?: string;
  _provider?: string;
}

export interface SearchQuery {
  query?: string;
  author?: string;
  type?: string;
  isbn?: string;
}

export interface CacheEntry<T = any> {
  id: string;
  data: T;
  createdAt: Date;
  expiresAt: Date;
}

export interface ParameterWhitelist {
  [paramName: string]: string[];
}

export interface ProviderConfig {
  name: string;
  baseUrl?: string;
  requiredParams?: string[];
  optionalParams?: string[];
  parameterWhitelists?: ParameterWhitelist;
  commaSeparatedParams?: string[];
}
