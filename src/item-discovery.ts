import { isFocusable } from "./utils.js";

/**
 * Discover all focusgroup items within the scope of a focusgroup container.
 * Items are focusable descendants, excluding:
 * - Elements with their own focusgroup attribute (nested focusgroups and opt-outs)
 * - Descendants of elements with focusgroup attribute
 */
export function discoverItems(container: HTMLElement): HTMLElement[] {
  const items: HTMLElement[] = [];
  collectItems(container, items);
  return items;
}

function collectItems(root: Element | ShadowRoot, items: HTMLElement[]): void {
  for (const child of iterateChildren(root)) {
    // If this child declares its own focusgroup, skip it and its subtree entirely.
    // This handles both nested focusgroups (focusgroup="toolbar") and opt-outs (focusgroup="none").
    if (child instanceof HTMLElement && child.hasAttribute("focusgroup")) {
      continue;
    }

    if (child instanceof HTMLElement && isFocusable(child)) {
      items.push(child);
    }

    // Descend into subtree (including shadow roots)
    if (child instanceof HTMLElement && child.shadowRoot) {
      collectItems(child.shadowRoot, items);
    } else {
      collectItems(child, items);
    }
  }
}

function* iterateChildren(node: Element | ShadowRoot): Generator<Element> {
  if (node instanceof HTMLSlotElement) {
    const assigned = node.assignedElements({ flatten: true });
    if (assigned.length > 0) {
      yield* assigned;
    } else {
      yield* Array.from(node.children);
    }
    return;
  }

  if (node instanceof HTMLElement && node.shadowRoot) {
    yield* Array.from(node.shadowRoot.children);
    return;
  }

  yield* Array.from(node.children);
}
