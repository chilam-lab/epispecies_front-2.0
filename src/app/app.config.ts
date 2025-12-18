import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations'; // This replaces BrowserAnimationsModule
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideHighcharts } from 'highcharts-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideHttpClient(),
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: Aura,
      options: {
            darkModeSelector: false
        }
      }
    }),
    provideHighcharts({
      // Optional: Define the Highcharts instance dynamically
      instance: () => import('highcharts'),

      // Include Highcharts additional modules
      modules: () => {
        return [
          import('highcharts/esm/modules/accessibility'),
          import('highcharts/esm/modules/exporting'),
          import('highcharts/highcharts-more'),  // <-- Add this for error bars
          import('highcharts/esm/themes/sunset'),
        ];
      },
    }),
  ]
};
