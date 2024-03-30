import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Injector, ViewEncapsulation, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MenuItem } from '../models/menu-item.model';

import Action from './editorDialog/action.emun';

import { ThemeService } from '../theme.service';

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
import { SwitchModeDarkButtonComponent } from '../components/switch-mode-dark-button/switch-mode-dark-button.component';
import { ContextMenuItems } from '../const/context-menu-items.const';
import { SkeletonComponent } from './skeleton/skeleton.component';


@Component({
  selector: 'app-options',
  standalone: true,
  imports: [CommonModule, ButtonModule, SwitchModeDarkButtonComponent, DropdownModule, FormsModule, ToolbarModule, PanelModule, TableModule, InputSwitchModule,DragDropModule,SkeletonComponent],
  providers: [DialogService],
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
              size="small" 
              class="ml-2"
              [(ngModel)]="currentTheme" 
              (ngModelChange)="themeService.switchTheme(currentTheme)" 
              [options]="themeService.themeOptions" 
              optionLabel="name"
              optionValue="code"
              >
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
                    <th>名稱</th>
                    <th>連結</th>
                    <th>操作</th>
                    <th>啟用</th>
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
                <div class="flex flex-wrap align-items-center justify-content-between gap-3">
                    <div class="flex align-items-center gap-2">
                        <p-button 
                          [outlined]="isDarkMode()" 
                          label="恢復系統預設值" 
                          size="small" (click)="reset()"
                        ></p-button>
                    </div>
                    <span class="p-text-secondary">已啟用 / 總筆數： {{enableCount()}} / {{dictionaryList().length}}</span>
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

    const ref = this.dialogService.open(EditorDialogComponent, {
      header: action === Action.Create ? '新增視窗' : '編輯視窗',
      width: '50%',
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
          this.messageService.add({severity:'success', summary:'新增成功', detail:'已新增此設定'});
          break;
        case Action.Update:
          this.dictionaryList.update(todos => todos.map(todo => {
            if (todo.id === id) {
              return { ...todo, ...result.data };
            }
            return todo;
          }));
          this.messageService.add({severity:'success', summary:'更新成功', detail:'已更新此設定'});
          break;
        case Action.Delete:
            this.dictionaryList.set(this.dictionaryList().filter((item) => item.id !== id));
            this.messageService.add({severity:'success', summary:'刪除成功', detail:'已刪除此設定'});
          break;
        default:
          break;
      }
    });
  }

  delete(id:string){
    this.confirmationService.confirm({
      target: document.body,
      message: '確定刪除此設定?',
      header: '提示',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon:"none",
      rejectIcon:"none",
      rejectButtonStyleClass:"p-button-text",
      accept: () => {
        this.dictionaryList.set(this.dictionaryList().filter((item) => item.id !== id));
        this.messageService.add({severity:'success', summary:'刪除成功', detail:'已刪除此設定'});
      },
      reject: () => {},
    });
  }

  reset(){
    this.confirmationService.confirm({
      target: document.body,
      message: '確定恢復系統預設值?',
      header: '提示',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon:"none",
      rejectIcon:"none",
      rejectButtonStyleClass:"p-button-text",
      accept: () => {
        this.dictionaryList.set(this.contextMenuItems);
        this.messageService.add({severity:'success', summary:'執行成功', detail:'已恢復原始設定'});
      },
      reject: () => {},
    });
  }

  onRowReorder(event:any){
    this.dictionaryList.set([...this.dictionaryList()]);
    this.messageService.add({severity:'success', summary:'更新成功', detail:'已更新排序'});
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
