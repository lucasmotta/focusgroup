import { init, destroy } from "./polyfill.js";

/**
 * Check if the browser natively supports the focusgroup attribute.
 */
export function isSupported(): boolean {
  return "focusgroup" in HTMLElement.prototype;
}

// Auto-initialize if native support is not available
if (!isSupported()) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
}

export { init, destroy };
