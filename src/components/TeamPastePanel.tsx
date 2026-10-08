"use client";

import { useState } from "react";
import { exportTeam, parseTeamPaste } from "../lib/team-parser";
import { Team } from "../lib/types";

type Props = {
  left: Team;
  right: Team;
  onImport: (side: "left" | "right", team: Team) => void;
};

export default function TeamPastePanel({ left, right, onImport }: Props) {
  const [side, setSide] = useState<"left" | "right">("left");
  const [text, setText] = useState(() => exportTeam(left));

  const load = (nextSide: "left" | "right") => {
    setSide(nextSide);
    setText(exportTeam(nextSide === "left" ? left : right));
  };

  const importNow = () => {
    const parsed = parseTeamPaste(text);
    if (!parsed.length) return;
    onImport(side, parsed);
  };

  return (
    <section className="panel paste-panel">
      <div className="panel-title-row">
        <div>
          <h2>Team import / export</h2>
          <p>Paste a standard Pokémon Showdown team here.</p>
        </div>
        <div className="segmented">
          <button className={side === "left" ? "active" : ""} onClick={() => load("left")}>Team A</button>
          <button className={side === "right" ? "active" : ""} onClick={() => load("right")}>Team B</button>
        </div>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} spellCheck={false} />
      <div className="button-row">
        <button className="primary" onClick={importNow}>Import into {side === "left" ? "Team A" : "Team B"}</button>
        <button onClick={() => navigator.clipboard?.writeText(text)}>Copy paste</button>
      </div>
    </section>
  );
}
