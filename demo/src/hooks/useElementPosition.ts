import { useCallback, useLayoutEffect, useState } from "react";
import { useCurrentScale } from "remotion";

/**
 * Measures an element's center in composition coordinates.
 * Works when there is no camera transform on the parent
 * (i.e. ShortDemo scenes). For camera-transformed scenes
 * use the layout.ts computed targets instead.
 */
export function useElementPosition(
  containerRef: React.RefObject<HTMLElement | null>,
  elRef: React.RefObject<HTMLElement | null>
): { x: number; y: number } | null {
  const scale = useCurrentScale();
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const el = elRef.current;
    if (!container || !el) return;

    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();

    setPos({
      x: (eRect.left - cRect.left + eRect.width / 2) / scale,
      y: (eRect.top - cRect.top + eRect.height / 2) / scale,
    });
  }, [containerRef, elRef, scale]);

  useLayoutEffect(() => {
    // Measure immediately + on next frame (for FadeIn settling)
    measure();
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [measure]);

  return pos;
}
