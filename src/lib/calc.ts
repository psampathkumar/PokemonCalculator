import { calculate, Generations, Move, Pokemon, Field } from "@smogon/calc";
import { FieldState, PokemonSet, DamageSummary } from "./types";

const gen = Generations.get(9);

function makePokemon(set: PokemonSet) {
  return new Pokemon(gen, set.species, {
    item: set.item || undefined,
    ability: set.ability || undefined,
    nature: set.nature || undefined,
    level: set.level || 100,
    teraType: set.teraType || undefined,
    evs: set.evs,
    ivs: set.ivs,
  });
}

function makeField(state: FieldState) {
  return new Field({
    weather: state.weather || undefined,
    terrain: state.terrain || undefined,
    attackerSide: {
      isSR: state.attackerStealthRock,
      spikes: state.attackerSpikes,
    },
    defenderSide: {
      isSR: state.defenderStealthRock,
      spikes: state.defenderSpikes,
      isReflect: state.defenderReflect,
      isLightScreen: state.defenderLightScreen,
      isAuroraVeil: state.defenderAuroraVeil,
    },
  });
}

function flattenNumbers(value: unknown): number[] {
  if (typeof value === "number") return [value];
  if (Array.isArray(value)) return value.flatMap(flattenNumbers);
  return [];
}

export function calculateMove(
  attacker: PokemonSet,
  defender: PokemonSet,
  moveName: string,
  fieldState: FieldState,
): DamageSummary | null {
  if (!moveName.trim()) return null;

  try {
    const attackerPokemon = makePokemon(attacker);
    const defenderPokemon = makePokemon(defender);
    const move = new Move(gen, moveName);
    const field = makeField(fieldState);
    const result = calculate(gen, attackerPokemon, defenderPokemon, move, field);

    const values = flattenNumbers((result as unknown as { damage?: unknown }).damage);
    if (!values.length) {
      return {
        move: moveName,
        min: 0,
        max: 0,
        minPct: 0,
        maxPct: 0,
        ko: "No damage",
        description: `${moveName} has no damaging result in this state.`,
      };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const maxHp = defenderPokemon.maxHP();
    const minPct = (min / maxHp) * 100;
    const maxPct = (max / maxHp) * 100;

    return {
      move: moveName,
      min,
      max,
      minPct,
      maxPct,
      ko: koLabel(minPct, maxPct),
      description: safeDescription(result, moveName),
    };
  } catch {
    return null;
  }
}

function safeDescription(result: unknown, fallback: string) {
  const candidate = result as { desc?: () => string };
  try {
    return typeof candidate.desc === "function" ? candidate.desc() : fallback;
  } catch {
    return fallback;
  }
}

function koLabel(minPct: number, maxPct: number) {
  if (minPct >= 100) return "OHKO";
  if (maxPct >= 100) return "Possible OHKO";
  if (minPct >= 50) return "2HKO";
  if (minPct >= 33.4) return "3HKO";
  if (minPct >= 25) return "4HKO";
  return "Not a clean 4HKO";
}
