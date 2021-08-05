import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { CountryDTO } from 'src/app/DTO/CountriesDTO';
import { ShortNumberPipe } from 'src/app/pipes/short-number.pipe';
import { CountriesService } from 'src/app/services/countries.service';

@Component({
  selector: 'modal-country',
  templateUrl: './modal-country.component.html',
  styleUrls: ['./modal-country.component.css'],
  providers: [ShortNumberPipe],
  encapsulation: ViewEncapsulation.None,
})
export class ModalCountryComponent implements OnInit, OnDestroy {
  private element: any;

  currentSelectedOptionFilter: string = '';
  filterText: string = '';
  originalCountry?: CountryDTO;
  country: any = {};
  isFavorite: boolean = false;
  isFavoriteChanged: boolean = false;
  displayProperty: string = 'none';

  @Output() close = new EventEmitter();

  constructor(
    private el: ElementRef,
    private countriesService: CountriesService
  ) {
    this.country = null;
    this.element = el.nativeElement;
  }

  openModal(
    data: CountryDTO,
    params: { filterText: string; continent: string }
  ) {
    if (!data) return; //'You need select a country!';

    this.filterText = params.filterText;
    this.currentSelectedOptionFilter = params.continent;

    this.originalCountry = { ...data };
    this.country = {
      ...data,
      currency: data.currencies ? data.currencies[0]['name'] : '',
      language: data.languages ? data.languages[0]['name'] : '',
    };

    // get border countries (full name)
    this.country['bordersName'] = data.borders
      ? this.getBorderWithFullName(data.borders)
      : '';

    // display mode flex to modal and
    // add country-modal-open class to body
    this.displayProperty = 'flex';
    document.body.classList.add('country-modal-open');
  }

  closeModal() {
    let params = {
      item: this.country,
      statusChanged:
        this.originalCountry?.favorite !== this.country['favorite'],
    };

    /**
     * When the  country property 'favorite' changed
     * call addCountryToFavorite method to add to favorites or
     * removeCountryFromFavorite method to remove from favorites
     */
    if (params.item && params.statusChanged) {
      if (params.item.favorite) {
        this.addCountryToFavorite(params.item);
      } else {
        this.removeCountryFromFavorite(params.item);
      }
    } else {
      this.removeModal();
    }
  }

  removeModal() {
    this.displayProperty = 'none';
    document.body.classList.remove('country-modal-open');
    let params = {
      item: this.country,
      statusChanged:
        this.originalCountry?.favorite !== this.country['favorite'],
    };
    this.close.emit(params);
  }

  /**
   * Call addCountryToFavoriteLocalStorage method in countriesService
   * to add country to favorites storage, sending a term to search
   * and the continent selected.
   * @param item
   */
  addCountryToFavorite(item: any) {
    if (!item || !item.id) return; //'error: Not country found';

    let params = {
      filterText: this.filterText.trim(),
      continent: this.currentSelectedOptionFilter,
    };

    this.countriesService
      .addCountryToFavoriteLocalStorage(item['id'], item, params)
      .then(
        (resp) => {
          // 'add to favorites success!';
          this.removeModal();
        },
        (err) => {
          this.removeModal();
        }
      );
  }

  /**
   * Call removeCountryFromFavoriteLocalStorage method in countriesService
   * to remove country from favorites storage, sending a term to search
   * and the continent selected.
   * @param item
   */
  removeCountryFromFavorite(item: any) {
    if (!item || !item.id) return; //'error: Not country found';

    let params = {
      filterText: this.filterText.trim(),
      continent: this.currentSelectedOptionFilter,
    };

    this.countriesService
      .removeCountryFromFavoriteLocalStorage(item['id'], item, params)
      .then(
        (resp) => {
          // 'remove from favorites success!';
          this.removeModal();
        },
        (err) => {
          this.removeModal();
        }
      );
  }

  /**
   * Get a string of border countries (full name)
   * @param data border country string array list
   * @return return a string with border countries (full name) separated by ', '
   */
  getBorderWithFullName(data: string[]) {
    let _data = data.map((code) =>
      this.countriesService.getCountryNameByAlpha3Code(code)
    );
    return _data.length > 0 ? _data.join(', ') : '';
  }

  onClickFavoriteIcon() {
    this.country['favorite'] = !this.country['favorite'];
  }

  ngOnInit(): void {
    document.body.appendChild(this.element);

    // close modal on background click
    this.element.addEventListener('click', (el: any) => {
      if (el.target.className === 'country-modal') {
        this.closeModal();
      }
    });
  }

  ngOnDestroy(): void {
    this.element.remove();
  }
}
