import type { FocusgroupConfig, FocusgroupSegment, GridLayout } from "./types.js";
import { discoverItems } from "./item-discovery.js";
import { computeSegments } from "./segments.js";
import { enforceRovingTabindex, restoreTabindex } from "./tab-management.js";
import { applyRoles, removeInferredRoles } from "./role-inference.js";
import { buildGridLayout } from "./grid-layout.js";

export class FocusgroupInstance {
  readonly container: HTMLElement;
  config: FocusgroupConfig;
  items: HTMLElement[] = [];
  segments: FocusgroupSegment[] = [];
  gridLayout: GridLayout | null = null;

  private itemSet = new Set<HTMLElement>();

  constructor(container: HTMLElement, config: FocusgroupConfig) {
    this.container = container;
    this.config = config;
    this.refresh();
  }

  get isGrid(): boolean {
    return this.config.behavior === "grid" && this.gridLayout !== null;
  }

  /**
   * Re-discover items, recompute segments, and update tabindex/roles.
   * Called on init and when the DOM changes.
   */
  refresh(): void {
    if (this.config.behavior === "grid") {
      this.gridLayout = buildGridLayout(this.container);
      // For grid, items are all cells flattened (for tab management / roving tabindex)
      this.items = this.gridLayout ? this.gridLayout.rows.flat() : [];
    } else {
      this.gridLayout = null;
      this.items = discoverItems(this.container);
    }
    this.itemSet = new Set(this.items);

    // Preserve memory across refreshes
    const oldSegments = this.segments;
    this.segments = computeSegments(this.container, this.items);

    // Carry over tab stop and memory from old segments
    this.restoreSegmentState(oldSegments);

    // Determine initial tab stops for segments that weren't restored
    for (const segment of this.segments) {
      if (segment.tabStopIndex < 0) {
        this.resolveTabStop(segment);
      }
    }

    applyRoles(this.container, this.items, this.config);
    enforceRovingTabindex(this);
  }

  /**
   * Check if an element is a focusgroup item in this instance.
   */
  hasItem(el: HTMLElement): boolean {
    return this.itemSet.has(el);
  }

  /**
   * Find the segment containing a given item.
   */
  getSegmentContaining(item: HTMLElement): FocusgroupSegment | null {
    for (const segment of this.segments) {
      if (segment.items.includes(item)) return segment;
    }
    return null;
  }

  /**
   * Clean up: remove inferred roles and restore original tabindex.
   */
  teardown(): void {
    removeInferredRoles(this.container, this.items, this.config);
    restoreTabindex(this);
  }

  private resolveTabStop(segment: FocusgroupSegment): void {
    // Priority: memory > focusgroupstart > first item

    // 1. Memory (if enabled and segment was previously visited)
    if (this.config.memory && segment.lastFocusedIndex >= 0) {
      if (segment.lastFocusedIndex < segment.items.length) {
        segment.tabStopIndex = segment.lastFocusedIndex;
        return;
      }
      segment.lastFocusedIndex = -1;
    }

    // 2. focusgroupstart attribute
    for (let i = 0; i < segment.items.length; i++) {
      if (segment.items[i].hasAttribute("focusgroupstart")) {
        segment.tabStopIndex = i;
        return;
      }
    }

    // 3. Default: first item
    segment.tabStopIndex = 0;
  }

  private restoreSegmentState(oldSegments: FocusgroupSegment[]): void {
    for (const oldSeg of oldSegments) {
      // Carry over the tab stop element
      const tabStopEl = oldSeg.items[oldSeg.tabStopIndex];
      if (tabStopEl) {
        for (const newSeg of this.segments) {
          const idx = newSeg.items.indexOf(tabStopEl);
          if (idx !== -1) {
            newSeg.tabStopIndex = idx;
            break;
          }
        }
      }

      // Carry over memory (lastFocusedIndex)
      if (this.config.memory && oldSeg.lastFocusedIndex >= 0) {
        const lastFocusedEl = oldSeg.items[oldSeg.lastFocusedIndex];
        if (lastFocusedEl) {
          for (const newSeg of this.segments) {
            const idx = newSeg.items.indexOf(lastFocusedEl);
            if (idx !== -1) {
              newSeg.lastFocusedIndex = idx;
              break;
            }
          }
        }
      }
    }
  }
}
