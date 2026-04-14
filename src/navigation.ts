import type { FocusgroupInstance } from './focusgroup-instance.js';
import { resolveDirectionMap } from './writing-mode.js';
import { isKeyConflictElement } from './key-conflict.js';
import { setProgrammaticFocus } from './focus-state.js';

/**
 * Handle a keydown event for focusgroup navigation.
 * Returns true if the event was handled (caller should not process further).
 */
export function handleNavigation(
  event: KeyboardEvent,
  target: HTMLElement,
  instance: FocusgroupInstance,
): boolean {
  // Key conflict check: arrow keys pass through, Tab provides escape
  if (isKeyConflictElement(target, instance.container, instance.config)) {
    if (event.key === 'Tab') {
      return handleTabEscape(event, target, instance);
    }
    return false;
  }

  const dirMap = resolveDirectionMap(instance.container, instance.config);

  if (dirMap.forward.includes(event.key)) {
    event.preventDefault();
    moveFocus(target, instance, 1);
    return true;
  }

  if (dirMap.backward.includes(event.key)) {
    event.preventDefault();
    moveFocus(target, instance, -1);
    return true;
  }

  if (event.key === 'Home') {
    event.preventDefault();
    moveFocusToEdge(target, instance, 'first');
    return true;
  }

  if (event.key === 'End') {
    event.preventDefault();
    moveFocusToEdge(target, instance, 'last');
    return true;
  }

  return false;
}

function focusProgrammatically(el: HTMLElement): void {
  setProgrammaticFocus(true);
  el.focus();
  setProgrammaticFocus(false);
  el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function moveFocus(
  current: HTMLElement,
  instance: FocusgroupInstance,
  delta: 1 | -1,
): void {
  const segment = instance.getSegmentContaining(current);
  if (!segment) return;

  const currentIdx = segment.items.indexOf(current);
  if (currentIdx === -1) return;

  let nextIdx = currentIdx + delta;

  if (instance.config.wrap === 'wrap') {
    nextIdx = ((nextIdx % segment.items.length) + segment.items.length) % segment.items.length;
  } else {
    if (nextIdx < 0 || nextIdx >= segment.items.length) return;
  }

  focusProgrammatically(segment.items[nextIdx]);
}

function moveFocusToEdge(
  current: HTMLElement,
  instance: FocusgroupInstance,
  edge: 'first' | 'last',
): void {
  const segment = instance.getSegmentContaining(current);
  if (!segment || segment.items.length === 0) return;

  const target =
    edge === 'first' ? segment.items[0] : segment.items[segment.items.length - 1];
  focusProgrammatically(target);
}

function handleTabEscape(
  event: KeyboardEvent,
  target: HTMLElement,
  instance: FocusgroupInstance,
): boolean {
  const segment = instance.getSegmentContaining(target);
  if (!segment) return false;

  const idx = segment.items.indexOf(target);
  if (idx === -1) return false;

  if (event.shiftKey) {
    if (idx > 0) {
      event.preventDefault();
      focusProgrammatically(segment.items[idx - 1]);
      return true;
    }
  } else {
    if (idx < segment.items.length - 1) {
      event.preventDefault();
      focusProgrammatically(segment.items[idx + 1]);
      return true;
    }
  }

  return false;
}
