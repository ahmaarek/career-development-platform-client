import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'endsWith'
})
export class EndsWithPipe implements PipeTransform {
  transform(value: string | null | undefined, suffix: string): boolean {
    if (!value || !suffix) return false;
    return value.toLowerCase().endsWith(suffix.toLowerCase());
  }
}
