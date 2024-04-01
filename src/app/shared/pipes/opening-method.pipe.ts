import { Pipe, PipeTransform, inject } from '@angular/core';
import { CommonOptionService } from '../../service/common-option.service';

@Pipe({
  name: 'openingMethod',
  standalone: true,
})
export class OpeningMethodPipe implements PipeTransform {

  commonOptionService = inject(CommonOptionService);

  transform(value: string): unknown {
    return this.commonOptionService.openingMethodOptions.find((option) => option.code === value)?.name || '';
  }

}
