import express from 'express';
import { ProviderManager } from './providers';
import { ApiRouter } from './api';
import path from 'path';
import fs from 'fs';

class App {
  private app: express.Application;
  private providerManager: ProviderManager;
  private apiRouter: ApiRouter;

  constructor() {
    this.app = express();
    this.providerManager = new ProviderManager();
    this.apiRouter = new ApiRouter(this.providerManager);
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use((req, res, next) => {
      console.log(
        `${req.method} ${req.path}${req.query ? '?' + new URLSearchParams(req.query as any).toString() : ''}`
      );
      next();
    });
  }

  private setupRoutes(): void {
    this.app.use('', this.apiRouter.getRouter());

    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  private ensureDataDirectory(): void {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  async start(port: number = 3000): Promise<void> {
    this.ensureDataDirectory();
    await this.providerManager.loadProviders();

    this.app.listen(port, () => {
      console.log(`ABS Meta server running on port ${port}`);
      console.log(`Available providers: ${this.providerManager.getProviderNames().join(', ')}`);
    });
  }
}

if (require.main === module) {
  const app = new App();
  app.start().catch(console.error);
}

export default App;
