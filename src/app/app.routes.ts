import { Routes } from '@angular/router';

import { PopupComponent } from './popup/popup.component';
import { HomeComponent } from './home/home.component';
import { OptionsComponent } from './options/options.component';

export const routes: Routes = [
    { path: 'popup', component: PopupComponent },
    { path: 'options' , component: OptionsComponent },
    { path: 'home' , component: HomeComponent },
    { path: '**', redirectTo: 'home', pathMatch: 'full' },
];
