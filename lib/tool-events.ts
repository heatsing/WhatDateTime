export function toolEvent(action: "calculate" | "copy" | "share" | "save", tool: string) {
  // Never send dates, event names or other input values to analytics.
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.(`event`, `tool_${action}`, { tool });
}
