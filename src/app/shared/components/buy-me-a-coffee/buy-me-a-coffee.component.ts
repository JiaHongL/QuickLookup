import { ThemeService } from './../../../theme.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

@Component({
  selector: 'app-buy-me-a-coffee',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `
    <div class="buy-me-a-coffee">
        @if (this.isDarkMode()) {
          <a href="https://www.buymeacoffee.com/Joe.lin">
            <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=Joe.lin&button_colour=011d25&font_colour=ffffff&font_family=Lato&outline_colour=ffffff&coffee_colour=FFDD00?t={{timestamp}}" />
          </a>
        }@else {
          @defer {
            <a href="https://www.buymeacoffee.com/Joe.lin" target="_blank">
              <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=Joe.lin&button_colour=FFDD00&font_colour=000000&font_family=Inter&outline_colour=000000&coffee_colour=ffffff?t={{timestamp}}"/>
            </a>
          }
        }
    </div>
  `,
  styles: `
    .buy-me-a-coffee{
      img{
        width: 180px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyMeACoffeeComponent {
  themeService = inject(ThemeService);
  isDarkMode = computed(() => {
    return this.themeService.currentDarkMode()=== 'y';
  });
  timestamp = new Date().getTime();
}
