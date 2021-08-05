import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CountriesComponent } from './countries.component';
import { FormsModule } from '@angular/forms';
import { DropdownComponentModule } from 'src/app/util/dropdown/dropdown.component';
import { ModalCountryComponent } from './modal-country/modal-country.component';
import { ShortNumberPipeModule } from 'src/app/pipes/short-number.pipe';

const routes: Routes = [
  {
    path: '',
    component: CountriesComponent,
  },
];

@NgModule({
  declarations: [CountriesComponent, ModalCountryComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    DropdownComponentModule,
    ShortNumberPipeModule,
  ],
})
export class CountriesModule {}
