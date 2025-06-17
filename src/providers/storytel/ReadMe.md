# Storytel Provider

The Storytel provider allows you to search for audiobooks and ebooks from Storytel's catalog across multiple countries and languages.

## Supported Countries/Languages

The provider supports the following language codes, which correspond to different Storytel regional catalogs:

| Language Code | Country/Region           | Language Name |
| ------------- | ------------------------ | ------------- |
| `en`          | English-speaking regions | English       |
| `sv`          | Sweden                   | Swedish       |
| `no`          | Norway                   | Norwegian     |
| `dk`          | Denmark                  | Danish        |
| `fi`          | Finland                  | Finnish       |
| `is`          | Iceland                  | Icelandic     |
| `de`          | Germany/Austria          | German        |
| `es`          | Spain                    | Spanish       |
| `fr`          | France                   | French        |
| `it`          | Italy                    | Italian       |
| `pl`          | Poland                   | Polish        |
| `nl`          | Netherlands              | Dutch         |
| `pt`          | Portugal/Brazil          | Portuguese    |
| `bg`          | Bulgaria                 | Bulgarian     |
| `tr`          | Turkey                   | Turkish       |
| `ru`          | Russia                   | Russian       |
| `ar`          | Arabic-speaking regions  | Arabic        |
| `hi`          | India                    | Hindi         |
| `id`          | Indonesia                | Indonesian    |
| `th`          | Thailand                 | Thai          |

## Required Parameters

- **language**: The language/country code for the Storytel catalog to search (required)

## What the Provider Returns

The Storytel provider returns detailed book metadata with the following fields:

- title
- subtitle
- author
- language
- description
- publisher
- publishedYear
- isbn
- genres
- series
- duration
- narrator
- cover

## Usage Example

`/storytel/de/search?query=harry+potter`
