import type { FocusgroupConfig } from './types.js';
import { resolveDirectionMap } from './writing-mode.js';

// Input types that use arrow keys natively
const ARROW_KEY_INPUT_TYPES = new Set([
  'text', 'search', 'url', 'tel', 'email', 'password',
  'number', 'date', 'datetime-local', 'month', 'week', 'time',
  'range',
]);

/**
 * Determine if an element is a key-conflict element for the given focusgroup.
 * Key-conflict elements consume arrow keys, so focusgroup navigation must not
 * interfere. Tab/Shift+Tab provides escape instead.
 */
export function isKeyConflictElement(
  el: HTMLElement,
  container: HTMLElement,
  config: FocusgroupConfig,
): boolean {
  // Input elements (most types use arrow keys)
  if (el instanceof HTMLInputElement) {
    return ARROW_KEY_INPUT_TYPES.has(el.type);
  }

  if (el instanceof HTMLTextAreaElement) return true;
  if (el instanceof HTMLSelectElement) return true;

  if (
    el.getAttribute('contenteditable') === 'true' ||
    el.getAttribute('contenteditable') === ''
  ) {
    return true;
  }

  // Focusable scrollable regions when scroll direction conflicts with focusgroup axis
  if (isConflictingScrollContainer(el, container, config)) return true;

  return false;
}

function isConflictingScrollContainer(
  el: HTMLElement,
  container: HTMLElement,
  config: FocusgroupConfig,
): boolean {
  const style = getComputedStyle(el);
  const overflowX = style.overflowX;
  const overflowY = style.overflowY;

  const canScrollX =
    (overflowX === 'auto' || overflowX === 'scroll') &&
    el.scrollWidth > el.clientWidth;
  const canScrollY =
    (overflowY === 'auto' || overflowY === 'scroll') &&
    el.scrollHeight > el.clientHeight;

  if (!canScrollX && !canScrollY) return false;

  const dirMap = resolveDirectionMap(container, config);
  const allKeys = [...dirMap.forward, ...dirMap.backward];

  if (canScrollX && (allKeys.includes('ArrowLeft') || allKeys.includes('ArrowRight'))) {
    return true;
  }
  if (canScrollY && (allKeys.includes('ArrowUp') || allKeys.includes('ArrowDown'))) {
    return true;
  }

  return false;
}
