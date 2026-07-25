import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BarcodePrinterComponent } from './barcode-printer/barcode-printer.component';
import { ProductEntriesComponent } from './product-entries/product-entries.component';
import { DailyEntryComponent } from './daily-entry/daily-entry.component';

export const billingRoutes: Routes = [
  {
    path: '',
    component: LandingComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'product-entries', component: ProductEntriesComponent },
      { path: 'barcode-printer', component: BarcodePrinterComponent },
      { path: 'daily-entry', component: DailyEntryComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
