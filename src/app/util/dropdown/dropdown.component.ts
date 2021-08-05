import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnInit,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css'],
})
export class DropdownComponent implements OnInit {
  @Input() dataList: any[] = [];
  @Output() onChange = new EventEmitter();

  currentSelectedItem: any = null;
  show: boolean = false;

  constructor() {}

  onClickBtnDropdown() {
    this.show = !this.show;
  }

  onClickItem(item: any) {
    this.currentSelectedItem = item;
    this.show = false;
    this.onChange.emit(item);
  }

  ngOnInit(): void {
    this.currentSelectedItem = this.dataList[0];
  }
}

@NgModule({
  declarations: [DropdownComponent],
  imports: [CommonModule],
  exports: [DropdownComponent],
  providers: [],
})
export class DropdownComponentModule {}
