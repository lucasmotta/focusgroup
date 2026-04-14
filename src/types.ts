export type FocusgroupBehavior =
  | 'toolbar'
  | 'tablist'
  | 'radiogroup'
  | 'listbox'
  | 'menu'
  | 'menubar'
  | 'tree'
  | 'none';

export type FocusgroupDirection = 'inline' | 'block' | 'both';
export type WrapMode = 'wrap' | 'nowrap';

export interface FocusgroupConfig {
  behavior: FocusgroupBehavior;
  direction: FocusgroupDirection;
  wrap: WrapMode;
  memory: boolean;
  raw: string;
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
    containerRole: 'toolbar',
    childRole: null,
    defaultDirection: 'inline',
    defaultWrap: 'nowrap',
  },
  tablist: {
    containerRole: 'tablist',
    childRole: 'tab',
    defaultDirection: 'inline',
    defaultWrap: 'wrap',
  },
  radiogroup: {
    containerRole: 'radiogroup',
    childRole: 'radio',
    defaultDirection: 'both',
    defaultWrap: 'wrap',
  },
  listbox: {
    containerRole: 'listbox',
    childRole: 'option',
    defaultDirection: 'block',
    defaultWrap: 'nowrap',
  },
  menu: {
    containerRole: 'menu',
    childRole: 'menuitem',
    defaultDirection: 'block',
    defaultWrap: 'wrap',
  },
  menubar: {
    containerRole: 'menubar',
    childRole: 'menuitem',
    defaultDirection: 'inline',
    defaultWrap: 'wrap',
  },
  tree: {
    containerRole: 'tree',
    childRole: 'treeitem',
    defaultDirection: 'block',
    defaultWrap: 'nowrap',
  },
};
