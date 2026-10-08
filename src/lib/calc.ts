import { calculate, Generations, Move, Pokemon, Field, TYPE_CHART } from "@smogon/calc";
import { DamageSummary, FieldState, PokemonSet, StatId } from "./types";

const gen = Generations.get(9);

const TYPE_NAMES = [
  "Normal", "Fighting", "Flying", "Poison", "Ground", "Rock", "Bug", "Ghost",
  "Steel", "Fire", "Water", "Grass", "Electric", "Psychic", "Ice", "Dragon",
  "Dark", "Fairy", "Stellar", "???",
] as const;

type CalcType = typeof TYPE_NAMES[number];

const isCalcType = (value: string): value is CalcType =>
  (TYPE_NAMES as readonly string[]).includes(value);

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function resolveCalcType(value?: string): CalcType | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return isCalcType(trimmed) ? trimmed : undefined;
}

function makePokemon(set: PokemonSet) {
  return new Pokemon(gen, set.species, {
    item: set.item.trim() || undefined,
    ability: set.ability.trim() || undefined,
    nature: set.nature.trim() || undefined,
    level: set.level || 100,
    teraType: resolveCalcType(set.teraType),
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

function hasItem(set: PokemonSet, item: string) {
  return normalize(set.item) === normalize(item);
}

function hasAbility(set: PokemonSet, ability: string) {
  return normalize(set.ability) === normalize(ability);
}

function isGroundedForHazards(set: PokemonSet, pokemon: Pokemon) {
  if (pokemon.types.includes("Flying")) return false;
  if (hasAbility(set, "Levitate")) return false;
  if (hasItem(set, "Air Balloon")) return false;
  return true;
}

function stealthRockMultiplier(pokemon: Pokemon) {
  return pokemon.types.reduce((multiplier, type) => {
    return multiplier * (TYPE_CHART[9].Rock?.[type] ?? 1);
  }, 1);
}

/**
 * Entry hazards are not part of the raw move damage value returned by
 * @smogon/calc. We model the switch-in HP loss separately so the UI can
 * answer questions such as "does this become a KO after Rocks?"
 *
 * This intentionally models Gen 9 singles entry hazards only:
 * - Heavy-Duty Boots prevents both hazards.
 * - Magic Guard prevents the damage.
 * - Stealth Rock uses the Rock effectiveness chart.
 * - Spikes require the target to be grounded.
 */
function getEntryHazardDamage(set: PokemonSet, pokemon: Pokemon, field: FieldState) {
  if (hasItem(set, "Heavy-Duty Boots") || hasAbility(set, "Magic Guard")) {
    return 0;
  }

  let damage = 0;
  const maxHp = pokemon.maxHP();

  if (field.defenderStealthRock) {
    const multiplier = stealthRockMultiplier(pokemon);
    damage += Math.max(1, Math.floor(maxHp * multiplier / 8));
  }

  if (field.defenderSpikes > 0 && isGroundedForHazards(set, pokemon)) {
    const fraction =
      field.defenderSpikes === 1 ? 1 / 8 :
      field.defenderSpikes === 2 ? 1 / 6 :
      1 / 4;
    damage += Math.max(1, Math.floor(maxHp * fraction));
  }

  return Math.min(damage, Math.max(0, maxHp - 1));
}

function cacheKey(
  attacker: PokemonSet,
  defender: PokemonSet,
  moveName: string,
  fieldState: FieldState,
) {
  return JSON.stringify([attacker, defender, moveName, fieldState]);
}

const CACHE_LIMIT = 1500;
const calculationCache = new Map<string, DamageSummary | null>();

function getCached(key: string) {
  const cached = calculationCache.get(key);
  if (cached !== undefined) {
    calculationCache.delete(key);
    calculationCache.set(key, cached);
  }
  return cached;
}

function setCached(key: string, value: DamageSummary | null) {
  calculationCache.set(key, value);
  if (calculationCache.size > CACHE_LIMIT) {
    const oldest = calculationCache.keys().next().value;
    if (oldest) calculationCache.delete(oldest);
  }
  return value;
}

export function calculateMove(
  attacker: PokemonSet,
  defender: PokemonSet,
  moveName: string,
  fieldState: FieldState,
): DamageSummary | null {
  if (!moveName.trim()) return null;

  const key = cacheKey(attacker, defender, moveName, fieldState);
  const cached = getCached(key);
  if (cached !== undefined) return cached;

  try {
    const attackerPokemon = makePokemon(attacker);
    const defenderPokemon = makePokemon(defender);
    const move = new Move(gen, moveName);
    const field = makeField(fieldState);
    const result = calculate(gen, attackerPokemon, defenderPokemon, move, field);

    const values = flattenNumbers((result as unknown as { damage?: unknown }).damage);
    if (!values.length) {
      return setCached(key, {
        move: moveName,
        min: 0,
        max: 0,
        minPct: 0,
        maxPct: 0,
        rawMinPct: 0,
        rawMaxPct: 0,
        effectiveHp: defenderPokemon.maxHP(),
        entryHazardDamage: 0,
        entryHazardPct: 0,
        ko: "No damage",
        description: `${moveName} has no damaging result in this state.`,
      });
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const maxHp = defenderPokemon.maxHP();
    const entryHazardDamage = getEntryHazardDamage(defender, defenderPokemon, fieldState);
    const effectiveHp = Math.max(1, maxHp - entryHazardDamage);

    const rawMinPct = (min / maxHp) * 100;
    const rawMaxPct = (max / maxHp) * 100;
    const minPct = (min / effectiveHp) * 100;
    const maxPct = (max / effectiveHp) * 100;
    const entryHazardPct = (entryHazardDamage / maxHp) * 100;

    const hazardText = entryHazardDamage > 0
      ? `Entry hazards remove ${entryHazardDamage} HP (${entryHazardPct.toFixed(1)}%) before this attack.`
      : "No entry-hazard damage is applied before this attack.";

    return setCached(key, {
      move: moveName,
      min,
      max,
      minPct,
      maxPct,
      rawMinPct,
      rawMaxPct,
      effectiveHp,
      entryHazardDamage,
      entryHazardPct,
      ko: koLabel(minPct, maxPct),
      description: `${safeDescription(result, moveName)} ${hazardText}`,
    });
  } catch {
    return setCached(key, null);
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
