import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { CountriesFilterOptionDTO, CountryDTO } from 'src/app/DTO/CountriesDTO';
import { CountriesService } from 'src/app/services/countries.service';
import { ModalCountryComponent } from './modal-country/modal-country.component';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.css'],
})
export class CountriesComponent implements OnInit, OnDestroy {
  @ViewChild('modalCountry') modalCountry!: ModalCountryComponent;

  continentsList: CountriesFilterOptionDTO[] = [];
  optionsFilterList: CountriesFilterOptionDTO[] = [];

  continents$!: Observable<CountriesFilterOptionDTO[]>;
  allDataContinents: any[] = [];

  currentSelectedOptionFilter: any | CountriesFilterOptionDTO;
  filterText: string = '';
  emptyDataFound: boolean;

  filterInputs!: Subscription;
  private searchFilterText$ = new Subject<string>();

  constructor(private countriesService: CountriesService) {
    this.emptyDataFound = false;
  }

  searchCountry(searchText: string) {
    this.searchFilterText$.next(searchText);
  }

  onChangeFilterList(item: any) {
    this.currentSelectedOptionFilter = item;
    this.filterAllCountries();
  }

  onClickItemFilterList(item: CountriesFilterOptionDTO) {
    this.currentSelectedOptionFilter = item;
  }

  /**
   * Call filterCountries method in countriesService
   * to filter data sending a term to search and the continent selected
   * @param search
   */
  filterAllCountries(search?: string) {
    let searchText = search ? search.trim() : this.filterText.trim();
    this.countriesService.filterCountries(
      searchText,
      this.currentSelectedOptionFilter['id']
    );
  }
  /**
   * Get the length of the list of countries,
   * set true of false when length is 0 to a variable to display
   * the message "Not results found"
   */
  verifyForEmptyData() {
    let dataLength = 0;
    if (this.allDataContinents && this.allDataContinents.length > 0) {
      dataLength = this.allDataContinents.reduce(
        (accumulator, currentEl) =>
          accumulator +
          (currentEl['countries'] ? currentEl['countries'].length : 0),
        0
      );
    }

    this.emptyDataFound = dataLength === 0;
  }

  openModal(country: CountryDTO) {
    let params = {
      filterText: this.filterText.trim(),
      continent: this.currentSelectedOptionFilter['id'],
    };
    this.modalCountry.openModal(country, params);
  }

  onCloseModal(params: any) {
    // console.log('close Modal: ', params);
  }

  ngOnInit(): void {
    this.optionsFilterList = this.countriesService.getAllOptionsFilterList();
    this.currentSelectedOptionFilter = { ...this.optionsFilterList[0] };

    //searchFilterText subscription for input text
    const result = this.searchFilterText$.pipe(
      debounceTime(500),
      distinctUntilChanged()
    );
    this.filterInputs = result.subscribe((input: string) =>
      this.filterAllCountries(input)
    );

    // Observable for the continents data
    this.continents$ = this.countriesService.data().pipe(
      tap((resp) => {
        this.allDataContinents = resp;
        this.verifyForEmptyData();
      })
    );
    this.countriesService.loadAllData();
  }

  ngOnDestroy() {
    this.filterInputs.unsubscribe();
  }

  trackByItems(index: number, item: any): string {
    return item.id;
  }

  @HostListener('window:storage', ['$event'])
  /**
   * Trigger function for localstorage change events
   * update data when a change is made from another browser tab
   * @param e type StorageEvent
   */
  async onStorageChange(e: StorageEvent) {
    if (e.storageArea != localStorage) return;
    if (e.key === 'favoriteCountries' && e.newValue) {
      try {
        let item = JSON.parse(e.newValue);

        let params = {
          filterText: this.filterText.trim(),
          continent: this.currentSelectedOptionFilter['id'],
        };

        await this.countriesService.changeCountryPropertyFavorite(item, params);
        // 'Success update item from localstorage'
      } catch (error) {
        // 'Error: Could not update item from localstorage'
      }
    }
  }
}
