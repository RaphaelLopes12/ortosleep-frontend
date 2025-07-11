import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./components/precificacao/precificacao.component').then(m => m.PrecificacaoComponent)
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];