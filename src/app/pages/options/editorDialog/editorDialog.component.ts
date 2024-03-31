import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MenuItem } from '../../../models/menu-item.model';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { AutoFocusModule } from 'primeng/autofocus';

import Action from './action.emun';

@Component({
  selector: 'app-editor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    FormsModule,
    InputSwitchModule,
    ButtonModule,
    AutoFocusModule
  ],
  template: `
    <div>
      <label for="name" class="text-900 font-medium">名稱</label>
      <input
        #name="ngModel"
        required
        [(ngModel)]="data.name"
        id="name" 
        type="text" 
        placeholder="名稱" 
        pInputText 
        class="w-full mb-3 mt-1"
        pAutoFocus 
        [autofocus]="true" 
      >

      <label for="url" class="text-900 font-medium mb-2">連結</label>
      <input
        #url="ngModel"
        required
        [(ngModel)]="data.url" 
        id="url" 
        type="text" 
        placeholder="連結" 
        pInputText 
        class="w-full mb-1 mb-3 mt-1"
      >

      <div class="flex align-items-center">
        <label for="enable" class="text-900 font-medium mb-2 mr-2">是否啟用</label>
        <p-inputSwitch name="enable" [(ngModel)]="data.visible"></p-inputSwitch>
      </div>

      <div class="flex justify-content-center align-items-center gap-2 mt-2 relative">
        <p-button [disabled]="!!name.invalid || !!url.invalid" label="送出" (click)="send()"></p-button>
        <p-button label="取消" severity="warning" (click)="cancel()"></p-button>
        <p-button label="刪除" severity="danger" class="absolute right-0" (click)="delete()"></p-button>
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
  confirmationService = inject(ConfirmationService);

  constructor() {
    effect(() => {
      console.log('EditorDialogComponent', this.ref, this.config);
      console.log('EditorDialogComponent', this.data);
    });
  }

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
      message: '確定刪除此設定?',
      header: '提示',
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
