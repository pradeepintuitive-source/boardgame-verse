export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  console.error("[GameHub]", error, context);
}