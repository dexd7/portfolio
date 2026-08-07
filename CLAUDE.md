# CLAUDE.md

Guidance for Claude Code (and future sessions) working in this repo — Vihaan Sarin's portfolio site.

## Stack

Next.js 15 (App Router) + TypeScript (strict) + Tailwind v4 + Zod. React 19. No test suite — verification is `typecheck` + `build` + manual browser check.

## Workflow (always, after any change)

```
npm run typecheck
rm -rf .next && npm run build   # background it (takes >2min); poll, don't sleep-loop
pkill -f "next dev"             # exits 144 — expected, not an error
ps aux | grep "next dev"        # confirm nothing stray survived
npm run dev                     # background it, wait for "Ready in X.Xs"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/<route>
```

`predev`/`prebuild` run `scripts/generate-tokens.ts` automatically (writes `app/generated-tokens.css` from `data/theme.config.ts`) and `prebuild` also runs `scripts/validate-content.ts` (validates `data/*.ts` against `data/schema.ts`). Both must pass for a build to succeed.

There is no headless-browser/screenshot capability in this environment — after a build+dev-server check confirms the route renders, say so explicitly and ask the user to verify visually/interactively, especially for anything scroll-, touch-, or animation-related. Never claim an animation "looks right" without them confirming.

## Design tokens — single source of truth

`data/theme.config.ts` defines colors, type scale, motion durations/easings, layout, radius. `scripts/generate-tokens.ts` emits `app/generated-tokens.css` as CSS variables (`--duration-reveal`, `--ease-resolve`, `--color-signal`, `--radius-soft`, etc.) — never hand-edit `generated-tokens.css`, never hardcode a value that already has a token.

Motion vocabulary: `--duration-micro` 120ms, `--duration-ui` 220ms, `--duration-reveal` 520ms, `--duration-scene` 900ms, `--duration-hero-scene` 1400ms. Easings: `--ease-resolve` (entrances), `--ease-settle` (UI state changes), `--ease-exit`.

## The `Resolve` primitive — the site's one motion language

`components/primitives/Resolve.tsx` + `.resolve` in `app/globals.css` is the site's signature entrance: blur(6px)→sharp, offset→settled, opacity 0→1, over `--duration-reveal` with `--ease-resolve`. Two trigger modes:
- Default: scroll-triggered via `useInView` (`threshold: 0.25, once: false` — replays both ways as you scroll past).
- `visible` prop: bypasses the IntersectionObserver, driven directly by external state (e.g. `visible={isOpen}` for a click-triggered reveal). Added specifically so click-triggered UI (accordions) can reuse the exact same visual motif instead of inventing a new one — **prefer extending `Resolve` over writing a new animation** when something needs "the same feel as the rest of the site."

**Hard-won CSS lesson**: the resolved (`data-visible='true'`) state must use `filter: none` / `transform: none` / `will-change: auto` — *not* the zero-equivalent values (`blur(0px)`, `translateY(0) scale(1)`, and no removal of `will-change`). A zero filter or identity transform still establishes a compositing layer, and content that changes *inside* that layer afterward can fail to repaint on mobile Safari/Chrome until something forces a repaint (e.g. scrolling) — this caused a real "blank until you scroll" bug. Always release the layer once settled.

## Accordion pattern (`WorkRow` / `WorkAccordion` / `BulletCascade`)

`components/work/WorkAccordion.tsx` holds one shared `expandedSlug` (only one row open at a time) via context; `WorkRow.tsx` is the row; `BulletCascade.tsx` is a plain static bullet list (no animation of its own — it's revealed as part of the row's `Resolve`).

The panel itself is a CSS grid `0fr → 1fr` height trick (`.accordion-panel` in globals.css), not JS height measurement or framer-motion — it animates to the content's real height regardless of length, and the inner `.accordion-panel-inner`'s `min-height: 0` is load-bearing (without it, a grid item defaults to its content's intrinsic height and never truly collapses).

**The transition lives only on `[data-open='true']`, not the base rule.** A CSS transition uses whichever rule is in effect on the state being transitioned *to* — so opening (0fr→1fr, landing on the rule with `transition:`) animates, while closing (1fr→0fr, landing on the base rule with none) snaps instantly. This asymmetry is deliberate: only one panel can be open at a time, so opening a different row closes whichever one was already open. If that close also animated, the previously-open row would spend ~900ms gradually shrinking while the user is already scrolling into the newly-opened one — and a tall panel collapsing above the viewport shifts everything below it upward under a scroll position that doesn't move to compensate, which reads as the new row's content "fast-forwarding" past where the user expected to land. Don't re-add a transition to the base `.accordion-panel` rule without re-solving this.

Opening a row also re-anchors scroll to that row's button (`scrollIntoView({ block: 'start' })`, one `requestAnimationFrame` after the state flip) for the same reason — never rely on the page's natural scroll position surviving an accordion state change, especially on a phone where panel height is large relative to viewport height.

**Scroll-triggered `Resolve` + tall expandable content don't mix without care.** `WorkRow`'s outer `Resolve` uses `visible={isOpen ? true : undefined}` — while a row's accordion is open, its own bounding box includes the whole expanded panel, which can be far taller than the viewport on mobile. Scrolling through the middle of it can drop the visible fraction below the 25% threshold `Resolve` normally re-hides at, fading the *entire open row* to blur/offset/opacity-0 mid-scroll. Forcing `visible=true` while open bypasses that; closed rows keep the normal scroll-linked fade.

**Do not reach for a modal, framer-motion, or a scroll-lock/scroll-gated reveal for this component again** — all three were tried and reverted this project. A portaled `ProjectModal` (framer-motion, backdrop-blur, scroll-gating the panel's own scroll container) added real weight (`/work`'s JS payload: 47.9kB → 2.92kB after removing it) for content that reads fine as a plain inline accordion. A scroll-position-mapped/wheel-gated bullet cascade was also tried and reverted — it's fragile on trackpad/touch and not worth the complexity for a handful of bullet points. The current answer is deliberately simple: one CSS grid expand + one `Resolve` reveal for the whole panel.

## Touch/hover gating — do this whenever hover state drives visible UI

`components/sections/CrossHighlight.tsx`'s `setHovered` is a no-op unless `window.matchMedia('(hover: hover) and (pointer: fine)').matches` (computed once via a lazy `useState` initializer). Touch devices fire synthetic `mouseenter`/`mouseleave`/`focus` on tap, which can stick a hover-driven effect on or cause it to fight other animations — this is the same reasoning `components/visual/ResolveField.tsx` uses for its cursor-proximity push (`pointerEnabled` gate). **Any new hover-driven visual effect must be gated the same way** or it will misbehave on mobile.

## `ResolveField` (WebGL background, homepage only)

`components/visual/ResolveField.tsx` → dynamically imports `ResolveFieldCanvas.tsx` (R3F Canvas) → `ResolveFieldPoints.tsx` (the actual node/line simulation) → `resolveFieldGeometry.ts` (seeded, deterministic node data as flat `Float32Array`s, not objects — the frame loop touches every field of every node every frame, and typed arrays avoid pointer-chasing at that rate).

- `position: fixed`, direct child of `<main>`, **must never be nested inside anything with `transform`/`will-change`/`filter`** (a `Resolve`, a transformed wrapper) — such an ancestor becomes the containing block for the `fixed` descendant and silently breaks full-viewport positioning.
- Cursor interaction is momentum/impulse-based, never a spring-back-to-target model: a push adds acceleration to a node's own velocity, which decays on its own schedule (`DAMPING_RATE`) — nothing ever pulls a node back "home." Physics tuning constants (`PUSH_ACCEL`, `MAX_IMPULSE_SPEED`, `REPEL_RADIUS`, `DAMPING_RATE`) have comments explaining the reasoning; read them before changing.
- A cursor-proximity "flame"/flicker glow effect (per-node color blending toward white/accent based on distance + a fast per-node sine flicker) was tried and **removed** — the user found it distracting ("way cleaner when they were static"). Node color is now computed once (depth + theme, written directly into the GPU color buffer) and never touches the per-frame loop. Don't re-add per-frame color modulation without being asked.
- Bloom post-processing was tried and removed (expensive, no visible payoff against this palette).
- Reduced-motion / Save-Data users get `HeroMotif.tsx` (a static CSS-only dot field) permanently instead of the GL scene.

## `Counter.tsx` — never `setState` in a rAF/scroll loop

Project-wide rule, several times reinforced this session: a `requestAnimationFrame` loop (or scroll/pointer listener) must write directly to refs/DOM, never call `setState` every tick — that forces a React re-render every ~16ms for the animation's whole duration, which competes with any other concurrent animation for main-thread time. `Counter.tsx` (metrics count-up) writes to `span.textContent` directly during the loop and only calls `setState` once, at the end, for a correct no-JS/reduced-motion render. `ResolveField`'s pointer/scroll tracking follows the same rule (ref written in a passive listener, read once per frame).

## Mobile-specific fixes already made (don't regress these)

- `CopyEmail.tsx`: email sizes down (`text-h2 sm:text-display-l`) + `break-all` — the full email at `text-display-l`'s clamp floor (48px) overflowed a 375px viewport.
- `app/globals.css` `body`: `overflow-x: hidden` — several entrance animations rest a few px past the viewport edge by design (harmless on desktop's wide margins, a real horizontal scrollbar on narrow phones). Doesn't affect `position: fixed` content or break anything, since nothing in this codebase uses `position: sticky`.
- `app/page.tsx`: the About section's portrait uses `order-first lg:order-none` on its `Resolve` wrapper so it renders above the text on mobile (the grid is `grid-cols-1` below `lg`, so DOM order is visual order) while keeping the two-column desktop layout unchanged.
- `WorkRow.tsx`'s stacked mobile meta row (stack tags/year/chevron) uses a hidden index-width spacer (`invisible text-label sm:hidden`) instead of a guessed `calc()` padding, so it aligns under the title by construction rather than by eyeballed magic numbers.

## Content model

`data/*.ts` (projects, experience, education, skills, now, site.config) are hand-written TypeScript objects validated against `data/schema.ts` (Zod) by `scripts/validate-content.ts`. MDX case-study intros live alongside and are rendered server-side via `next-mdx-remote/rsc` (`lib/mdx.ts`) — never touched client-side.

## Coding style — match this

Observed directly from this project's own code and from how changes actually got made this session:

- **Comments explain WHY, never WHAT.** Every non-trivial comment in this codebase cites a *reason* — a constraint, a bug that was hit, a spec quirk, a tradeoff — never a restatement of the code below it. E.g. "min-height: 0 is load-bearing — without it a grid item defaults to its content's intrinsic height," not "this sets the min height to 0." Write comments a future reader would need, not ones a linter would.
- **Failed approaches stay documented, not deleted.** When something was tried and reverted (the modal, the flame effect, the scroll-lock cascade, the negative-margin bullet overlap), the replacement's doc comment says so and says why — "a portaled modal was tried instead of this and reverted — it added real weight for content that reads fine inline." This project treats its own history as load-bearing context, not noise to clean up. Keep doing this rather than silently swapping approaches.
- **Prefer CSS over JS, and JS-without-a-library over a library.** framer-motion was added, then fully removed once a CSS-only approach (the `Resolve` primitive + grid `0fr→1fr`) did the same job for less weight. Reach for the platform first; justify a dependency, don't default to one.
- **No new abstraction until the same problem shows up twice, and not even then if a small extension of an existing one works** — `Resolve` grew a `visible` prop instead of a second component being written for click-triggered reveals.
- **Iterate by building and reverting fast, not by exhaustively planning every detail upfront** — several features this session (bullet cascade especially) went through 3-4 concrete rewrites in response to "no, that's not it, try again" rather than one long planning phase. Ship a real attempt, take the correction, move. Reserve actual plan-mode/upfront design for genuinely large or ambiguous changes (a mobile audit, a modal-vs-inline architecture decision) — not for "make the animation smoother."
- **Feedback is terse and concrete** ("fuck the triggering of animations and everything," "that is a bug," "please fix it for mobile") — respond in kind: fix the specific thing, explain the root cause briefly, don't pad with caveats or offer a menu of alternatives unless genuinely blocked on a decision only the user can make.
- **Every visual/animation change gets verified on mobile, not just desktop** — several real bugs this session (hover-stick, blank-until-scroll, scroll-jump-on-switch) only existed on a phone's small viewport / touch input. Treat "does it work on mobile" as part of done, not a follow-up.

## What NOT to do here

- Don't add a modal, portal, or framer-motion for anything that can be done with the existing CSS grid-expand + `Resolve` vocabulary — this was tried for the work accordion and reverted for both weight and correctness reasons (see above).
- Don't add a new animation primitive/library when `Resolve` (or a small extension to it, like the `visible` prop) can express the same motion.
- Don't skip the mobile check. Several bugs this session (hover-stick glitches, blank-until-scroll, scroll-jump-on-switch) only manifested on a phone's small viewport / touch input and were invisible in reasoning about desktop behavior alone.
