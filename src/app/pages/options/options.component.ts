import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Injector, ViewEncapsulation, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MenuItem } from '../../models/menu-item.model';

import Action from './editorDialog/action.emun';
import { ContextMenuItems } from '../../const/context-menu-items.const';

import { ThemeService } from '../../theme.service';

import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { DragDropModule } from 'primeng/dragdrop';
import { InputSwitchModule } from 'primeng/inputswitch';

import { EditorDialogComponent } from './editorDialog/editorDialog.component';
import { SwitchModeDarkButtonComponent } from '../../shared/components/switch-mode-dark-button/switch-mode-dark-button.component';
import { SkeletonComponent } from './skeleton/skeleton.component';
import { I18nPipe } from '../../shared/pipes/i18n.pipe';
import { BuyMeACoffeeComponent } from '../../shared/components/buy-me-a-coffee/buy-me-a-coffee.component';

@Component({
  selector: 'app-options',
  standalone: true,
  imports: [
      CommonModule,
      FormsModule, 
      ButtonModule, 
      SwitchModeDarkButtonComponent, 
      DropdownModule,
      ToolbarModule, 
      PanelModule, 
      TableModule, 
      InputSwitchModule,
      DragDropModule,
      SkeletonComponent,
      I18nPipe,
      BuyMeACoffeeComponent
  ],
  providers: [
    DialogService,
    I18nPipe
  ],
  template: `
    @if(isLoading()){
      <div class="wrapper">
        <app-skeleton />
      </div>
    }
    @else {
      <div class="wrapper">
        <p-panel>
          <ng-template pTemplate="header">
            <app-switch-mode-dark-button></app-switch-mode-dark-button>
            <p-dropdown
              class="ml-2"
              [options]="themeService.themeGroup" 
              [(ngModel)]="currentTheme"
              (ngModelChange)="themeService.switchTheme(currentTheme)"  
              placeholder="Select a Theme" 
              [group]="true"
              optionLabel="name"
              optionValue="code"
              [style]="{width: '220px'}"
            >
                <ng-template let-group pTemplate="group">
                    <div class="flex font-bold align-items-center">
                        <span>{{ group.label }}</span>
                    </div>
                </ng-template>
            </p-dropdown>
          </ng-template>

          <ng-template pTemplate="icons">
            <p-button 
              [outlined]="isDarkMode()"
              icon="pi pi-plus" 
              class="p-button-text mr-2"
              severity="info" 
              (click)="openDialog(action.Create)"
            ></p-button>
          </ng-template>

          <p-table
            (onRowReorder)="onRowReorder($event)"
            [reorderableColumns]="true" 
            [scrollable]="true" 
            scrollHeight="480px" 
            styleClass="p-datatable-striped p-datatable-sm" 
            [tableStyle]="{ 'min-width': '50rem' }"
            [value]="dictionaryList()" 
          >
            <ng-template pTemplate="header">
                <tr>
                    <th></th>
                    <th>#</th>
                    <th>{{ 'options_title' | i18n }}</th>
                    <th>{{ 'options_url' | i18n }}</th>
                    <th>{{ 'options_operate' | i18n }}</th>
                    <th>{{ 'options_enable' | i18n }}</th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-item let-index="rowIndex">
                <tr 
                  [pReorderableRow]="index"
                >
                    <td>
                        <span 
                          class="pi pi-bars mx-2" 
                          pReorderableRowHandle 
                        ></span>
                    </td>
                    <td>{{ index + 1}}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.url }}</td>
                    <td>
                      <p-button
                        [outlined]="isDarkMode()" 
                        icon="pi pi-pencil" 
                        class="p-button-text mr-2"
                        severity="help"
                        (click)="openDialog(action.Update , item)"
                      ></p-button>
                      <p-button 
                        [outlined]="isDarkMode()"
                        icon="pi pi-trash" 
                        class="p-button-text" 
                        severity="danger"
                        (click)="delete(item.id)"
                      ></p-button>
                    </td>
                    <td>
                      <p-inputSwitch [(ngModel)]="item.visible" (ngModelChange)="setList()"></p-inputSwitch>
                    </td>
                </tr>
            </ng-template>
          </p-table>

          <ng-template pTemplate="footer">
              <div class="flex flex-wrap align-items-center justify-content-between gap-3 relative">
                <div class="flex align-items-center">
                    <p-button
                      class="mr-2"
                      [outlined]="isDarkMode()" 
                      [label]="'options_reset_button'|i18n" 
                      size="small" 
                      (click)="reset()"
                    ></p-button>
                </div>
                <span class="p-text-secondary"> {{ 'options_enabled' | i18n }} / {{ 'options_total' | i18n }}： {{enableCount()}} / {{dictionaryList().length}}</span>
                <div class="flex justify-content-center absolute" style="right:-14px;bottom:-62px">
                  <app-buy-me-a-coffee/>
                </div>  
              </div>
            </ng-template>
        </p-panel>
      </div>
    }
  `,
  styleUrl: './options.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class OptionsComponent {

  isLoading = signal(true);

  themeService = inject(ThemeService);
  confirmationService = inject(ConfirmationService);
  dialogService = inject(DialogService);
  messageService = inject(MessageService);
  i18n = inject(I18nPipe);
  operateSuccessWord = this.i18n.transform('common_operate_success');

  contextMenuItems = ContextMenuItems;

  currentTheme = this.themeService.currentTheme() as string;

  isDarkMode = computed(() => {
    return this.themeService.currentDarkMode() === 'y';
  });

  isFirstTimeTriggered = true;

  action = Action;

  dictionaryList = signal<MenuItem[]>([]);

  disableCount = computed(() => {
    return this.dictionaryList().filter((item: MenuItem) => !item.visible).length;
  });

  enableCount = computed(() => {
    return this.dictionaryList().filter((item: MenuItem) => item.visible).length;
  });

  constructor(private injector: Injector) {
    effect(async () => {
      const storage = await chrome.storage.local.get(['dictionaryList']);
      const dictionaryList = storage['dictionaryList'] as MenuItem[];
      this.dictionaryList.set(dictionaryList);
      this.initializeUpdateEffect();
    });
    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }

  initializeUpdateEffect() {
    effect(() => {
      const updateDictionaryList = this.dictionaryList();
      if (this.isFirstTimeTriggered) {
        this.isFirstTimeTriggered = false;
        return;
      }
      chrome.storage.local.set({ dictionaryList: updateDictionaryList });
      chrome.runtime.sendMessage({
        action: "updateContextMenu",
        data: updateDictionaryList
      });
    }, { 
      injector: this.injector 
    });
  }

  openDialog(action: Action = Action.Create, item?: MenuItem ) {

    let data  = item;

    if(action === Action.Create){
      data = {
        id: this.generateGUID(),
        name: "",
        url: "",
        title: "Search '%s' in",
        contexts: ["selection"],
        visible: true,
      }
    };

    const header = action === Action.Create ? this.i18n.transform('options_add_dialog') : this.i18n.transform('options_edit_dialog');
    console.log(header);
    const ref = this.dialogService.open(EditorDialogComponent, {
      header,
      width: '50%',
      dismissableMask: true,
      data: {
        data,
        action: action 
      }
    });
    ref.onClose.subscribe((result:{
      action: Action,
      data: MenuItem
    }) => {

      if(!result){return;}

      let id = result.data.id;

      switch (result.action) {
        case Action.Create:
          this.dictionaryList.set([...this.dictionaryList(), result.data]);
          this.messageService.add({
            severity:'success', 
            summary: this.operateSuccessWord, 
            detail: this.i18n.transform('options_add_success')
          });
          break;
        case Action.Update:
          this.dictionaryList.update(todos => todos.map(todo => {
            if (todo.id === id) {
              return { ...todo, ...result.data };
            }
            return todo;
          }));
          this.messageService.add({
            severity:'success', 
            summary: this.operateSuccessWord, 
            detail: this.i18n.transform('options_update_success')
          });
          break;
        case Action.Delete:
            this.dictionaryList.set(this.dictionaryList().filter((item) => item.id !== id));
            this.messageService.add({
              severity:'success', 
              summary:this.operateSuccessWord, 
              detail: this.i18n.transform('options_delete_success')
            });
          break;
        default:
          break;
      }
    });
  }

  delete(id:string){
    this.confirmationService.confirm({
      target: document.body,
      message: this.i18n.transform('options_delete_confirm'),
      header: this.i18n.transform('common_dialog_tip'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon:"none",
      rejectIcon:"none",
      rejectButtonStyleClass:"p-button-text",
      dismissableMask: true,
      accept: () => {
        this.dictionaryList.set(this.dictionaryList().filter((item) => item.id !== id));
        this.messageService.add({
          severity:'success', 
          summary: this.operateSuccessWord, 
          detail: this.i18n.transform('options_delete_success')
        });
      },
      reject: () => {},
    });
  }

  reset(){
    this.confirmationService.confirm({
      target: document.body,
      message: this.i18n.transform('options_reset_confirm'),
      header: this.i18n.transform('common_dialog_tip'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon:"none",
      rejectIcon:"none",
      rejectButtonStyleClass:"p-button-text",
      accept: () => {
        this.dictionaryList.set(this.contextMenuItems);
        this.messageService.add({
          severity: 'success', 
          summary: this.operateSuccessWord, 
          detail: this.i18n.transform('options_reset_success')
      });
      },
      reject: () => {},
    });
  }

  onRowReorder(event:any){
    this.dictionaryList.set([...this.dictionaryList()]);
    this.messageService.add({
        severity:'success', 
        summary: this.operateSuccessWord, 
        detail: this.i18n.transform('options_order_updated')
    });
  }

  setList() {
    this.dictionaryList.set([...this.dictionaryList()]);
  }

  private generateGUID() {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    const timestamp = new Date().getTime();
    const timeString = timestamp.toString(16);
    return timeString + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4();
  }

}
