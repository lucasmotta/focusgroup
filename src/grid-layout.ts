import type { GridLayout } from "./types.js";
import { isFocusable } from "./utils.js";

/**
 * Build a 2D grid layout from a CSS Grid container.
 *
 * For items with explicit grid-row-start/grid-column-start, uses those values.
 * For auto-placed items (the common case), infers position from the column
 * count and the child's order among focusable items.
 *
 * Returns null if the container is not display:grid/inline-grid.
 */
export function buildGridLayout(container: HTMLElement): GridLayout | null {
  const style = getComputedStyle(container);
  if (style.display !== "grid" && style.display !== "inline-grid") {
    console.warn(
      `[focusgroup-polyfill] focusgroup="grid" is set on an element that is not display:grid.`,
      container,
    );
    return null;
  }

  // Determine column count from the resolved grid-template-columns.
  // The computed value is a space-separated list of track sizes (e.g. "80px 80px 80px").
  const colCount = getColumnCount(style);
  if (colCount <= 0) return null;

  // Collect all focusable direct children in DOM order
  const items: HTMLElement[] = [];
  for (const child of container.children) {
    if (!(child instanceof HTMLElement)) continue;
    if (child.hasAttribute("focusgroup")) continue;
    if (!isFocusable(child)) continue;
    items.push(child);
  }

  if (items.length === 0) return null;

  // Build the 2D grid. For each item, try explicit placement first,
  // then fall back to auto-flow position.
  const rows: HTMLElement[][] = [];
  let autoIndex = 0;

  for (const item of items) {
    const itemStyle = getComputedStyle(item);
    const explicitRow = parseGridLine(itemStyle.gridRowStart);
    const explicitCol = parseGridLine(itemStyle.gridColumnStart);

    let row: number;
    let col: number;

    if (explicitRow !== null && explicitCol !== null) {
      // Explicit placement (1-based in CSS → 0-based here)
      row = explicitRow - 1;
      col = explicitCol - 1;
    } else {
      // Auto-flow: derive from position in item list
      row = Math.floor(autoIndex / colCount);
      col = autoIndex % colCount;
    }

    // Ensure row array exists
    while (rows.length <= row) rows.push([]);
    rows[row][col] = item;
    autoIndex++;
  }

  // Build lookup map
  const positionMap = new WeakMap<HTMLElement, { row: number; col: number }>();
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      if (rows[r][c]) {
        positionMap.set(rows[r][c], { row: r, col: c });
      }
    }
  }

  return {
    rows,
    getCell(row: number, col: number): HTMLElement | null {
      return rows[row]?.[col] ?? null;
    },
    getPosition(el: HTMLElement): { row: number; col: number } | null {
      return positionMap.get(el) ?? null;
    },
  };
}

/**
 * Get the number of columns from the computed grid-template-columns.
 * The resolved value is a list of track sizes like "80px 80px 80px".
 */
function getColumnCount(style: CSSStyleDeclaration): number {
  const value = style.gridTemplateColumns;
  if (!value || value === "none") return 0;
  // Split by whitespace — each token is a resolved track size
  return value.trim().split(/\s+/).length;
}

/**
 * Parse a grid line value. Returns the numeric value if it's an explicit
 * line number, or null if it's "auto" or a named line.
 */
function parseGridLine(value: string): number | null {
  if (!value || value === "auto") return null;
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}
