import { BookMetadata, SearchQuery, ProviderConfig } from '../../types';
import { CacheService } from '../../cache';

export abstract class BaseProvider {
  protected config: ProviderConfig;
  protected cache: CacheService;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.cache = new CacheService();
  }

  abstract search(query: SearchQuery, pathParams?: Record<string, string>): Promise<BookMetadata[]>;

  protected validatePathParams(pathParams: Record<string, string> = {}): void {
    const { requiredParams = [], parameterWhitelists = {}, commaSeparatedParams = [] } = this.config;

    for (const param of requiredParams) {
      if (!pathParams[param]) {
        throw new Error(`Required parameter '${param}' is missing for provider '${this.config.name}'`);
      }
    }

    // Validate against whitelists
    for (const [param, value] of Object.entries(pathParams)) {
      if (parameterWhitelists[param]) {
        if (commaSeparatedParams.includes(param)) {
          const values = value.split(',').map((v) => v.trim());
          for (const individualValue of values) {
            if (!parameterWhitelists[param].includes(individualValue)) {
              throw new Error(
                `Invalid value '${individualValue}' for parameter '${param}' in provider '${this.config.name}'. ` +
                  `Allowed values: ${parameterWhitelists[param].join(', ')}`
              );
            }
          }
        } else {
          if (!parameterWhitelists[param].includes(value)) {
            throw new Error(
              `Invalid value '${value}' for parameter '${param}' in provider '${this.config.name}'. ` +
                `Allowed values: ${parameterWhitelists[param].join(', ')}`
            );
          }
        }
      }
    }
  }

  async searchWithCache(query: SearchQuery, pathParams?: Record<string, string>): Promise<BookMetadata[]> {
    this.validatePathParams(pathParams);

    const cached = await this.cache.get(this.config.name, query, pathParams);
    if (cached) {
      console.log(`Cache HIT! Returning ${cached.length} cached results`);
      return cached;
    }

    console.log(`Cache MISS! Performing new search...`);
    const results = await this.search(query, pathParams);
    await this.cache.set(this.config.name, query, results, pathParams);

    return results;
  }

  getName(): string {
    return this.config.name;
  }

  getRequiredParams(): string[] {
    return this.config.requiredParams || [];
  }

  getOptionalParams(): string[] {
    return this.config.optionalParams || [];
  }

  getParameterWhitelists(): Record<string, string[]> {
    return this.config.parameterWhitelists || {};
  }

  getWhitelistForParameter(param: string): string[] | undefined {
    return this.config.parameterWhitelists?.[param];
  }
}
