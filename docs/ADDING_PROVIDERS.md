# Adding New Providers

This guide explains how to add new metadata providers to the abs-meta framework.

## Creating a New Provider

1. **Create the provider directory**:

   ```bash
   src/providers/your-provider-name/index.ts
   ```

2. **Implement the provider class**:

   ```typescript
   import { BaseProvider } from '../base';
   import { BookMetadata, SearchQuery, ProviderConfig } from '../../types';
   import axios from 'axios';

   export class YourProviderProvider extends BaseProvider {
     constructor() {
       const config: ProviderConfig = {
         name: 'your-provider-name',
         baseUrl: 'https://api.yourprovider.com',
         requiredParams: ['language'],
         optionalParams: ['region'],
       };
       super(config);
     }

     async search(query: SearchQuery, pathParams?: Record<string, string>): Promise<BookMetadata[]> {}
   }
   ```

3. **Register the provider** in `src/providers/index.ts`:

   ```typescript
   async loadProviders(): Promise<void> {
     try {
       const { StorytelProvider } = await import('./storytel');
       const { YourProviderProvider } = await import('./your-provider-name');

       this.register(new StorytelProvider());
       this.register(new YourProviderProvider());
     } catch (error) {
       console.error('Error loading providers:', error);
     }
   }
   ```

## Provider Configuration

### Required Parameters

These parameters must be provided in the URL path:

- `requiredParams: ['language']` means `/api/yourprovider/en/search`
- Multiple required params: `['language', 'region']` means `/api/yourprovider/en/us/search`

### Optional Parameters

These can be provided as query parameters or path parameters.

### Cache TTL

Set the cache time-to-live in seconds. Default is 3600 (1 hour).

## API Response Format

Your provider must return an array of `BookMetadata` objects:

```typescript
interface BookMetadata {
  title: string; // Required
  subtitle?: string;
  author?: string;
  narrator?: string;
  publisher?: string;
  publishedYear?: string;
  description?: string;
  cover?: string; // URL to cover image
  isbn?: string;
  asin?: string;
  genres?: string[];
  tags?: string[];
  series?: SeriesMetadata[];
  language?: string;
  duration?: number; // Duration in seconds
}
```

## Error Handling

Always wrap your API calls in try-catch blocks and return an empty array on error:

```typescript
try {
  const response = await axios.get(searchUrl);
  return this.transformResponse(response.data);
} catch (error) {
  console.error(`Error searching ${this.config.name}:`, error);
  return [];
}
```

## Testing Your Provider

1. Start the development server: `npm run dev`
2. Test the provider endpoints:
   - `GET /api/providers` - Should list your provider
   - `GET /api/your-provider-name/search?query=test`
   - `GET /api/your-provider-name/en/search?query=test` (if language is required)

## Example Providers

- **Storytel**: Requires language parameter, searches audiobooks

Check the existing providers for implementation examples.
