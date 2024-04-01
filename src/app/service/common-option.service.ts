import { Injectable } from '@angular/core';
import { inject } from "@angular/core";
import { I18nPipe } from '../shared/pipes/i18n.pipe';

@Injectable({
  providedIn: 'root',
})
export class CommonOptionService {

  i18n = new I18nPipe();

  openingMethodOptions = [
    { name: this.i18n.transform('opening_method_popup'), code: 'popup' },
    { name: this.i18n.transform('opening_method_new_tab'), code: 'tab' },
    { name: this.i18n.transform('opening_method_new_window'), code: 'window' }
  ];

}
