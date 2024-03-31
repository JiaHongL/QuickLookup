import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { ThemeService } from '../../../theme.service';

@Component({
  selector: 'app-switch-mode-dark-button',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `
    <button 
      type="button" 
      class="flex flex-shrink-0 px-link border-1 border-solid w-2rem h-2rem surface-border border-round surface-card align-items-center justify-content-center transition-all transition-duration-300 hover:border-primary"
      (click)="toggle()"
    >
      <i class="pi" [ngClass]="{
        'pi-moon': checked(),
        'pi-sun': !checked(),
      }"></i>
    </button>
  `,
  styleUrl: './switch-mode-dark-button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchModeDarkButtonComponent {

  checked = signal<boolean>( window.localStorage.getItem('darkMode') === 'y' ? true : false);
  themeService = inject(ThemeService);

  isFirstTrigger = true;
  switchDarkModeEffect = effect(() => {
    const checked = this.checked();
    if (this.isFirstTrigger) {
      this.isFirstTrigger = false;
      return;
    }
    this.themeService.switchDarkMode(checked);
  },{ allowSignalWrites: true });
  
  toggle(){
    this.checked.set(!this.checked())
  }
}
