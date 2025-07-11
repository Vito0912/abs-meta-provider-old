# ABS Meta

A metadata provider framework for Audiobookshelf that aggregates audiobook and ebook metadata from multiple sources.

## Overview

ABS Meta is a Node.js/TypeScript framework that provides a unified API for searching audiobook and ebook metadata across different providers.

## Current Providers

> [!NOTE]
> To view details about each provider, check their respective documentation files.

- **[BookBeat](src/providers/bookbeat/README.md)**: Supports 30 countries/languages
- **[Storytel](src/providers/storytel/README.md)**: Supports 20+ languages

## Quick Start

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
  `

## License

TBA
