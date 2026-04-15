export type FocusgroupBehavior =
  | "toolbar"
  | "tablist"
  | "radiogroup"
  | "listbox"
  | "menu"
  | "menubar"
  | "tree"
  | "grid"
  | "none";

export type FocusgroupDirection = "inline" | "block" | "both";
export type WrapMode = "wrap" | "nowrap";
export type GridWrapMode = "none" | "wrap" | "flow";

export interface FocusgroupConfig {
  behavior: FocusgroupBehavior;
  direction: FocusgroupDirection;
  wrap: WrapMode;
  memory: boolean;
  raw: string;
  // Grid-specific wrap modes (only when behavior === 'grid')
  gridRowWrap: GridWrapMode;
  gridColWrap: GridWrapMode;
}

/** 2D grid layout: rows of cells, each cell is a focusable element */
export interface GridLayout {
  rows: HTMLElement[][];
  /** Get the cell at a given row/col, or null if out of bounds */
  getCell(row: number, col: number): HTMLElement | null;
  /** Find the row/col position of an element */
  getPosition(el: HTMLElement): { row: number; col: number } | null;
}

export interface BehaviorDescriptor {
  containerRole: string;
  childRole: string | null;
  defaultDirection: FocusgroupDirection;
  defaultWrap: WrapMode;
}

export interface DirectionMap {
  forward: string[];
  backward: string[];
}

export interface FocusgroupSegment {
  items: HTMLElement[];
  tabStopIndex: number;
  lastFocusedIndex: number;
}

export const BEHAVIOR_DESCRIPTORS: Record<string, BehaviorDescriptor> = {
  toolbar: {
    containerRole: "toolbar",
    childRole: null,
    defaultDirection: "inline",
    defaultWrap: "nowrap",
  },
  tablist: {
    containerRole: "tablist",
    childRole: "tab",
    defaultDirection: "inline",
    defaultWrap: "wrap",
  },
  radiogroup: {
    containerRole: "radiogroup",
    childRole: "radio",
    defaultDirection: "both",
    defaultWrap: "wrap",
  },
  listbox: {
    containerRole: "listbox",
    childRole: "option",
    defaultDirection: "block",
    defaultWrap: "nowrap",
  },
  menu: {
    containerRole: "menu",
    childRole: "menuitem",
    defaultDirection: "block",
    defaultWrap: "wrap",
  },
  menubar: {
    containerRole: "menubar",
    childRole: "menuitem",
    defaultDirection: "inline",
    defaultWrap: "wrap",
  },
  tree: {
    containerRole: "tree",
    childRole: "treeitem",
    defaultDirection: "block",
    defaultWrap: "nowrap",
  },
};
