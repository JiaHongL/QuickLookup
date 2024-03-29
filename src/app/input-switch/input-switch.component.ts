import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, model } from '@angular/core';
import { UniqueIdService } from './unique-id.service';

@Component({
  selector: 'app-input-switch',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `
    <div class="switch">
      <input [id]="uniqueId" class="input" type="checkbox" (change)="toggle()"  [checked]="checked()"/>
      <label [for]="uniqueId" class="slider"></label>
    </div>
  `,
  styleUrls: ['./input-switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputSwitchComponent {
  checked = model(false);
  uniqueId = inject(UniqueIdService).generateUniqueId('input-switch');
  toggle() {
    this.checked.set(!this.checked());
  }
}
