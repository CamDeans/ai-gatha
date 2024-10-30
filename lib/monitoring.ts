import * as Sentry from '@sentry/nextjs'

export function initMonitoring() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      enabled: process.env.NODE_ENV === 'production',
    })
  }
} 