import { useEffect, useReducer } from "react";

export function useTicker(active: boolean, intervalMs = 1000): void {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(force, intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
}
