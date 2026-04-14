// Shared focus state — lives in its own module to avoid circular dependencies
// between polyfill.ts and navigation.ts.

let programmatic = false;

export function isProgrammaticFocus(): boolean {
  return programmatic;
}

export function setProgrammaticFocus(value: boolean): void {
  programmatic = value;
}
