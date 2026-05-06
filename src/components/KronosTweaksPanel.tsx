import type { Tweaks } from "@/types";
import { TweaksPanel } from "@/tweaks/TweaksPanel";
import { TweakRadio, TweakSection } from "@/tweaks/controls";

type SetTweak = <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => void;

type KronosTweaksPanelProps = {
  tweaks: Tweaks;
  setTweak: SetTweak;
};

export function KronosTweaksPanel({ tweaks, setTweak }: KronosTweaksPanelProps) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Surface">
        <TweakRadio
          label="Theme"
          value={tweaks.theme}
          onChange={v => setTweak("theme", v)}
          options={[
            { value: "light", label: "Paper" },
            { value: "dark",  label: "Slate" },
          ]}
        />
        <TweakRadio
          label="Density"
          value={tweaks.density}
          onChange={v => setTweak("density", v)}
          options={[
            { value: "comfortable", label: "Comfortable" },
            { value: "compact",     label: "Compact" },
          ]}
        />
      </TweakSection>

      <TweakSection label="Typography">
        <TweakRadio
          label="Family pairing"
          value={tweaks.typography}
          onChange={v => setTweak("typography", v)}
          options={[
            { value: "serif-mono", label: "Serif + sans" },
            { value: "mono",       label: "Mono only" },
            { value: "sans",       label: "Sans neutral" },
          ]}
        />
      </TweakSection>

      <TweakSection label="Timer">
        <TweakRadio
          label="Style on cards"
          value={tweaks.timerStyle}
          onChange={v => setTweak("timerStyle", v)}
          options={[
            { value: "digits", label: "Digits" },
            { value: "bar",    label: "Bar" },
            { value: "radial", label: "Radial" },
          ]}
        />
      </TweakSection>
    </TweaksPanel>
  );
}
