import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeService } from './theme.service';

import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [
      ConfirmationService,
      MessageService
  ],
  imports: [
    RouterOutlet,
    ConfirmDialogModule,
    ToastModule
  ],
  template: `
    <router-outlet />
    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `
})
export class AppComponent {
  themeService = inject(ThemeService);
  constructor(){
    chrome.runtime.onMessage.addListener((request, sender, sendResponse)=> {
      if (request.action === 'updateThemeBroadcast') {
        const currentTheme = this.themeService.currentTheme();
        const currentDarkMode = this.themeService.currentDarkMode();
        if(
          currentTheme !== request.data.theme ||
          currentDarkMode !== request.data.darkMode
        ){
          this.themeService.currentTheme.set(request.data.theme);
          this.themeService.currentDarkMode.set(request.data.darkMode);
        }
      }
    });
  }
}
