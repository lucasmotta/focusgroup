export function isFocusable(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  if (isDisabled(el)) return false;
  if (!isVisible(el)) return false;
  if (isInert(el)) return false;
  if (el.hasAttribute('tabindex')) return true;
  if (isNativelyFocusable(el)) return true;
  return false;
}

function isDisabled(el: HTMLElement): boolean {
  if ('disabled' in el && (el as HTMLButtonElement).disabled) return true;
  return false;
}

function isNativelyFocusable(el: HTMLElement): boolean {
  const tag = el.tagName;
  if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') {
    return true;
  }
  if (tag === 'A' && el.hasAttribute('href')) return true;
  const ce = el.getAttribute('contenteditable');
  if (ce === 'true' || ce === '') return true;
  if (tag === 'SUMMARY' && el.parentElement?.tagName === 'DETAILS') return true;
  return false;
}

export function isVisible(el: HTMLElement): boolean {
  if (el.hasAttribute('hidden')) return false;
  const style = getComputedStyle(el);
  if (style.display === 'none') return false;
  if (style.visibility === 'hidden') return false;
  // Check ancestors for display:none/hidden
  let parent = el.parentElement;
  while (parent) {
    if (parent.hasAttribute('hidden')) return false;
    const parentStyle = getComputedStyle(parent);
    if (parentStyle.display === 'none') return false;
    if (parentStyle.visibility === 'hidden') return false;
    parent = parent.parentElement;
  }
  return true;
}

function isInert(el: HTMLElement): boolean {
  let current: HTMLElement | null = el;
  while (current) {
    if (current.hasAttribute('inert')) return true;
    current = current.parentElement;
  }
  return false;
}

/**
 * Get children following the flat tree (shadow-inclusive).
 * If node has a shadow root, yields shadow root children.
 * If node is a <slot>, yields assigned nodes (or fallback content).
 */
export function* flatTreeChildren(
  node: Element | ShadowRoot | Document,
): Generator<Element> {
  if (node instanceof HTMLSlotElement) {
    const assigned = node.assignedElements({ flatten: true });
    if (assigned.length > 0) {
      yield* assigned;
    } else {
      for (const child of node.children) {
        yield child;
      }
    }
    return;
  }

  if (node instanceof HTMLElement && node.shadowRoot) {
    for (const child of node.shadowRoot.children) {
      yield child;
    }
    return;
  }

  for (const child of node.children) {
    yield child;
  }
}

/**
 * Walk the flat tree (shadow-inclusive, depth-first) from a root,
 * yielding every Element descendant.
 */
export function* walkFlatTree(root: Element | ShadowRoot): Generator<Element> {
  for (const child of flatTreeChildren(root)) {
    yield child;
    yield* walkFlatTree(child);
  }
}

/**
 * Walk up composed parents (crossing shadow boundaries).
 */
export function composedParent(el: Element): Element | null {
  if (el.assignedSlot) return el.assignedSlot;
  const root = el.getRootNode();
  if (root instanceof ShadowRoot) return root.host;
  return el.parentElement;
}
