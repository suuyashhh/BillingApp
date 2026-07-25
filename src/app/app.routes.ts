import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./components/Billing.routes').then(m => m.billingRoutes)
  }
];
