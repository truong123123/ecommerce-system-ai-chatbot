/**
 * Production logging utility.
 * Logs application errors and can be wired to monitoring services like Sentry/Datadog.
 */

export function logError(context: string, error: unknown, metadata?: Record<string, unknown>): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Structured logging for production observability
  const payload = {
    timestamp: new Date().toISOString(),
    context,
    message: errorMessage,
    stack: errorStack,
    ...metadata,
  };

  if (process.env.NODE_ENV === 'production') {
    // In production: send to Sentry or backend log collector
    console.error(`[ERROR][${context}]`, JSON.stringify(payload));
  } else {
    // In development: clear console logging with stack
    console.error(`❌ [${context}]:`, errorMessage, error);
  }
}
