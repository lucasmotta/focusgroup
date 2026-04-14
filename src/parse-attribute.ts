import {
  BEHAVIOR_DESCRIPTORS,
  type FocusgroupBehavior,
  type FocusgroupConfig,
  type FocusgroupDirection,
  type WrapMode,
} from './types.js';

const VALID_BEHAVIORS = new Set<string>(Object.keys(BEHAVIOR_DESCRIPTORS));

export function parseAttribute(raw: string): FocusgroupConfig | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed || trimmed === 'none') return null;

  const tokens = trimmed.split(/\s+/);
  const behaviorToken = tokens[0];

  if (!VALID_BEHAVIORS.has(behaviorToken)) return null;

  const behavior = behaviorToken as FocusgroupBehavior;
  const descriptor = BEHAVIOR_DESCRIPTORS[behavior];

  let direction: FocusgroupDirection | null = null;
  let wrap: WrapMode | null = null;
  let memory = true;

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
      // Unknown tokens are ignored per spec
    }
  }

  return {
    behavior,
    direction: direction ?? descriptor.defaultDirection,
    wrap: wrap ?? descriptor.defaultWrap,
    memory,
    raw: trimmed,
  };
}
