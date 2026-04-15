import type { FocusgroupInstance } from "./focusgroup-instance.js";
import type { FocusgroupSegment } from "./types.js";

// Store original tabindex values so we can restore on teardown
const originalTabindex = new WeakMap<HTMLElement, string | null>();

/**
 * Enforce roving tabindex for all segments: exactly one item per segment
 * has tabindex="0", all others get tabindex="-1".
 */
export function enforceRovingTabindex(instance: FocusgroupInstance): void {
  for (const segment of instance.segments) {
    applyTabindexToSegment(segment);
  }
}

function applyTabindexToSegment(segment: FocusgroupSegment): void {
  for (let i = 0; i < segment.items.length; i++) {
    const item = segment.items[i];
    saveOriginalTabindex(item);
    item.setAttribute("tabindex", i === segment.tabStopIndex ? "0" : "-1");
  }
}

/**
 * Update roving tabindex when an item receives focus.
 */
export function onItemFocused(item: HTMLElement, instance: FocusgroupInstance): void {
  const segment = instance.getSegmentContaining(item);
  if (!segment) return;

  const idx = segment.items.indexOf(item);
  if (idx === -1) return;

  // Update the active tab stop
  segment.tabStopIndex = idx;

  // Update memory if enabled
  if (instance.config.memory) {
    segment.lastFocusedIndex = idx;
  }

  // Apply tabindex changes
  for (let i = 0; i < segment.items.length; i++) {
    segment.items[i].setAttribute("tabindex", i === idx ? "0" : "-1");
  }
}

function saveOriginalTabindex(el: HTMLElement): void {
  if (!originalTabindex.has(el)) {
    originalTabindex.set(el, el.getAttribute("tabindex"));
  }
}

/**
 * Restore original tabindex for all items managed by an instance.
 */
export function restoreTabindex(instance: FocusgroupInstance): void {
  for (const segment of instance.segments) {
    for (const item of segment.items) {
      const original = originalTabindex.get(item);
      if (original === null || original === undefined) {
        item.removeAttribute("tabindex");
      } else {
        item.setAttribute("tabindex", original);
      }
      originalTabindex.delete(item);
    }
  }
}
