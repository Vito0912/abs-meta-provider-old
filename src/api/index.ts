import express from 'express';
import { ProviderManager } from '../providers';
import { SearchQuery } from '../types';

export class ApiRouter {
  private router: express.Router;
  private providerManager: ProviderManager;

  constructor(providerManager: ProviderManager) {
    this.router = express.Router();
    this.providerManager = providerManager;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/providers', this.getProviders.bind(this));
    this.router.get('/:provider/params/:param/whitelist', this.getParameterWhitelist.bind(this));
    this.router.get('/:provider/search', this.search.bind(this));
    this.router.get('/:provider/:pathParam/search', this.searchWithPathParam.bind(this));
  }

  private async getProviders(req: express.Request, res: express.Response): Promise<void> {
    const providers = this.providerManager.getAllProviders().map((provider) => ({
      name: provider.getName(),
      requiredParams: provider.getRequiredParams(),
      optionalParams: provider.getOptionalParams(),
      parameterWhitelists: provider.getParameterWhitelists(),
    }));

    res.json({ providers });
  }

  private async getParameterWhitelist(req: express.Request, res: express.Response): Promise<void> {
    try {
      const providerName = req.params.provider;
      const paramName = req.params.param;

      const provider = this.providerManager.getProvider(providerName);
      if (!provider) {
        res.status(404).json({ error: `Provider '${providerName}' not found` });
        return;
      }

      const whitelist = provider.getWhitelistForParameter(paramName);
      if (!whitelist) {
        res.status(404).json({
          error: `No whitelist found for parameter '${paramName}' in provider '${providerName}'`,
        });
        return;
      }

      res.json({
        provider: providerName,
        parameter: paramName,
        allowedValues: whitelist,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }

  private async search(req: express.Request, res: express.Response): Promise<void> {
    try {
      const providerName = req.params.provider;
      const query: SearchQuery = {
        query: req.query.query as string,
        author: req.query.author as string | undefined,
        type: req.query.type as string | undefined,
        isbn: req.query.isbn as string | undefined,
      };

      console.log(`Search request for provider: ${providerName}, query:`, query);

      const provider = this.providerManager.getProvider(providerName);
      if (!provider) {
        console.log(`Provider '${providerName}' not found`);
        res.status(404).json({ error: `Provider '${providerName}' not found` });
        return;
      }

      const results = await provider.searchWithCache(query);
      res.json({ results, provider: providerName });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Search error:`, message);
      res.status(500).json({ error: message });
    }
  }

  private async searchWithPathParam(req: express.Request, res: express.Response): Promise<void> {
    try {
      const providerName = req.params.provider;
      const pathParam = req.params.pathParam;
      const query: SearchQuery = {
        query: req.query.query as string,
        author: req.query.author as string | undefined,
        type: req.query.type as string | undefined,
        isbn: req.query.isbn as string | undefined,
      };

      console.log(`Search with path param for provider: ${providerName}, pathParam: ${pathParam}, query:`, query);

      const provider = this.providerManager.getProvider(providerName);
      if (!provider) {
        console.log(`Provider '${providerName}' not found`);
        res.status(404).json({ error: `Provider '${providerName}' not found` });
        return;
      }

      const requiredParams = provider.getRequiredParams();
      const optionalParams = provider.getOptionalParams();
      const allParams = [...requiredParams, ...optionalParams];
      const pathParams: Record<string, string> = {};

      if (allParams.length === 0) {
        res.status(400).json({
          error: `Provider '${providerName}' does not accept any path parameters`,
        });
        return;
      }

      if (requiredParams.length > 0) {
        pathParams[requiredParams[0]] = pathParam;
      } else if (optionalParams.length > 0) {
        pathParams[optionalParams[0]] = pathParam;
      }

      console.log(`Path params:`, pathParams);
      const results = await provider.searchWithCache(query, pathParams);
      res.json({ results, provider: providerName, pathParams });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Search error:`, message);
      res.status(500).json({ error: message });
    }
  }

  getRouter(): express.Router {
    return this.router;
  }
}
