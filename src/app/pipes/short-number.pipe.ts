import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortNumber',
})
export class ShortNumberPipe implements PipeTransform {
  transform(value: number, ...args: unknown[]): unknown {
    if (isNaN(value)) return null;
    if (value === null) return null;
    if (value === 0) return null;
    let abs = Math.abs(value);
    const rounder = Math.pow(10, 1);
    let key = '';

    const powers = [
      { key: 'Q', value: Math.pow(10, 15) },
      { key: 'T', value: Math.pow(10, 12) },
      { key: 'B', value: Math.pow(10, 9) },
      { key: 'M', value: Math.pow(10, 6) },
      { key: 'K', value: 1000 },
    ];

    for (let i = 0; i < powers.length; i++) {
      let reduced = abs / powers[i].value;
      reduced = Math.round(reduced * rounder) / rounder;
      if (reduced >= 1) {
        abs = reduced;
        key = powers[i].key;
        break;
      }
    }
    return abs + key;
  }
}

@NgModule({
  declarations: [ShortNumberPipe],
  exports: [ShortNumberPipe],
})
export class ShortNumberPipeModule {}
