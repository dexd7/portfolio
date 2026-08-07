# Portfolio Website

Personal site for Vihaan Sarin, built with Next.js 15 and TypeScript. Not a template pulled off the shelf and skinned, everything from the motion system to the content model was built from scratch for this project.

Live thesis of the site: "I build systems that turn noise into signal." The whole design language tries to back that up, a WebGL particle field on the homepage that behaves like signal resolving out of noise, and a shared "Resolve" animation primitive used everywhere content enters the screen.

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript, strict mode
- Tailwind CSS v4
- Zod for content validation
- React Three Fiber / Three.js for the homepage background

There's no test suite here. Verification is typecheck + build + a manual pass in the browser.

## What's actually in here

- **Design tokens as a single source of truth.** Colors, type scale, motion durations and easing curves all live in `data/theme.config.ts`. A script (`scripts/generate-tokens.ts`) turns that into CSS variables at build time, so nothing is hardcoded twice.
- **A content model, not hardcoded JSX.** Projects, experience, education, skills, and the "now" section all live in `data/*.ts` as plain TypeScript objects, validated against Zod schemas before every build. Case study intros are MDX, rendered server-side.
- **One motion primitive, reused everywhere.** `components/primitives/Resolve.tsx` is the site's signature entrance animation (blur to sharp, offset to settled). Instead of writing new animations for every new interaction, existing ones get extended, click-triggered reveals reuse the same primitive as scroll-triggered ones.
- **A WebGL background on the homepage** (`components/visual/ResolveField*.tsx`) - a deterministic node/line field that reacts to cursor movement, with a static CSS fallback for reduced-motion and save-data users.
- **An inline accordion for project details** instead of separate case study pages or a modal. Simpler, lighter, and it turned out to work better than the fancier version did.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:3000`. A few things happen automatically before dev/build:

- `scripts/generate-tokens.ts` writes `app/generated-tokens.css` from the theme config
- `scripts/validate-content.ts` checks all content files against their schemas before a production build

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (runs content generation + validation first) |
| `npm run start` | Serve the production build |
| `npm run typecheck` | TypeScript check, no emit |
| `npm run lint` | Next.js lint |

## Project structure

```
app/            routes (App Router)
components/     UI, split by primitives / sections / work / visual
data/           content + schema + theme config
hooks/          shared client hooks
lib/            utilities, MDX handling
scripts/        token generation, content validation
```

## Notes

This is a living project, most features here went through multiple rounds of "build it, look at it, throw it out, try again" rather than one long planning pass upfront. Some things were tried and deliberately reverted (a modal for project details, framer-motion for the accordion, a flame/glow effect on the background particles) because they added weight or complexity without actually making the site better. The reasoning for those calls is documented in code comments where it matters.
