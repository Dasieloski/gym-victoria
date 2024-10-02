   // sentry.server.config.js
   import * as Sentry from '@sentry/nextjs';

   Sentry.init({
     dsn: "TU_DSN_DE_SENTRY",
     tracesSampleRate: 1.0,
   });