import { FocusgroupRegistry } from './focusgroup-registry.js';
import { parseAttribute } from './parse-attribute.js';
import { handleNavigation } from './navigation.js';
import { onItemFocused } from './tab-management.js';
import { isProgrammaticFocus } from './focus-state.js';

let registry: FocusgroupRegistry | null = null;
let observer: MutationObserver | null = null;
let rescanQueued = false;

export function init(): void {
  if (registry) return;

  registry = new FocusgroupRegistry();

  // Initial scan
  scanDocument();

  // Global keydown listener (capture phase to intercept before other handlers)
  document.addEventListener('keydown', handleKeydown, { capture: true });

  // Global focusin listener for roving tabindex updates
  document.addEventListener('focusin', handleFocusin);

  // MutationObserver for dynamic DOM changes
  observer = new MutationObserver(handleMutations);
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [
      'focusgroup',
      'focusgroupstart',
      'disabled',
      'hidden',
    ],
  });
}

export function destroy(): void {
  if (!registry) return;

  document.removeEventListener('keydown', handleKeydown, { capture: true });
  document.removeEventListener('focusin', handleFocusin);

  observer?.disconnect();
  observer = null;

  registry.destroy();
  registry = null;
  rescanQueued = false;
}

function scanDocument(): void {
  if (!registry) return;

  const containers = document.querySelectorAll<HTMLElement>('[focusgroup]');
  for (const container of containers) {
    const raw = container.getAttribute('focusgroup');
    if (!raw || raw === 'none') continue;

    const config = parseAttribute(raw);
    if (config) {
      registry.register(container, config);
    }
  }
}

function handleKeydown(event: KeyboardEvent): void {
  if (!registry) return;

  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const instance = registry.getOwningInstance(target);
  if (!instance) return;

  handleNavigation(event, target, instance);
}

function handleFocusin(event: FocusEvent): void {
  if (!registry) return;

  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const instance = registry.getOwningInstance(target);
  if (!instance) return;

  // For nomemory focusgroups: if this is a Tab entry (not programmatic arrow-key
  // navigation), redirect focus to the focusgroupstart item.
  if (!isProgrammaticFocus() && !instance.config.memory) {
    const segment = instance.getSegmentContaining(target);
    if (segment) {
      let startIdx = 0;
      for (let i = 0; i < segment.items.length; i++) {
        if (segment.items[i].hasAttribute('focusgroupstart')) {
          startIdx = i;
          break;
        }
      }
      const startEl = segment.items[startIdx];
      if (startEl && startEl !== target) {
        startEl.focus();
        return; // focusin will fire again for startEl
      }
    }
  }

  onItemFocused(target, instance);
}

function handleMutations(mutations: MutationRecord[]): void {
  if (!registry) return;

  let needsRescan = false;

  for (const mutation of mutations) {
    if (mutation.type === 'attributes') {
      if (mutation.attributeName === 'focusgroup') {
        handleFocusgroupAttributeChange(mutation.target as HTMLElement);
      } else {
        // disabled, hidden, focusgroupstart changes trigger rescan
        needsRescan = true;
      }
    } else if (mutation.type === 'childList') {
      needsRescan = true;
    }
  }

  if (needsRescan && !rescanQueued) {
    rescanQueued = true;
    queueMicrotask(() => {
      rescanQueued = false;
      registry?.refreshAll();
    });
  }
}

function handleFocusgroupAttributeChange(target: HTMLElement): void {
  if (!registry) return;

  const raw = target.getAttribute('focusgroup');

  if (!raw || raw === 'none') {
    // Attribute removed or set to "none" — unregister
    registry.unregister(target);
    // Refresh other instances in case this element was nested
    registry.refreshAll();
    return;
  }

  const config = parseAttribute(raw);
  if (config) {
    registry.register(target, config);
  } else {
    registry.unregister(target);
  }
}
