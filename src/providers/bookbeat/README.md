# BookBeat Provider

The BookBeat provider allows you to search for audiobooks from BookBeat's catalog across multiple countries and languages.

## Supported Countries/Languages

The provider supports the following country codes, which correspond to different BookBeat regional catalogs:

| Country Code | Country/Region | Language Name |
| ------------ | -------------- | ------------- |
| `en`         | *English       | English       |
| `at`         | Austria        | German        |
| `be`         | Belgium        | Dutch         |
| `bg`         | Bulgaria       | Bulgarian     |
| `hr`         | Croatia        | Croatian      |
| `cy`         | Cyprus         | Greek         |
| `cz`         | Czech Republic | Czech         |
| `dk`         | Denmark        | Danish        |
| `ee`         | Estonia        | Estonian      |
| `fi`         | Finland        | Finnish       |
| `fr`         | France         | French        |
| `de`         | Germany        | German        |
| `gr`         | Greece         | Greek         |
| `hu`         | Hungary        | Hungarian     |
| `ie`         | Ireland        | English       |
| `it`         | Italy          | Italian       |
| `lv`         | Latvia         | Latvian       |
| `lt`         | Lithuania      | Lithuanian    |
| `lu`         | Luxembourg     | French        |
| `nl`         | Netherlands    | Dutch         |
| `no`         | Norway         | Norwegian     |
| `pl`         | Poland         | Polish        |
| `pt`         | Portugal       | Portuguese    |
| `ro`         | Romania        | Romanian      |
| `sk`         | Slovakia       | Slovak        |
| `si`         | Slovenia       | Slovenian     |
| `es`         | Spain          | Spanish       |
| `se`         | Sweden         | Swedish       |
| `ch`         | Switzerland    | German        |
| `gb`         | United Kingdom | English       |

## Required Parameters

- **language**: The language/country code(s) for the BookBeat catalog to search (required)
  - Single language: `de`, `en`, `fr`, etc.
  - Multiple languages: `de,en`, `de,en,fr`, etc.
