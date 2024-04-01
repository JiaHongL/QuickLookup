import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { I18nPipe } from '../../../shared/pipes/i18n.pipe';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonModule,
    TableModule,
    I18nPipe
  ],
  template: `
    <div class="border-round border-1 surface-border p-4 surface-card" style="width:1200px;height:645px;">
        <div class="flex justify-content-between align-items-center mb-3">
            <div class="flex align-items-center"> 
              <p-skeleton size="2.5rem" styleClass="mr-2"></p-skeleton>
              <p-skeleton width="14rem" height="3rem"></p-skeleton>
            </div>
            <div>
              <p-skeleton size="3rem" styleClass="mr-2"></p-skeleton>
            </div>
        </div>
        <p-table [value]="fakeDate" [tableStyle]="{ 'min-width': '50rem' }">
          <ng-template pTemplate="header">
            <tr>
              <th></th>
              <th>#</th>
              <th>{{ 'options_name' | i18n }}</th>
              <th>{{ 'options_url' | i18n }}</th>
              <th>{{ 'options_opening_method' | i18n }}</th>
              <th>{{ 'options_popup_width' | i18n }}</th>
              <th>{{ 'options_popup_height' | i18n }}</th>
              <th class="text-center">{{ 'options_operate' | i18n }}</th>
              <th>{{ 'options_enable' | i18n }}</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-product>
              <tr>
                  <td><p-skeleton size="2rem" styleClass="mr-2"></p-skeleton></td>
                  <td><p-skeleton  width="2rem"></p-skeleton></td>
                  <td><p-skeleton  width="9rem"></p-skeleton></td>
                  <td><p-skeleton width="29rem"></p-skeleton></td>
                  <td class="text-center"><p-skeleton width="3rem"></p-skeleton></td>
                  <td class="text-center"><p-skeleton width="3rem"></p-skeleton></td>
                  <td class="text-center"><p-skeleton width="3rem"></p-skeleton></td>
                  <td>
                    <div class="flex">
                      <p-skeleton size="2rem" styleClass="mr-2"></p-skeleton>
                      <p-skeleton size="2rem" styleClass="mr-2"></p-skeleton>
                    </div>
                  </td>
                  <td><p-skeleton width="2rem"></p-skeleton></td>
              </tr>
          </ng-template>
      </p-table>
        <div class="flex justify-content-between align-items-center mt-3">
            <div class="flex">
              <p-skeleton class="mr-2" width="8rem" height="2.3rem"></p-skeleton>
              <p-skeleton class="mr-2" width="8rem" height="2.3rem"></p-skeleton>
              <p-skeleton class="mr-2" width="8rem" height="2.3rem"></p-skeleton>
            </div>
            <p-skeleton width="9rem" height="1.5rem"></p-skeleton>
        </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
  fakeDate = Array.from({ length: 8 }).map((_, i) => ({
    code: i + 1
  }));
}
