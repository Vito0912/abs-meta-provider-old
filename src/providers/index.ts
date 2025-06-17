import { BaseProvider } from './base';

export class ProviderManager {
  private providers: Map<string, BaseProvider> = new Map();

  register(provider: BaseProvider): void {
    this.providers.set(provider.getName(), provider);
  }

  getProvider(name: string): BaseProvider | undefined {
    return this.providers.get(name);
  }

  getAllProviders(): BaseProvider[] {
    return Array.from(this.providers.values());
  }

  getProviderNames(): string[] {
    return Array.from(this.providers.keys());
  }

  async loadProviders(): Promise<void> {
    try {
      const { StorytelProvider } = await import('./storytel');
      this.register(new StorytelProvider());

      const { BookBeatProvider } = await import('./bookbeat');
      this.register(new BookBeatProvider());
    } catch (error) {
      console.error('Error loading providers:', error);
    }
  }
}
