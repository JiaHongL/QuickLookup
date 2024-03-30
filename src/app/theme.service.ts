import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, effect, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  themeOptions = [
    {
      name:'md-indigo',
      code:'md-indigo'
    },
    {
      name: 'md-deeppurple',
      code: 'md-deeppurple'
    },
    {
      name:'bootstrap4-blue',
      code:'bootstrap4-blue'
    },
    {
      name:'bootstrap4-purple',
      code:'bootstrap4-purple'
    },
    {
      name: "mdc-indigo",
      code: "mdc-indigo"
    },
    {
      name: "mdc-deeppurple",
      code: "mdc-deeppurple"
    },
    {
      name: "viva",
      code: "viva"
    },
    {
      name: "soho",
      code: "soho"
    },
    {
      name: "lara-blue",
      code: "lara-blue"
    },
    {
      name:"lara-indigo",
      code:"lara-indigo"
    },
    {
      name:"lara-purple",
      code:"lara-purple"
    },
    {
      name: "lara-teal",
      code: "lara-teal"}
  ];

  currentTheme = signal(localStorage.getItem('theme') ? localStorage.getItem('theme') : 'mdc-indigo');

  currentDarkMode = signal(localStorage.getItem('darkMode') ? localStorage.getItem('darkMode') : 'n');

  updateThemeEffect = effect(() => {
    const themeLink = this.document.getElementById('app-theme') as HTMLLinkElement;
    const theme = this.currentTheme();
    const darkMode = this.currentDarkMode() === 'y' ? 'dark' : 'light';
    if (
      themeLink
    ) {
      themeLink.href = theme + '-' + darkMode + '.css';
    }
    this.setBodyLayoutClass();
    if(this.currentTheme() && this.currentDarkMode()){
      chrome.runtime.sendMessage({
        action: "updateTheme",
        data: {
          theme: this.currentTheme(),
          darkMode:  this.currentDarkMode() 
        }
      });
    }
  });

  constructor(@Inject(DOCUMENT) private document: Document) {}

  switchDarkMode(isDarkMode: boolean){
    let darkMode = isDarkMode ? 'y' : 'n';
    this.currentDarkMode.set(darkMode);
    localStorage.setItem('darkMode', darkMode);
  }

  switchTheme(theme: string) {
    this.currentTheme.set(theme);
    localStorage.setItem('theme', theme);
  }

  setBodyLayoutClass() {
    if (this.currentDarkMode() === 'y') {
      document.body.classList.add('dark-layout');
      document.body.classList.remove('light-layout');
    } else {
      document.body.classList.add('light-layout');
      document.body.classList.remove('dark-layout');
    }
  }

}
