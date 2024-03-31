import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'i18n',
  standalone: true,
})
export class I18nPipe implements PipeTransform {

  transform(key: string, ...params: any[]): string {
    try {
      return chrome.i18n.getMessage(key, params);
    } catch (error) {
      console.log("i18n", error);
      return "";
    }
  }

}
