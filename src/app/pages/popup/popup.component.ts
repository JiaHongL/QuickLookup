import { ChangeDetectionStrategy, Component, Injector, ViewEncapsulation, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray, CdkDragPlaceholder } from '@angular/cdk/drag-drop';

import { MenuItem } from '../../models/menu-item.model';

import { InputSwitchModule } from 'primeng/inputswitch';
import { ButtonModule } from 'primeng/button';
import { SwitchModeDarkButtonComponent } from '../../shared/components/switch-mode-dark-button/switch-mode-dark-button.component';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, CdkDragPlaceholder, InputSwitchModule, FormsModule, ButtonModule , SwitchModeDarkButtonComponent] ,
  template: `
    <div class="popup">
      <div class="tool">
        <button 
          type="button" 
          class="mr-2 flex flex-shrink-0 px-link border-1 border-solid w-2rem h-2rem surface-border border-round surface-card align-items-center justify-content-center transition-all transition-duration-300 hover:border-primary"
          (click)="openOptionsPage()"
        >
          <i 
            class="pi pi-cog" 
          ></i>
        </button>
        <app-switch-mode-dark-button></app-switch-mode-dark-button>
      </div>
      <span class="title">
          {{i18n('title')}}
      </span>
      <div cdkDropList class="drag-list" (cdkDropListDropped)="drop($event)">
        @for (item of dictionaryList(); track item.id;let idx = $index, e = $even) {
          <div cdkDrag class="drag-box">
            <div class="white-space-nowrap overflow-hidden text-overflow-ellipsis" style="width:250px">
              {{ item.name }}
            </div>
            <div>
              <p-inputSwitch [(ngModel)]="item.visible" (ngModelChange)="setList()"></p-inputSwitch>
            </div>
          </div>
        }
      </div>
      <div class="tips">
        <div>
          {{i18n('tip')}}
        </div>
        <div>{{i18n('enable')}}{{enableCount()}}</div>
      </div>
    </div>
  `,
  styleUrls: ['./popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class PopupComponent {

  dictionaryList = signal<MenuItem[]>([]);

  enableCount = computed(() => {
    return this.dictionaryList().filter((item) => item.visible).length;
  });

  isFirstTimeTriggered = true;

  constructor(private injector: Injector) {
    effect(async () => {
      const storage = await chrome.storage.local.get(['dictionaryList']);
      const dictionaryList = storage['dictionaryList'] as MenuItem[];
      this.dictionaryList.set(dictionaryList);
      this.initializeUpdateEffect();
    });
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
    }, { injector: this.injector })
  }

  drop(event: CdkDragDrop<string[]>) {
    let updateList = [...this.dictionaryList()];
    moveItemInArray(updateList, event.previousIndex, event.currentIndex);
    this.dictionaryList.set(updateList);
  }

  setList() {
    this.dictionaryList.set([...this.dictionaryList()]);
  }

  i18n(key: any, params = []) {
    try {
      return chrome.i18n.getMessage(key, params);
    } catch (error) {
      console.log("i18n", error);
      return "";
    }
  };

  openOptionsPage() {
    chrome.runtime.openOptionsPage();
  }

}
