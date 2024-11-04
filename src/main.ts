import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: ModalController, useClass: ModalController },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    importProvidersFrom(IonicModule.forRoot({})),
  ],
});
