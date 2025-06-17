export interface BookBeatSearchParams {
  query: string;
  languages: string;
}

export interface BookBeatSeries {
  id: number;
  name: string;
  partnumber: number;
}

export interface BookBeatBook {
  id: number;
  title: string;
  description: string;
  image: string;
  author: string;
  shareurl: string;
  grade: number;
  language: string;
  audiobookisbn: string | null;
  ebookisbn: string | null;
  published: string;
  contenttypetags: string[];
  audiobooksinglesale: any;
  ebooksinglesale: any;
  series: BookBeatSeries | null;
  _links: {
    self: {
      href: string;
      method: string;
    };
    nextcontent: {
      href: string;
      method: string;
    };
  };
  topbadges: any[];
  _embedded: {
    contributors: Array<{
      id: number;
      displayname: string;
      role: string;
      booksurl: string;
    }>;
  };
}

export interface BookBeatSearchResponse {
  iscapped: boolean;
  count: number;
  sort: {
    sortby: string;
    sortorder: string;
  };
  filter: {
    titles: string[];
    languages: string[];
    authors: string[];
    narrators: string[];
    translators: string[];
    formats: string[];
    series: string[];
    categories: string[];
    contenttypetags: string[];
    badgeids: string[];
    bookids: string[];
    iskid: boolean;
    includeerotic: boolean;
  };
  explanations: any[];
  filteroptions: string[];
  _links: {
    self: {
      href: string;
      method: string;
    };
    sort: Array<{
      href: string;
      method: string;
      title: string;
    }>;
  };
  _embedded: {
    books: BookBeatBook[];
  };
}
