# Pokemon Team Lab

A GitHub-ready 6v6 Pokemon matchup workspace built with Next.js, React, TypeScript, and the official Smogon `@smogon/calc` package.

## What works in this initial model

- 6v6 vs 6v6 team workspace
- Showdown-style team paste import
- Showdown-style team export
- 6x6 matchup matrix
- Click any matchup to inspect every move on the attacking set
- Damage ranges and percentage ranges from `@smogon/calc`
- Nature / EV / IV / item / ability / level / Tera support in the set model
- Field controls for weather, terrain, Stealth Rock, Spikes, Reflect, Light Screen, Aurora Veil
- Move explorer that attempts to enumerate the current Smogon calc data; it falls back to a curated starter catalog if the installed data layer does not expose enumeration
- Basic threat/answer summary
- Fully client-side/static architecture
- GitHub Pages deployment workflow

## Requirements

- Node.js 20+ recommended
- npm

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production build

```bash
npm run build
```

The static site is emitted to `out/`.

## GitHub Pages

The included workflow at `.github/workflows/deploy.yml` builds and deploys the static `out/` directory to GitHub Pages.

The workflow automatically sets:

```text
NEXT_PUBLIC_BASE_PATH=/<repository-name>
```

So a repository named `pokemon-team-lab` will work at:

```text
https://<username>.github.io/pokemon-team-lab/
```

In the repository settings, enable GitHub Pages with **GitHub Actions** as the source.

## Vercel

This project is also compatible with Vercel. For Vercel, no base path is needed; just import the repository and deploy.

## Important architecture note

The app deliberately does not bundle `pokemon-showdown` just to parse teams. The Showdown export format is small enough to parse locally, and keeping the initial client bundle focused makes this easier to host as a static site.

For future battle/replay integration, use Showdown's documented protocol rather than DOM scraping.

## Data / attribution

The calculator is powered by `@smogon/calc`, the package maintained in the Smogon `damage-calc` repository.

Showdown-style team import/export follows the public Pokemon Showdown team format.

This project is an independent interface and is not affiliated with or endorsed by Smogon or Pokemon Showdown.

## Next planned layers

1. Set legality and format selection
2. Complete species/move/item editors
3. Usage-stat priors
4. Speed-tier analysis
5. Threat ranking and overloaded-answer detection
6. Opponent-set inference from observed battle information
7. Replay import
8. Optional live battle protocol integration
