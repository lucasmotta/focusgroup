import {
  BEHAVIOR_DESCRIPTORS,
  type FocusgroupBehavior,
  type FocusgroupConfig,
  type FocusgroupDirection,
  type GridWrapMode,
  type WrapMode,
} from './types.js';

const VALID_BEHAVIORS = new Set<string>([
  ...Object.keys(BEHAVIOR_DESCRIPTORS),
  'grid',
]);

export function parseAttribute(raw: string): FocusgroupConfig | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed || trimmed === 'none') return null;

  const tokens = trimmed.split(/\s+/);
  const behaviorToken = tokens[0];

  if (!VALID_BEHAVIORS.has(behaviorToken)) return null;

  const behavior = behaviorToken as FocusgroupBehavior;
  const isGrid = behavior === 'grid';
  const descriptor = BEHAVIOR_DESCRIPTORS[behavior];

  let direction: FocusgroupDirection | null = null;
  let wrap: WrapMode | null = null;
  let memory = true;
  let gridRowWrap: GridWrapMode | null = null;
  let gridColWrap: GridWrapMode | null = null;

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];
    switch (token) {
      case 'inline':
        direction = direction === 'block' ? 'both' : 'inline';
        break;
      case 'block':
        direction = direction === 'inline' ? 'both' : 'block';
        break;
      case 'wrap':
        wrap = 'wrap';
        break;
      case 'nowrap':
        wrap = 'nowrap';
        break;
      case 'nomemory':
        memory = false;
        break;
      // Grid-specific wrap modifiers
      case 'flow':
        if (isGrid) { gridRowWrap = 'flow'; gridColWrap = 'flow'; }
        break;
      case 'row-wrap':
        if (isGrid) gridRowWrap = 'wrap';
        break;
      case 'row-flow':
        if (isGrid) gridRowWrap = 'flow';
        break;
      case 'row-none':
        if (isGrid) gridRowWrap = 'none';
        break;
      case 'col-wrap':
        if (isGrid) gridColWrap = 'wrap';
        break;
      case 'col-flow':
        if (isGrid) gridColWrap = 'flow';
        break;
      case 'col-none':
        if (isGrid) gridColWrap = 'none';
        break;
      // Unknown tokens are ignored per spec
    }
  }

  // For grid, 'wrap' sets both axes to wrap if not individually overridden
  if (isGrid && wrap === 'wrap') {
    gridRowWrap ??= 'wrap';
    gridColWrap ??= 'wrap';
  }

  return {
    behavior,
    direction: direction ?? (descriptor?.defaultDirection ?? 'both'),
    wrap: wrap ?? (descriptor?.defaultWrap ?? 'nowrap'),
    memory,
    raw: trimmed,
    gridRowWrap: gridRowWrap ?? 'none',
    gridColWrap: gridColWrap ?? 'none',
  };
}
