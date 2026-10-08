import { Generations } from "@smogon/calc";

const STARTER_MOVES = [
  "Earthquake", "Close Combat", "Headlong Rush", "Knock Off", "U-turn",
  "Stealth Rock", "Rapid Spin", "Swords Dance", "Sucker Punch", "Kowtow Cleave",
  "Iron Head", "Wood Hammer", "Grassy Glide", "Draco Meteor", "Shadow Ball",
  "Flamethrower", "Make It Rain", "Focus Blast", "Nasty Plot", "Future Sight",
  "Scald", "Salt Cure", "Recover", "Protect", "Iron Defense", "Quiver Dance",
  "Fiery Dance", "Bug Buzz", "Giga Drain", "Ivy Cudgel", "Horn Leech",
  "Moonblast", "Thunderbolt", "Encore", "Body Press", "Roost", "Defog",
  "Surf", "Hydro Pump", "Ice Beam", "Ice Spinner", "Stone Edge", "Crunch",
  "Play Rough", "Drain Punch", "Mach Punch", "Aqua Jet", "Brave Bird",
  "Hurricane", "Psychic", "Psyshock", "Energy Ball", "Volt Switch",
  "Thunder Wave", "Will-O-Wisp", "Toxic", "Taunt", "Substitute", "Roar",
  "Whirlwind", "Leech Seed", "Spikes", "Toxic Spikes", "Trick", "Encore",
  "Dragon Dance", "Calm Mind", "Bulk Up", "Nasty Plot", "Agility",
];

export function getMoveLibrary(): string[] {
  try {
    const gen = Generations.get(9) as unknown as Record<string, unknown>;
    const moves = gen.moves as unknown;
    const table = moves as {
      all?: () => unknown[];
      getAll?: () => unknown[];
    };

    const raw = typeof table.all === "function"
      ? table.all()
      : typeof table.getAll === "function"
        ? table.getAll()
        : [];

    const names = raw
      .map(item => typeof item === "string" ? item : (item as { name?: string })?.name)
      .filter((name): name is string => Boolean(name));

    return Array.from(new Set([...names, ...STARTER_MOVES])).sort((a, b) => a.localeCompare(b));
  } catch {
    return [...STARTER_MOVES].sort((a, b) => a.localeCompare(b));
  }
}
