# Pokemon Team Lab

A GitHub-ready Next.js static web app for 6v6 Pokémon matchup analysis using `@smogon/calc`.

-- 6v6 vs 6v6 team workspace
-- Showdown-style team paste import
-- Showdown-style team export
-- 6x6 matchup matrix
-- Click any matchup to inspect every move on the attacking set
-- Damage ranges and percentage ranges from `@smogon/calc`
-- Nature / EV / IV / item / ability / level / Tera support in the set model
-- Field controls for weather, terrain, Stealth Rock, Spikes, Reflect, Light Screen, Aurora Veil
-- Move explorer that attempts to enumerate the current Smogon calc data; it falls back to a curated starter catalog if the installed data layer does not expose enumeration
-- Basic threat/answer summary
-- Fully client-side/static architecture
-- GitHub Pages deployment workflow


## What is fixed in v0.2.0

- Corrected all React client-component directives.
- Narrowed Tera types before passing them to `@smogon/calc`, avoiding GitHub's strict TypeScript error.
- Added type-safe handling around the current calculator API.
- Added a calculation cache so repeated matchup calculations are reused.
- Added deferred rendering for the 36-cell matchup matrix so field controls stay responsive.
- Stealth Rock and Spikes now affect the displayed KO percentage through entry-hazard HP loss.
- Raw move damage percentage is still shown separately.
- Heavy-Duty Boots and Magic Guard prevent the modeled entry-hazard damage.
- Spikes only apply to grounded targets.
- Move Explorer now automatically recalculates when its selected move, field, attacker, or defender changes.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js.

For a production/static build:

```bash
npm run build
```

The static output is written to `out/`.

## GitHub Pages

This repository includes:

```text
.github/workflows/deploy.yml
```

Push the repository to GitHub, then in:

**Settings → Pages → Build and deployment → Source → GitHub Actions**

The workflow installs dependencies, builds the static site, and deploys `out/`.

## Important calculator behavior

`@smogon/calc` calculates the damage of a move against the supplied field state. Entry hazards are represented as side state in the calculator, but their switch-in HP loss is not itself returned as the move's `damage` array. This app therefore calculates the Gen 9 singles entry-hazard HP loss separately and uses the remaining HP for its hazard-adjusted KO percentage.

The current model is intentionally an initial 6v6 singles lab. It does not yet simulate an entire battle turn-by-turn.
