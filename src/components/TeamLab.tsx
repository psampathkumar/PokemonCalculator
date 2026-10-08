"use client";

import { useMemo, useState } from "react";
import { sampleTeamA, sampleTeamB } from "../lib/sample-data";
import { calculateMove } from "../lib/calc";
import { exportTeam } from "../lib/team-parser";
import { FieldState, Matchup, Team } from "../lib/types";
import TeamPastePanel from "./TeamPastePanel";
import TeamColumn from "./TeamColumn";
import MatchupMatrix from "./MatchupMatrix";
import MatchupDetails from "./MatchupDetails";
import FieldPanel from "./FieldPanel";
import MoveExplorer from "./MoveExplorer";
import ThreatSummary from "./ThreatSummary";

const DEFAULT_FIELD: FieldState = {
  weather: "",
  terrain: "",
  attackerStealthRock: false,
  attackerSpikes: 0,
  defenderStealthRock: false,
  defenderSpikes: 0,
  defenderReflect: false,
  defenderLightScreen: false,
  defenderAuroraVeil: false,
};

export default function TeamLab() {
  const [left, setLeft] = useState<Team>(sampleTeamA);
  const [right, setRight] = useState<Team>(sampleTeamB);
  const [leftSelected, setLeftSelected] = useState(0);
  const [rightSelected, setRightSelected] = useState(0);
  const [field, setField] = useState<FieldState>(DEFAULT_FIELD);
  const [selected, setSelected] = useState({ row: 0, col: 0 });

  const matchups = useMemo<(Matchup | null)[][]>(() => {
    return left.map(attacker => right.map(defender => {
      const moves = attacker.moves
        .filter(Boolean)
        .map(move => calculateMove(attacker, defender, move, field))
        .filter((value): value is NonNullable<typeof value> => Boolean(value))
        .sort((a, b) => b.maxPct - a.maxPct);

      return { attacker, defender, moves, best: moves[0] };
    }));
  }, [left, right, field]);

  const selectedMatchup = matchups[selected.row]?.[selected.col] || null;

  const importTeam = (side: "left" | "right", team: Team) => {
    const normalized = [...team];
    while (normalized.length < 6) {
      normalized.push({
        name: `Empty Slot ${normalized.length + 1}`,
        species: "Pikachu",
        item: "",
        ability: "",
        nature: "Hardy",
        level: 100,
        teraType: "",
        evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        moves: ["Thunderbolt", "", "", ""],
      });
    }
    if (side === "left") setLeft(normalized.slice(0, 6));
    else setRight(normalized.slice(0, 6));
  };

  const downloadTeam = (team: Team, filename: string) => {
    const blob = new Blob([exportTeam(team)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main>
      <header className="hero">
        <div>
          <span className="eyebrow">BATTLE LAB / INITIAL MODEL</span>
          <h1>Pokemon Team Lab</h1>
          <p>6v6 matchup analysis using the Smogon damage calculator as the calculation engine.</p>
        </div>
        <div className="hero-actions">
          <button onClick={() => downloadTeam(left, "team-a.txt")}>Export A</button>
          <button onClick={() => downloadTeam(right, "team-b.txt")}>Export B</button>
        </div>
      </header>

      <div className="page-grid">
        <aside className="sidebar">
          <TeamColumn title="TEAM A" team={left} selected={leftSelected} onSelect={i => { setLeftSelected(i); setSelected({ row: i, col: rightSelected }); }} />
          <TeamColumn title="TEAM B" team={right} selected={rightSelected} onSelect={i => { setRightSelected(i); setSelected({ row: leftSelected, col: i }); }} />
        </aside>

        <section className="workspace">
          <TeamPastePanel left={left} right={right} onImport={importTeam} />
          <FieldPanel value={field} onChange={setField} />
          <MatchupMatrix
            left={left}
            right={right}
            matchups={matchups}
            selected={selected}
            onSelect={(row, col) => { setSelected({ row, col }); setLeftSelected(row); setRightSelected(col); }}
          />
          <MatchupDetails matchup={selectedMatchup} />
          <MoveExplorer attacker={left[leftSelected]} defender={right[rightSelected]} field={field} />
          <ThreatSummary left={left} right={right} matchups={matchups} />
        </section>
      </div>
    </main>
  );
}
