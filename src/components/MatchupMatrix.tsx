"use client";

import { Matchup } from "../lib/types";

type Props = {
  left: { name: string }[];
  right: { name: string }[];
  matchups: (Matchup | null)[][];
  selected: { row: number; col: number } | null;
  onSelect: (row: number, col: number) => void;
};

export default function MatchupMatrix({ left, right, matchups, selected, onSelect }: Props) {
  return (
    <section className="panel matrix-panel">
      <div className="panel-title-row">
        <div>
          <h2>6 × 6 matchup matrix</h2>
          <p>Rows attack. Columns defend. Each cell shows the strongest move on the current set.</p>
        </div>
      </div>
      <div className="matrix-scroll">
        <table className="matrix">
          <thead>
            <tr>
              <th className="corner">A ↓ / B →</th>
              {right.map((poke, col) => <th key={col}>{col + 1}<span>{poke.name}</span></th>)}
            </tr>
          </thead>
          <tbody>
            {left.map((poke, row) => (
              <tr key={row}>
                <th>{row + 1}<span>{poke.name}</span></th>
                {right.map((_, col) => {
                  const item = matchups[row]?.[col];
                  const best = item?.best;
                  const active = selected?.row === row && selected?.col === col;
                  return (
                    <td key={col}>
                      <button className={`matrix-cell ${active ? "active" : ""}`} onClick={() => onSelect(row, col)}>
                        {best ? (
                          <>
                            <strong>{best.maxPct.toFixed(0)}%</strong>
                            <small>{best.move}</small>
                            <em>{best.ko}</em>
                          </>
                        ) : <span>—</span>}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
