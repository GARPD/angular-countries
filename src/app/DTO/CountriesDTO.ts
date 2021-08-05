export interface CountryDTO {
  id: string;
  alpha2Code: string;
  alpha3Code: string;
  numericCode: string;
  name: string;
  region: Region;
  population: number;
  capital: string;
  currencies: Currency[];
  languages: Language[];
  borders: string[];
  flag: string;
  favorite: boolean;
}

export enum Region {
  Africa = 'Africa',
  Americas = 'Americas',
  Asia = 'Asia',
  Europe = 'Europe',
  Oceania = 'Oceania',
  Polar = 'Polar',
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface Language {
  iso639_1: string;
  iso639_2: string;
  name: string;
  nativeName: string;
}

export interface CountriesFilterOptionDTO {
  id: string;
  name: string;
  countries?: CountryDTO[];
}
