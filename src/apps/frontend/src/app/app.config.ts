import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { appRoutes } from './app.routes';
import { HttpProductRepository } from './products/api/http-product.repository';
import { ProductRepository } from './products/api/product.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(appRoutes, withComponentInputBinding()),
    { provide: ProductRepository, useClass: HttpProductRepository },
  ],
};
