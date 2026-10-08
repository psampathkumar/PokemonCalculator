"use client";

import { Matchup } from "../lib/types";

export default function MatchupDetails({ matchup }: { matchup: Matchup | null }) {
  if (!matchup) {
    return <section className="panel details-panel empty"><h2>Select a matchup</h2><p>Click a cell in the matrix to inspect the complete move-by-move calculation.</p></section>;
  }

  return (
    <section className="panel details-panel">
      <div className="panel-title-row">
        <div>
          <span className="eyebrow">{matchup.attacker.name} → {matchup.defender.name}</span>
          <h2>Move-by-move damage</h2>
        </div>
      </div>
      <div className="details-list">
        {matchup.moves.length ? matchup.moves.map(move => (
          <article className="damage-row" key={move.move}>
            <div className="damage-head">
              <strong>{move.move}</strong>
              <span>{move.ko}</span>
            </div>
            <div className="bar"><i style={{ width: `${Math.min(move.maxPct, 100)}%` }} /></div>
            <div className="damage-values">
              <span>{move.min}–{move.max} HP</span>
              <span>{move.minPct.toFixed(1)}–{move.maxPct.toFixed(1)}%</span>
            </div>
            <code>{move.description}</code>
          </article>
        )) : <p>No valid damaging moves were found on the current set.</p>}
      </div>
    </section>
  );
}
