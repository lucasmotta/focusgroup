import type { FocusgroupSegment } from './types.js';
import { isFocusable, walkFlatTree } from './utils.js';

/**
 * Compute focusgroup segments from a container and its discovered items.
 *
 * A segment is a contiguous group of focusgroup items not broken by
 * opted-out focusable elements. Each segment maintains its own tab stop.
 *
 * In the common case (no opted-out focusable elements between items),
 * there will be a single segment containing all items.
 */
export function computeSegments(
  container: HTMLElement,
  items: HTMLElement[],
): FocusgroupSegment[] {
  if (items.length === 0) return [];

  const itemSet = new Set(items);
  const segments: FocusgroupSegment[] = [];
  let currentItems: HTMLElement[] = [];

  for (const el of walkFlatTree(container)) {
    if (!(el instanceof HTMLElement)) continue;

    if (itemSet.has(el)) {
      currentItems.push(el);
    } else if (
      isFocusable(el) &&
      el.hasAttribute('focusgroup') &&
      el.getAttribute('focusgroup') === 'none'
    ) {
      // An opted-out focusable element breaks the segment
      if (currentItems.length > 0) {
        segments.push(createSegment(currentItems));
        currentItems = [];
      }
    }
  }

  if (currentItems.length > 0) {
    segments.push(createSegment(currentItems));
  }

  // If flat-tree walk missed items (e.g. due to shadow DOM complexity),
  // fallback to a single segment
  if (segments.length === 0 && items.length > 0) {
    segments.push(createSegment([...items]));
  }

  return segments;
}

function createSegment(items: HTMLElement[]): FocusgroupSegment {
  return {
    items,
    tabStopIndex: -1, // unresolved — resolveTabStop will set this
    lastFocusedIndex: -1,
  };
}
