import { init, destroy } from "./polyfill.js";

/**
 * Check if the browser natively supports the focusgroup attribute.
 * In non-DOM environments (e.g. Node / SSR), returns false.
 */
export function isSupported(): boolean {
  if (typeof HTMLElement === "undefined") return false;
  return "focusgroup" in HTMLElement.prototype;
}

// Auto-initialize if native support is not available (browser only)
if (typeof document !== "undefined" && !isSupported()) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
}

export { init, destroy };
