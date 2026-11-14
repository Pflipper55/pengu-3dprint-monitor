import { Routes } from '@angular/router';
import { Home } from '../components/home/home';
import { Beds } from '../components/beds/beds';
import { Filaments } from '../components/filaments/filaments';
import { Nozzles } from '../components/nozzles/nozzles';
import { Printers } from '../components/printers/printers';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    children: [
      { path: '', redirectTo: 'printers', pathMatch: 'full' },
      { path: 'printers', component: Printers },
      { path: 'nozzles', component: Nozzles },
      { path: 'filaments', component: Filaments },
      { path: 'beds', component: Beds },
      { path: '**', redirectTo: 'printers' },
    ],
  },
];
