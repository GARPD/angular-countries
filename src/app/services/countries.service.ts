import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  CountriesFilterOptionDTO,
  CountryDTO,
  Region,
} from '../DTO/CountriesDTO';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HandleError } from '../util/handle-error';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  private urlApi = 'https://restcountries.eu/rest/v2/all';
  originalDataAllCountries: any[] = [];
  dataAllCountriesFavorite: any[] = [];

  //List of continents to filter
  continentsList: CountriesFilterOptionDTO[] = [
    { name: 'Africa', id: 'Africa' },
    { name: 'Americas', id: 'Americas' },
    { name: 'Asia', id: 'Asia' },
    { name: 'Europe', id: 'Europe' },
    { name: 'Oceania', id: 'Oceania' },
    { name: 'Polar', id: 'Polar' },
  ];

  optionsFilterList: CountriesFilterOptionDTO[] = [
    { name: 'Show All', id: 'All' },
    { name: 'Favorites', id: 'Favorites' },
  ];

  private _continents = new BehaviorSubject<CountriesFilterOptionDTO[]>([]);
  private dataContinents: any[] = [];
  continents = this._continents.asObservable();

  constructor(
    private httpClient: HttpClient,
    private localStorage: LocalStorageService
  ) {}

  data() {
    return this._continents.asObservable();
  }

  /**
   * Get all countries list http request and pass
   * the data to the BehaviorSubject
   */
  async loadAllData() {
    try {
      await this.getAllCountriesOfFavoriteLocalStorage();
    } catch (e) {}

    let request = this.httpClient.get(this.urlApi);

    const result = request.pipe(
      tap((resp: any) => (this.originalDataAllCountries = [...resp])),
      map((resp: any) => this.getCountriesByContinent(resp)),
      catchError(HandleError.handleError)
    );

    result.subscribe(
      (data) => {
        this.dataContinents = data;
        this._continents.next([...this.dataContinents]);
      },
      (error) => console.log('Error: Could not load continents.')
    );
  }

  /**
   * get countries list using format CountryDTO[]
   * @param countries
   * @returns array list using format CountryDTO[]
   */
  getAllOptionsFilterList(): CountriesFilterOptionDTO[] {
    return [...this.optionsFilterList, ...this.continentsList];
  }

  /**
   * get countries list using format CountryDTO[]
   * @param countries
   * @returns array list using format CountryDTO[]
   */
  private getCountriesByContinent(
    countries: any[]
  ): CountriesFilterOptionDTO[] {
    let countriesDTO = this.getCountriesInFormatCountriesDTO(countries);
    return this.continentsList.map((continent: any) => {
      return {
        ...continent,
        countries: countriesDTO.filter((el: any) => el.region === continent.id),
      };
    });
  }

  /**
   * get countries list using format CountryDTO[]
   * @param countries
   * @returns array list using format CountryDTO[]
   */
  private getCountriesInFormatCountriesDTO(countries: any[]): CountryDTO[] {
    return countries.map((country: any) => {
      let id =
        country['alpha2Code'] + country['alpha3Code'] + country['numericCode'];

      return {
        alpha2Code: country['alpha2Code'],
        alpha3Code: country['alpha3Code'],
        numericCode: country['numericCode'],
        name: country['name'],
        region: country['region'],
        population: country['population'],
        capital: country['capital'],
        currencies: country['currencies'],
        languages: country['languages'],
        borders: country['borders'],
        flag: country['flag'],
        favorite: this.isFavoriteCountry(id),
        id: id,
      } as CountryDTO;
    });
  }

  /**
   * Get country full name by alpha3code
   * @param code
   * @returns country full name
   */
  getCountryNameByAlpha3Code(code: string) {
    let country = this.originalDataAllCountries.find(
      (el) => el.alpha3Code === code
    );
    return country ? country['name'] : code;
  }

  /**
   * Get data with countries filtered by name and favorite
   * @param data Is a data to filter
   * @param filterText Is a search text to find
   * @param continent Is a continent selected to filter
   * @returns All continents with countries filtered
   */
  filterCountries(filterText: string, continent: string) {
    let filteredData: CountriesFilterOptionDTO[] = [];
    let isFavorite = false;
    if (continent) {
      switch (continent) {
        case 'All':
          filteredData = this.dataContinents;
          break;
        case 'Favorites':
          filteredData = this.dataContinents;
          isFavorite = true;
          break;
        default:
          filteredData = this.dataContinents.filter(
            (el) => el.id === continent
          );
          break;
      }

      let _data = filteredData.map((el) => {
        return {
          ...el,
          countries: this.filterCountriesByName(
            el.countries,
            filterText,
            isFavorite
          ),
        };
      });

      this._continents.next([..._data]);
    }
  }

  /**
   * get countries list using format CountryDTO[]
   * @param countries
   * @returns array list using format CountryDTO[]
   */
  filterCountriesByName(items: any, filterText: string, isFavorite: boolean) {
    let field = 'name';
    let fieldFavorite = 'favorite';
    if (items) {
      return items.filter((item: any) => {
        let value: string = field ? item[field] : '';
        let valueFavorite: boolean = fieldFavorite
          ? item[fieldFavorite]
          : false;

        if (value) value = value.toString();

        if (
          value &&
          value.toLowerCase().indexOf(filterText.toLowerCase()) != -1
        ) {
          return isFavorite ? valueFavorite : true;
        }
        return false;
      });
    }
    return [];
  }

  /**
   * Get if country is in favorites
   * find using country id
   * @param id
   * @returns true or false
   */
  isFavoriteCountry(id: string) {
    let country = this.dataAllCountriesFavorite.find((el) => el.id === id);
    return country;
  }

  /**
   * get countries list using format CountryDTO[]
   * @param countries
   * @returns array list using format CountryDTO[]
   */
  async changeCountryPropertyFavorite(item: any, params: any) {
    let continentIdex = this.dataContinents.findIndex(
      (data) => data.id === item['region']
    );
    let countryIdex = this.dataContinents[continentIdex]['countries'].findIndex(
      (el: any) => el['id'] === item['id']
    );

    this.dataContinents[continentIdex]['countries'][countryIdex]['favorite'] =
      item['favorite'];

    this.filterCountries(params.filterText, params.continent);
  }

  /**
   * Save a country in favorites storage Indexedb
   * @param key country id
   * @param item country element
   * @param params current filters
   * @returns a promise
   */
  addCountryToFavoriteLocalStorage(
    key: string,
    item: any,
    params: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.localStorage.addIDB(item, key).then(
        async (resp) => {
          await this.changeCountryPropertyFavorite(item, params);
          resolve(resp);
        },
        (err) => reject(err)
      );
    });
  }

  /**
   * remove country of favorites storage Indexedb
   * @param key country id
   * @param item country element
   * @param params current filters
   * @returns a promise
   */
  removeCountryFromFavoriteLocalStorage(
    key: string,
    item: any,
    params: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.localStorage.removeIDB(item, key).then(
        async (resp) => {
          await this.changeCountryPropertyFavorite(item, params);
          resolve(resp);
        },
        (err) => reject(err)
      );
    });
  }

  /**
   * Get all countries in favorites Indexedb
   * @returns a promise
   */
  async getAllCountriesOfFavoriteLocalStorage(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataAllCountriesFavorite = [];

      this.localStorage.getAllIDB().then(
        (resp) => {
          if (resp) this.dataAllCountriesFavorite = resp;
          resolve(resp);
        },
        (err) => {
          this.dataAllCountriesFavorite = [];
          reject(err);
        }
      );
    });
  }
}
