import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MenuItem } from '../../../models/menu-item.model';
import Action from './action.emun';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ThemeService } from '../../../service/theme.service';
import { CommonOptionService } from '../../../service/common-option.service';

import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { AutoFocusModule } from 'primeng/autofocus';
import { I18nPipe } from '../../../shared/pipes/i18n.pipe';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
  selector: 'app-editor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    FormsModule,
    InputSwitchModule,
    ButtonModule,
    AutoFocusModule,
    I18nPipe,
    InputNumberModule,
    DropdownModule,
    InputTextareaModule
  ],
  providers:[I18nPipe],
  template: `
    <div>
      <label for="name" class="text-900 font-medium">
        {{ 'options_name' | i18n }}
      </label>
      <input
        #name="ngModel"
        required
        [(ngModel)]="data.name"
        id="name" 
        type="text" 
        [placeholder]="'options_name'|i18n" 
        pInputText 
        class="w-full mb-3 mt-1"
        pAutoFocus 
        [autofocus]="true" 
      >

      <label for="url" class="text-900 font-medium mb-2">
        {{ 'options_url' | i18n }}
      </label>
      <textarea
        id="url"   
        #url="ngModel"
        pInputTextarea 
        [(ngModel)]="data.url"
        required
        class="w-full mb-1 mb-3 mt-1"
        rows="5" 
        cols="30"
        [placeholder]="'options_url'|i18n" 
      ></textarea>

      <div class="flex mb-3 gap-2" >
        <div>
          <label for="openingMethod" class="text-900 font-medium">
              {{ 'options_opening_method' | i18n }}
          </label>
          <div>
            <p-dropdown 
              #openingMethod="ngModel" 
              id="openingMethod" 
              [required]="true" 
              [style]="{width:'150px'}" 
              appendTo="body" 
              [options]="openingMethodOptions" 
              [(ngModel)]="data.openingMethod" 
              optionLabel="name" 
              optionValue="code" 
              [showClear]="false" 
              placeholder="Select..."
            ></p-dropdown>
          </div>
        </div>
        <div>
          <label for="width" class="text-900 font-medium">
            {{ 'options_popup_width' | i18n }}
          </label>
          <div>
            <p-inputNumber 
              #width="ngModel" 
              id="width"
              [required]="true"  
              [(ngModel)]="data.width" 
              [useGrouping]="false"
              [disabled]="openingMethod.value !== 'popup'"
            ></p-inputNumber>
          </div>
        </div>
        <div>
          <label for="height" class="text-900 font-medium mb-2">
            {{ 'options_popup_height' | i18n }}
          </label>
          <div>
            <p-inputNumber 
              #height="ngModel" 
              id="height" 
              [required]="true" 
              [(ngModel)]="data.height" 
              [useGrouping]="false"
              [disabled]="openingMethod.value !== 'popup'"
            ></p-inputNumber>
          </div>
        </div>

      </div>

      <div class="flex align-items-center">
        <label for="enable" class="text-900 font-medium mb-2 mr-2">
          {{ 'options_enable' | i18n }}
        </label>
        <p-inputSwitch name="enable" [(ngModel)]="data.visible"></p-inputSwitch>
      </div>

      <div class="flex justify-content-center align-items-center gap-2 mt-2 relative">
        <p-button
          [outlined]="isDarkMode()" 
          [disabled]="
            !!name.invalid || 
            !!url.invalid ||
            !!openingMethod.invalid ||
            !!width.invalid ||
            !!height.invalid
          " 
          [label]="'common_dialog_send'|i18n" 
          (click)="send()"
        ></p-button>
        <p-button 
          [outlined]="isDarkMode()"
          [label]="'common_dialog_cancel'|i18n" 
          severity="warning" 
          (click)="cancel()"
        ></p-button>
        @if(config.data.action === action.Update) {
          <p-button 
            [outlined]="isDarkMode()" 
            [label]="'common_dialog_delete'|i18n" 
            severity="danger" 
            class="absolute right-0" 
            (click)="delete()"
          ></p-button>
        }
      </div>
    </div>
  `,
  styleUrl: './editorDialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorDialogComponent {

  themeService = inject(ThemeService);
  isDarkMode = computed(() => {
    return this.themeService.currentDarkMode() === 'y';
  });

  openingMethodOptions = inject(CommonOptionService).openingMethodOptions;

  ref = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);
  data = this.config.data.data as MenuItem;
  action = Action;
  confirmationService = inject(ConfirmationService);
  i18n = inject(I18nPipe);

  send(){
    this.ref.close({
      action: this.config.data.action,
      data: this.data
    });
  }

  cancel(){
    this.ref.close();
  }

  delete(){
    this.confirmationService.confirm({
      target: document.body,
      message: this.i18n.transform('options_delete_confirm'),
      header: this.i18n.transform('common_dialog_tip'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon:"none",
      rejectIcon:"none",
      rejectButtonStyleClass:"p-button-text",
      accept: () => {
        this.ref.close({
          action: Action.Delete,
          data: this.data
        });
      },
      reject: () => {},
    });
  }

}
