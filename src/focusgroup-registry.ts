import type { FocusgroupConfig } from "./types.js";
import { FocusgroupInstance } from "./focusgroup-instance.js";
import { composedParent } from "./utils.js";

/**
 * Registry mapping focusgroup container elements to their instances.
 * Provides O(1) lookup for any element to find its owning focusgroup.
 */
export class FocusgroupRegistry {
  private instances = new Map<HTMLElement, FocusgroupInstance>();

  /**
   * Register a new focusgroup or update an existing one.
   */
  register(container: HTMLElement, config: FocusgroupConfig): FocusgroupInstance {
    const existing = this.instances.get(container);
    if (existing) {
      existing.config = config;
      existing.refresh();
      return existing;
    }

    const instance = new FocusgroupInstance(container, config);
    this.instances.set(container, instance);
    return instance;
  }

  /**
   * Remove a focusgroup and clean up.
   */
  unregister(container: HTMLElement): void {
    const instance = this.instances.get(container);
    if (instance) {
      instance.teardown();
      this.instances.delete(container);
    }
  }

  /**
   * Get the focusgroup instance that owns a given element.
   * Walks up the composed tree to find the nearest focusgroup container.
   */
  getOwningInstance(el: HTMLElement): FocusgroupInstance | null {
    let current: Element | null = el;

    while (current) {
      if (current instanceof HTMLElement) {
        const instance = this.instances.get(current);
        if (instance && instance.hasItem(el)) {
          return instance;
        }
        // If we hit a container that doesn't own this element,
        // and this element has focusgroup="none", stop.
        if (current.getAttribute("focusgroup") === "none") {
          return null;
        }
      }
      current = composedParent(current);
    }

    return null;
  }

  /**
   * Refresh all registered instances (e.g., after DOM mutations).
   */
  refreshAll(): void {
    for (const instance of this.instances.values()) {
      instance.refresh();
    }
  }

  /**
   * Tear down all instances and clear the registry.
   */
  destroy(): void {
    for (const instance of this.instances.values()) {
      instance.teardown();
    }
    this.instances.clear();
  }

  /**
   * Get instance for a specific container.
   */
  get(container: HTMLElement): FocusgroupInstance | undefined {
    return this.instances.get(container);
  }
}
