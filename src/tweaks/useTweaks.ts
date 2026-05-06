import { useCallback, useState } from "react";

type SetTweak<T> = {
  <K extends keyof T>(key: K, value: T[K]): void;
  (edits: Partial<T>): void;
};

export function useTweaks<T extends Record<string, unknown>>(
  defaults: T,
): [T, SetTweak<T>] {
  const [values, setValues] = useState<T>(defaults);

  const setTweak = useCallback(((keyOrEdits: unknown, val?: unknown) => {
    const edits = (typeof keyOrEdits === "object" && keyOrEdits !== null)
      ? (keyOrEdits as Partial<T>)
      : ({ [keyOrEdits as string]: val } as Partial<T>);
    setValues(prev => ({ ...prev, ...edits }));
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits }, "*");
  }) as SetTweak<T>, []);

  return [values, setTweak];
}
