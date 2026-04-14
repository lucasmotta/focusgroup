import { BEHAVIOR_DESCRIPTORS, type FocusgroupConfig } from './types.js';

/**
 * Apply ARIA roles based on the behavior token.
 *
 * - Container gets the minimum container role if it has no explicit role.
 * - <button> children get the inferred child role if the behavior defines one
 *   and they have no explicit role.
 *
 * Per spec: explicit roles always override inference. Inference only applies
 * to <button> elements (the dominant building block for composite widget items).
 */
export function applyRoles(
  container: HTMLElement,
  items: HTMLElement[],
  config: FocusgroupConfig,
): void {
  const descriptor = BEHAVIOR_DESCRIPTORS[config.behavior];
  if (!descriptor) return;

  // Container role
  if (!container.hasAttribute('role')) {
    container.setAttribute('role', descriptor.containerRole);
  }

  // Child role inference (only for <button> elements without explicit role)
  if (descriptor.childRole) {
    for (const item of items) {
      if (item.tagName === 'BUTTON' && !item.hasAttribute('role')) {
        item.setAttribute('role', descriptor.childRole);
      }
    }
  }
}

/**
 * Remove roles that were applied by the polyfill.
 * Only removes roles that match what we would have inferred.
 */
export function removeInferredRoles(
  container: HTMLElement,
  items: HTMLElement[],
  config: FocusgroupConfig,
): void {
  const descriptor = BEHAVIOR_DESCRIPTORS[config.behavior];
  if (!descriptor) return;

  if (container.getAttribute('role') === descriptor.containerRole) {
    container.removeAttribute('role');
  }

  if (descriptor.childRole) {
    for (const item of items) {
      if (
        item.tagName === 'BUTTON' &&
        item.getAttribute('role') === descriptor.childRole
      ) {
        item.removeAttribute('role');
      }
    }
  }
}
