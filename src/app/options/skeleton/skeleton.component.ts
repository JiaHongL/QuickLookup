import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonModule,
    TableModule
  ],
  template: `
    <div class="border-round border-1 surface-border p-4 surface-card" style="width:900px;height:515px;">
        <div class="flex justify-content-between align-items-center mb-3">
            <div class="flex align-items-center"> 
              <p-skeleton size="2.5rem" styleClass="mr-2"></p-skeleton>
              <p-skeleton width="10rem" height="3.5rem"></p-skeleton>
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
              <th>名稱</th>
              <th>連結</th>
              <th>操作</th>
              <th>啟用</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-product>
              <tr>
                  <td><p-skeleton  width="2rem"></p-skeleton></td>
                  <td><p-skeleton  width="2rem"></p-skeleton></td>
                  <td><p-skeleton  width="9rem"></p-skeleton></td>
                  <td><p-skeleton width="30rem"></p-skeleton></td>
                  <td><p-skeleton  width="5rem"></p-skeleton></td>
                  <td><p-skeleton></p-skeleton></td>
              </tr>
          </ng-template>
      </p-table>
        <div class="flex justify-content-between align-items-center mt-3">
            <p-skeleton width="8rem" height="2.8rem"></p-skeleton>
            <p-skeleton width="9rem" height="2rem"></p-skeleton>
        </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
  fakeDate = Array.from({ length: 9 }).map((_, i) => ({
    code: i + 1,
    name: 'Product Name',
    category: 'Category',
    quantity: 10
  }));
}
