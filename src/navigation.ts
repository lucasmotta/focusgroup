import type { FocusgroupInstance } from './focusgroup-instance.js';
import type { GridLayout } from './types.js';
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

  // Grid navigation uses its own 2D movement logic
  if (instance.isGrid) {
    return handleGridNavigation(event, target, instance);
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

function handleGridNavigation(
  event: KeyboardEvent,
  target: HTMLElement,
  instance: FocusgroupInstance,
): boolean {
  const grid = instance.gridLayout!;
  const pos = grid.getPosition(target);
  if (!pos) return false;

  // Resolve which physical keys map to inline/block directions
  const style = getComputedStyle(instance.container);
  const writingMode = style.writingMode || 'horizontal-tb';
  const direction = style.direction || 'ltr';
  const mapping = getGridKeyMapping(writingMode, direction);

  const { row, col } = pos;
  let nextCell: HTMLElement | null = null;

  switch (event.key) {
    case mapping.inlineForward:
      nextCell = moveInline(grid, row, col, +1, instance);
      break;
    case mapping.inlineBackward:
      nextCell = moveInline(grid, row, col, -1, instance);
      break;
    case mapping.blockForward:
      nextCell = moveBlock(grid, row, col, +1, instance);
      break;
    case mapping.blockBackward:
      nextCell = moveBlock(grid, row, col, -1, instance);
      break;
    case 'Home':
      nextCell = grid.getCell(row, 0);
      break;
    case 'End': {
      const rowCells = grid.rows[row];
      nextCell = rowCells ? rowCells[rowCells.length - 1] : null;
      break;
    }
    default:
      return false;
  }

  if (nextCell && nextCell !== target) {
    event.preventDefault();
    focusProgrammatically(nextCell);
    return true;
  }

  if (
    event.key === mapping.inlineForward ||
    event.key === mapping.inlineBackward ||
    event.key === mapping.blockForward ||
    event.key === mapping.blockBackward ||
    event.key === 'Home' ||
    event.key === 'End'
  ) {
    // At boundary — prevent default but don't move
    event.preventDefault();
    return true;
  }

  return false;
}

function moveInline(
  grid: GridLayout,
  row: number,
  col: number,
  delta: 1 | -1,
  instance: FocusgroupInstance,
): HTMLElement | null {
  const rowCells = grid.rows[row];
  if (!rowCells) return null;

  let nextCol = col + delta;
  const rowWrap = instance.config.gridRowWrap;

  if (nextCol >= 0 && nextCol < rowCells.length) {
    return rowCells[nextCol];
  }

  if (rowWrap === 'wrap') {
    nextCol = ((nextCol % rowCells.length) + rowCells.length) % rowCells.length;
    return rowCells[nextCol];
  }

  if (rowWrap === 'flow') {
    // Flow to next/previous row
    let nextRow = row + delta;
    if (nextRow < 0) nextRow = grid.rows.length - 1;
    else if (nextRow >= grid.rows.length) nextRow = 0;

    if (nextRow === row) return null; // single row, nowhere to flow

    const targetRow = grid.rows[nextRow];
    if (!targetRow || targetRow.length === 0) return null;

    return delta > 0 ? targetRow[0] : targetRow[targetRow.length - 1];
  }

  return null; // 'none' — hard stop
}

function moveBlock(
  grid: GridLayout,
  row: number,
  col: number,
  delta: 1 | -1,
  instance: FocusgroupInstance,
): HTMLElement | null {
  let nextRow = row + delta;
  const colWrap = instance.config.gridColWrap;

  if (nextRow >= 0 && nextRow < grid.rows.length) {
    // Clamp col to the target row's length
    const targetRow = grid.rows[nextRow];
    const clampedCol = Math.min(col, targetRow.length - 1);
    return targetRow[clampedCol] ?? null;
  }

  if (colWrap === 'wrap') {
    nextRow = ((nextRow % grid.rows.length) + grid.rows.length) % grid.rows.length;
    const targetRow = grid.rows[nextRow];
    const clampedCol = Math.min(col, targetRow.length - 1);
    return targetRow[clampedCol] ?? null;
  }

  if (colWrap === 'flow') {
    // Flow to next/previous column
    let nextCol = col + delta;
    if (nextCol < 0) {
      // Find the max column count across rows
      const maxCols = Math.max(...grid.rows.map((r) => r.length));
      nextCol = maxCols - 1;
    } else {
      nextCol = 0;
    }

    const targetRow = delta > 0 ? grid.rows[0] : grid.rows[grid.rows.length - 1];
    if (!targetRow) return null;
    const clampedCol = Math.min(nextCol, targetRow.length - 1);
    return targetRow[clampedCol] ?? null;
  }

  return null; // 'none' — hard stop
}

interface GridKeyMapping {
  inlineForward: string;
  inlineBackward: string;
  blockForward: string;
  blockBackward: string;
}

function getGridKeyMapping(
  writingMode: string,
  direction: string,
): GridKeyMapping {
  switch (writingMode) {
    case 'vertical-rl':
    case 'sideways-rl':
      return {
        inlineForward: 'ArrowDown',
        inlineBackward: 'ArrowUp',
        blockForward: 'ArrowLeft',
        blockBackward: 'ArrowRight',
      };
    case 'vertical-lr':
    case 'sideways-lr':
      return {
        inlineForward: 'ArrowDown',
        inlineBackward: 'ArrowUp',
        blockForward: 'ArrowRight',
        blockBackward: 'ArrowLeft',
      };
    case 'horizontal-tb':
    default:
      if (direction === 'rtl') {
        return {
          inlineForward: 'ArrowLeft',
          inlineBackward: 'ArrowRight',
          blockForward: 'ArrowDown',
          blockBackward: 'ArrowUp',
        };
      }
      return {
        inlineForward: 'ArrowRight',
        inlineBackward: 'ArrowLeft',
        blockForward: 'ArrowDown',
        blockBackward: 'ArrowUp',
      };
  }
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
