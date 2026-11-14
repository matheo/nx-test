import { Routes } from '@angular/router';

export const productsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/product-list.page').then((m) => m.ProductListPage),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/product-form.page').then((m) => m.ProductFormPage),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/product-form.page').then((m) => m.ProductFormPage),
  },
];
