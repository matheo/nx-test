import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () =>
      import('./products/products.routes').then((m) => m.productsRoutes),
  },
];
