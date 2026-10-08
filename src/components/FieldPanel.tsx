"use client";

import { FieldState } from "../lib/types";

type Props = { value: FieldState; onChange: (next: FieldState) => void };

export default function FieldPanel({ value, onChange }: Props) {
  const set = <K extends keyof FieldState>(key: K, next: FieldState[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <section className="panel">
      <div className="panel-title-row">
        <div>
          <h2>Battle field</h2>
          <p>These conditions feed directly into the damage calculations.</p>
        </div>
      </div>
      <div className="field-grid">
        <label>Weather
          <select value={value.weather} onChange={e => set("weather", e.target.value as FieldState["weather"])}>
            <option value="">None</option><option>Sun</option><option>Rain</option><option>Sand</option><option>Snow</option>
          </select>
        </label>
        <label>Terrain
          <select value={value.terrain} onChange={e => set("terrain", e.target.value as FieldState["terrain"])}>
            <option value="">None</option><option>Electric</option><option>Grassy</option><option>Misty</option><option>Psychic</option>
          </select>
        </label>
        <label>Defender Reflect <input type="checkbox" checked={value.defenderReflect} onChange={e => set("defenderReflect", e.target.checked)} /></label>
        <label>Defender Light Screen <input type="checkbox" checked={value.defenderLightScreen} onChange={e => set("defenderLightScreen", e.target.checked)} /></label>
        <label>Defender Aurora Veil <input type="checkbox" checked={value.defenderAuroraVeil} onChange={e => set("defenderAuroraVeil", e.target.checked)} /></label>
        <label>Defender Stealth Rock <input type="checkbox" checked={value.defenderStealthRock} onChange={e => set("defenderStealthRock", e.target.checked)} /></label>
        <label>Defender Spikes
          <select value={value.defenderSpikes} onChange={e => set("defenderSpikes", Number(e.target.value))}>
            <option value={0}>0</option><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
          </select>
        </label>
        <label>Attacker Stealth Rock <input type="checkbox" checked={value.attackerStealthRock} onChange={e => set("attackerStealthRock", e.target.checked)} /></label>
      </div>
    </section>
  );
}
