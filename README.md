# ABS Meta

A metadata provider framework for AudioBookShelf that aggregates audiobook and ebook metadata from multiple sources.

## Overview

ABS Meta is a Node.js/TypeScript framework that provides a unified API for searching audiobook and ebook metadata across different providers. It features a plugin-style architecture where providers can be easily added to support new metadata sources with support for caching and authentication.

## Features

- 🔌 **Plugin Architecture**: Extensible provider system for adding new metadata sources
- 🌍 **Multi-language Support**: Search across different countries and languages
- ⚡ **Caching**: Built-in SQLite caching to improve performance and reduce API calls
- 🔍 **Unified Search**: Consistent API across all providers
- 📚 **Rich Metadata**: Returns comprehensive book information including covers, descriptions, and more

## Current Providers

> [!NOTE]
> To view details about each provider, check their respective documentation files.

- **[BookBeat](src/providers/bookbeat/README.md)**: Supports 30 countries/languages
- **[Storytel](src/providers/storytel/ReadMe.md)**: Supports 20+ languages

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This starts the development server with hot reloading on port 8723.

### Production

```bash
npm run build
npm start
```

## Docker

```yaml
services:
  abs-meta:
    image: ghcr.io/vito0912/abs-meta:latest
    ports:
      - "8723:8723"
    volumes:
      - ./data:/app/data
```

## API Endpoints

### List Available Providers

```http
GET /providers
```

Returns information about all available providers, their required parameters, and supported options.

### Search for Books

#### Without Path Parameters

```http
GET /:provider/search?query=<search_term>
```

#### With Path Parameters (e.g., language)

```http
GET /:provider/:language/search?query=<search_term>
```

### Examples

```bash
# Search BookBeat in German
curl "http://localhost:8723/bookbeat/de/search?query=harry+potter"

# Search Storytel in English  
curl "http://localhost:8723/storytel/en/search?query=dune"

# Get list of providers
curl "http://localhost:8723/providers"
```

## Adding New Providers

Want to add support for a new metadata source? Check out our [Provider Development Guide](docs/ADDING_PROVIDERS.md) for detailed instructions on:

- Creating a new provider class
- Implementing the required search methods
- Configuring parameters and validation
- Testing your provider

## Configuration

The application uses the following default configuration:

- **Port**: 8723 (configurable via environment)
- **Cache**: SQLite database in `data/cache.db`

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clean` - Remove compiled files
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Docker Scripts

- `docker build -t abs-meta .` - Build Docker image
- `docker run -p 8723:8723 abs-meta` - Run container
- `docker-compose up -d` - Start with docker-compose
- `docker-compose down` - Stop docker-compose services

## Dependencies

## Health Check

The server provides a health check endpoint:

```http
GET /health
```

Returns:

```json
{
  "status": "ok",
  "timestamp": "2025-06-17T10:30:00.000Z"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

For adding new providers, please follow the [Provider Development Guide](docs/ADDING_PROVIDERS.md).

## License

TBA
