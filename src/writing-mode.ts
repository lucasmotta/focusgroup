import type { FocusgroupConfig, DirectionMap } from "./types.js";

/**
 * Resolve logical directions (inline/block) to physical arrow keys
 * based on the container's writing mode and text direction.
 */
export function resolveDirectionMap(
  container: HTMLElement,
  config: FocusgroupConfig,
): DirectionMap {
  const style = getComputedStyle(container);
  const writingMode = style.writingMode || "horizontal-tb";
  const direction = style.direction || "ltr";

  const { inlineForward, inlineBackward, blockForward, blockBackward } = getPhysicalDirections(
    writingMode,
    direction,
  );

  const forward: string[] = [];
  const backward: string[] = [];

  if (config.direction === "inline" || config.direction === "both") {
    forward.push(inlineForward);
    backward.push(inlineBackward);
  }

  if (config.direction === "block" || config.direction === "both") {
    forward.push(blockForward);
    backward.push(blockBackward);
  }

  return { forward, backward };
}

interface PhysicalDirections {
  inlineForward: string;
  inlineBackward: string;
  blockForward: string;
  blockBackward: string;
}

function getPhysicalDirections(writingMode: string, direction: string): PhysicalDirections {
  switch (writingMode) {
    case "vertical-rl":
    case "sideways-rl":
      return {
        inlineForward: "ArrowDown",
        inlineBackward: "ArrowUp",
        blockForward: "ArrowLeft",
        blockBackward: "ArrowRight",
      };

    case "vertical-lr":
    case "sideways-lr":
      return {
        inlineForward: "ArrowDown",
        inlineBackward: "ArrowUp",
        blockForward: "ArrowRight",
        blockBackward: "ArrowLeft",
      };

    case "horizontal-tb":
    default:
      if (direction === "rtl") {
        return {
          inlineForward: "ArrowLeft",
          inlineBackward: "ArrowRight",
          blockForward: "ArrowDown",
          blockBackward: "ArrowUp",
        };
      }
      return {
        inlineForward: "ArrowRight",
        inlineBackward: "ArrowLeft",
        blockForward: "ArrowDown",
        blockBackward: "ArrowUp",
      };
  }
}
