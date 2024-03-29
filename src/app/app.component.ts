import { ChangeDetectionStrategy, Component, Injector, computed, effect, signal } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray, CdkDragPlaceholder } from '@angular/cdk/drag-drop';

import { InputSwitchComponent } from './input-switch/input-switch.component';

interface MenuItem {
  name: string,
  id: string,
  title: string,
  contexts: string[],
  visible: boolean,
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, InputSwitchComponent, CdkDragPlaceholder, JsonPipe],
  template: `
    <div class="popup">
      <span class="title">{{i18n('title')}}</span>
      <div cdkDropList class="drag-list" (cdkDropListDropped)="drop($event)">
        @for (item of dictionaryList(); track item.id;let idx = $index, e = $even) {
          <div cdkDrag class="drag-box">
            <div>
              {{ item.name }}
            </div>
            <div>
              <app-input-switch [(checked)]="item.visible" (checkedChange)="setList()"/>
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
  styles: `
      .popup {
        width: 300px;
        padding: 12px 12px 6px 12px;
      }
      .title{
        font-size: 16px;
        font-weight: bold;
        color: #333;
        display: block;
        margin-bottom: 10px;
        text-align: center;
      }
      .tips{
        margin-top: 6px;
        font-size: 12px;
        color: #999;
        display: flex;
        justify-content: space-between;
      }
      .drag-list {
        width: 500px;
        max-width: 100%;
        border: solid 1px #ccc;
        min-height: 60px;
        display: block;
        background: white;
        border-radius: 4px;
        overflow: hidden;
      }
      .drag-box {
        padding: 15px 10px;
        border-bottom: solid 1px #ccc;
        color: rgba(0, 0, 0, 0.87);
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;
        cursor: move;
        background: white;
        font-size: 14px;
      }
      .cdk-drag-preview {
        box-sizing: border-box;
        border-radius: 4px;
        box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                    0 8px 10px 1px rgba(0, 0, 0, 0.14),
                    0 3px 14px 2px rgba(0, 0, 0, 0.12);
      }
      .cdk-drag-placeholder {
        opacity: 0;
      }
      .cdk-drag-animating {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
      .drag-box:last-child {
        border: none;
      }
      .drag-list.cdk-drop-list-dragging .drag-box:not(.cdk-drag-placeholder) {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
      .drag-custom-placeholder {
        background: #ccc;
        border: dotted 3px #999;
        height: 60px;
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {

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

}