export type StatId = "hp" | "atk" | "def" | "spa" | "spd" | "spe";

export type Stats = Record<StatId, number>;

export type PokemonSet = {
  name: string;
  species: string;
  item: string;
  ability: string;
  nature: string;
  level: number;
  teraType?: string;
  evs: Stats;
  ivs: Stats;
  moves: string[];
};

export type Team = PokemonSet[];

export type FieldState = {
  weather: "" | "Sun" | "Rain" | "Sand" | "Snow";
  terrain: "" | "Electric" | "Grassy" | "Misty" | "Psychic";
  attackerStealthRock: boolean;
  attackerSpikes: number;
  defenderStealthRock: boolean;
  defenderSpikes: number;
  defenderReflect: boolean;
  defenderLightScreen: boolean;
  defenderAuroraVeil: boolean;
};

export type DamageSummary = {
  move: string;
  min: number;
  max: number;
  minPct: number;
  maxPct: number;
  ko: string;
  description: string;
};

export type Matchup = {
  attacker: PokemonSet;
  defender: PokemonSet;
  moves: DamageSummary[];
  best?: DamageSummary;
};
