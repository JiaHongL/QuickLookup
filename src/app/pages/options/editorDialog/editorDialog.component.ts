import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MenuItem } from '../../../models/menu-item.model';
import Action from './action.emun';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { AutoFocusModule } from 'primeng/autofocus';

import { I18nPipe } from '../../../shared/pipes/i18n.pipe';


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
    I18nPipe
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
      <input
        #url="ngModel"
        required
        [(ngModel)]="data.url" 
        id="url" 
        type="text" 
        [placeholder]="'options_url'|i18n" 
        pInputText 
        class="w-full mb-1 mb-3 mt-1"
      >

      <div class="flex align-items-center">
        <label for="enable" class="text-900 font-medium mb-2 mr-2">
          {{ 'options_enable' | i18n }}
        </label>
        <p-inputSwitch name="enable" [(ngModel)]="data.visible"></p-inputSwitch>
      </div>

      <div class="flex justify-content-center align-items-center gap-2 mt-2 relative">
        <p-button [disabled]="!!name.invalid || !!url.invalid" [label]="'common_dialog_send'|i18n" (click)="send()"></p-button>
        <p-button [label]="'common_dialog_cancel'|i18n" severity="warning" (click)="cancel()"></p-button>
        @if(config.data.action === action.Update) {
          <p-button [label]="'common_dialog_delete'|i18n" severity="danger" class="absolute right-0" (click)="delete()"></p-button>
        }
      </div>
    </div>
  `,
  styleUrl: './editorDialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorDialogComponent {
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
