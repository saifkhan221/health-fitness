# Rasoi UI Redesign Spec (v2)

The goal: top-tier consumer health-app quality (think Gentler Streak / Cal AI polish), warm and food-friendly, never clinical. Every screen must feel designed, not assembled.

## Non-negotiables

1. **No new npm dependencies.** Vue 3 + Nuxt + Tailwind only.
2. **Dark mode on every surface.** Tailwind `dark:` classes everywhere. Palette below. Never leave a white card unstyled in dark mode.
3. **Icons: `<AppIcon name="..." :size="18" />`** (components/AppIcon.vue). NO emoji anywhere in the UI. Available names: home, calendar, bowl, basket, activity, plus, minus, search, x, chevron-left, chevron-right, trash, flame, rupee, sun, moon, sunrise, apple, coffee, logout, droplet, sparkles, arrow-right, check, wallet, scale.
4. **Keep all existing API contracts, props/emits, data flow, and route paths.** This is a visual/UX rework, not a logic rework. `AddFoodSheet` keeps `slotLabel` prop and `close`/`save` emits.
5. Numbers use class `tnum`. Currency via `formatPaise()`. Slots via `MEAL_SLOTS` (now has `icon`, `color`, `tint`, `hint` fields).
6. Respect `prefers-reduced-motion` (Tailwind `motion-safe:` for animations).

## Tokens (tailwind.config.ts — already updated)

- Surfaces: light `bg-surface-bg` (cream #FAF7F2) page / `bg-surface` cards; dark `dark:bg-surface-bg-dark` (#131110) page / `dark:bg-surface-dark` (#1E1B18) cards, `dark:bg-surface-dark-2` (#282420) nested.
- Text: `text-ink` / `text-ink-muted` / `text-ink-faint`; dark: `dark:text-ink-inverse` / `dark:text-ink-inverse-muted`.
- Borders: `border-line` light, `dark:border-line-dark`.
- Shadows: `shadow-card` (cards), `shadow-lift` (hover/popovers), `shadow-sheet` (bottom sheet); dark cards use `dark:shadow-card-dark` and rely more on borders.
- Radii: `rounded-card` (16px) cards, `rounded-sheet` (24px) sheets/modals, `rounded-xl` buttons, `rounded-full` chips/pills.
- Animations: `motion-safe:animate-slide-up` (sheets), `motion-safe:animate-fade-in` (overlays).
- Type: `font-display` for headings/numbers-as-heroes (Plus Jakarta Sans), `font-sans` (Inter) body. Page titles: `font-display text-2xl font-extrabold tracking-tight`.

## Shared component recipes

- **Card**: `rounded-card border border-line bg-surface shadow-card dark:border-line-dark dark:bg-surface-dark dark:shadow-card-dark`
- **Primary button**: `rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700 active:scale-[.98]`
- **Ghost button**: `rounded-xl border border-line px-4 py-2.5 font-semibold transition hover:bg-surface-bg dark:border-line-dark dark:hover:bg-surface-dark-2`
- **Icon button**: `grid h-9 w-9 place-items-center rounded-full border border-line text-ink-muted transition hover:bg-surface-bg hover:text-ink dark:border-line-dark dark:text-ink-inverse-muted dark:hover:bg-surface-dark-2`
- **Input**: `w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[15px] placeholder:text-ink-faint focus:border-brand-500 focus:outline-none dark:border-line-dark dark:bg-surface-dark-2`
- Interactive elements get `transition` + a hover state + `active:scale-[.98]` where tappable.

## Screen blueprints

### layouts/default.vue (owner: shell agent)
- Desktop header: sticky, blurred (`bg-surface-bg/80 backdrop-blur-md dark:bg-surface-bg-dark/80`), bottom border `border-line`. Left: brand — a 32px rounded-xl brand-600 tile containing `<AppIcon name="bowl" class="text-white" />` + "Rasoi" in `font-display font-extrabold text-xl`. Center: nav pills (Today/Calendar/Meals/Pantry/Fitness) each with icon (home, calendar, bowl, basket, activity) + label; active = `bg-brand-600/10 text-brand-700 dark:text-brand-400`, inactive = ink-muted hover. Right: theme toggle icon button (sun/moon via `useTheme()`), sign-out icon button (logout icon, only when `user`).
- Mobile bottom bar: floating pill dock — `fixed bottom-3 inset-x-3 rounded-2xl border border-line bg-surface/90 backdrop-blur-md shadow-lift dark:bg-surface-dark/90`, 5 items, icons + tiny labels, active item text-brand-600 with a 4px dot under. Hide on sm+.
- Main container: `mx-auto w-full max-w-5xl px-4 py-6 pb-28 sm:pb-10`.
- Wrap `<NuxtPage />` region so pages get `<NuxtPage :transition="{ name: 'page', mode: 'out-in' }"/>`? No — leave NuxtPage default (transition configured globally); just keep `<slot />`.

### pages/index.vue — landing (owner: shell agent)
- Hero: centered, generous whitespace. Eyebrow pill "Meals · Macros · Money". Headline `text-5xl sm:text-6xl font-display font-extrabold tracking-tight`: "Eat well. **Spend smart.**" (Spend smart in brand-600→money-600 gradient text via bg-clip-text). Subline about planning the week, budgeting every ingredient, watching the pantry.
- CTAs: primary "Start tracking free" (arrow-right icon), ghost "Log in".
- Below: 3 feature cards (flame → calories & macros; wallet → every meal shows its ₹ cost; basket → pantry that forecasts run-outs). Cards per recipe, icon in tinted rounded-xl square (brand/money/accent tints with dark: equivalents).
- Bottom strip: small stat-style row ("120+ Indian foods", "₹ FIFO costing", "WhatsApp coach") as muted chips.

### pages/today.vue + components/HeroRing.vue + components/MacroBar.vue (owner: today agent)
- **Date strip** replaces arrows: horizontal scrollable 7-day strip centered on selected date (3 before, 3 after). Each day = tappable column: weekday letter (text-[11px] uppercase ink-faint) + day number in a 40px circle (`grid place-items-center rounded-full`); selected = bg-brand-600 text-white font-bold; today-but-unselected = ring-1 ring-brand-500 text-brand-600. Clicking sets `date`. Keep a small "Today" text button appearing when selected ≠ today. Title above strip: big `font-display text-2xl font-extrabold` day label ("Today" / "Wed, 16 Jul") + subline `text-sm text-ink-muted` full date.
- **Hero summary card** (Card recipe, p-5 sm:p-6): grid `sm:grid-cols-[auto_1fr]` gap-6.
  - Left: `HeroRing` — 150px SVG ring, 12px track (`text-line dark:text-line-dark` stroke via currentColor), progress stroke brand-500→brand-600 gradient (SVG linearGradient), rounded caps, smooth transition. Center stack: flame icon (16, accent-500), big `font-display text-4xl font-extrabold tnum` remaining kcal, label "kcal left" `text-xs text-ink-muted`. Over budget → progress + number turn danger, label "over".
  - Right: three `MacroBar`s (Protein violet-500, Carbs accent-500, Fat danger/rose) — each: row with name `text-[13px] font-semibold` left + `tnum text-[13px] text-ink-muted` "62 / 90 g" right; below a 8px rounded-full track (`bg-surface-bg dark:bg-surface-dark-2`) with animated fill `transition-all duration-500`. Under the bars a divider then a compact row: wallet icon + "Spent today" + `tnum font-display font-bold text-money-600` amount + muted pill "budget · Phase 3".
- **Slot cards** (one per MEAL_SLOTS, space-y-4): Card recipe, NO left border stripe. Header row p-4: 40px rounded-xl icon tile with `:style="{ background: slot.tint, color: slot.color }"` (dark: `:style` gets 20% alpha color bg — use color+'26') containing `<AppIcon :name="slot.icon" />`; then column: slot label `font-semibold` + `text-xs text-ink-faint` hint (e.g. "7–10 am"); right side: when entries exist `tnum text-sm font-semibold` kcal total + chevron. Entries list: each item row px-4 py-2.5 with `border-t border-line/70 dark:border-line-dark/70`: description text (items joined, `text-sm`), macros as `text-xs text-ink-muted tnum` "P 12 · C 40 · F 8", right side kcal `tnum text-sm font-semibold` + delete icon-button (trash, size 15, `text-ink-faint hover:text-danger`, always visible, no hover-only).
  - Footer: full-width add row — `flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition hover:bg-surface-bg dark:hover:bg-surface-dark-2` with plus icon, colored `:style="{ color: slot.color }"`, label "Add food". Top border. This is the primary tap target.
- Keep all existing logic (`useFetch`, `saveItems`, `removeEntry`, shiftDay may go). `goals` defaults unchanged.

### components/AddFoodSheet.vue (owner: sheet agent)
- Overlay `bg-black/50 motion-safe:animate-fade-in backdrop-blur-[2px]`; sheet: mobile bottom sheet (`rounded-t-sheet`), sm+: centered modal (`sm:rounded-sheet`), `motion-safe:animate-slide-up`, `shadow-sheet`, `bg-surface dark:bg-surface-dark`, max-h-[88vh], flex column with sticky header + scrollable middle + sticky footer.
- Header: drag-handle bar (mobile, `h-1 w-10 rounded-full bg-line dark:bg-line-dark mx-auto`), title "Add to {{ slotLabel }}" `font-display font-bold text-lg`, close icon-button.
- Search: input with search icon inside (relative wrapper, icon absolute left, `pl-10`). Autofocus.
- Results: rows `flex items-center gap-3 px-3 py-2.5 rounded-xl transition hover:bg-brand-50 dark:hover:bg-brand-600/10 cursor-pointer`: left 36px rounded-lg tinted tile with category-ish letter or bowl icon; middle: name `text-sm font-medium` + sub `text-xs text-ink-muted` "68 kcal · P 2.6 · per 100g"; right: plus in a small brand-tinted circle. Empty search state: centered muted illustration-ish (big search icon in tinted circle) + "Search 120+ Indian foods" hint; no results: "No match — try 'dal' or 'paneer'".
- Draft items ("In this entry"): each row in `rounded-xl bg-surface-bg dark:bg-surface-dark-2 px-3 py-2`: name (flex-1 truncate, `text-sm font-medium`), **qty stepper**: minus icon-button (h-7 w-7) / `w-14 text-center tnum` number input (borderless, bg-transparent) / plus icon-button — stepping ±(10 for g/ml, 1 for pieces/custom); unit select styled `rounded-lg border border-line dark:border-line-dark bg-transparent px-2 py-1 text-xs font-medium`; remove x icon-button.
- Sticky footer: divider; row with live totals left — `tnum text-sm` "≈ {kcal} kcal" computed from drafts (kcal/100g × grams estimate — compute client-side from ingredient data already in results: keep per-draft `ingredient` object; for global units approximate g==canonical; it's a preview only, label with "≈") — and primary button right: "Log {n} item(s)" with check icon, disabled state `disabled:opacity-40`.
- Keep emits/props identical: `slotLabel`, `close`, `save(items)`.

### pages/calendar.vue (owner: calendar agent)
- Header: `font-display text-2xl font-extrabold` month + year muted; right: chevron icon-buttons + a "Today" ghost pill that jumps cursor to current month.
- Grid in Card: weekday header row `text-[11px] font-bold uppercase tracking-wider text-ink-faint`; day cells `aspect-square sm:aspect-[4/3] rounded-xl border border-transparent p-1.5 transition hover:border-brand-500/60 hover:shadow-card` with `bg-surface-bg/60 dark:bg-surface-dark-2/50`; day number `text-xs font-semibold`; today = number inside 22px brand-600 circle in white; future days slightly faded (`opacity-70`).
- Per-day content: up to 5 slot dots (`h-1.5 w-1.5 rounded-full`, slot colors, planned = opacity-40) and, when any entries, a `tnum text-[10px] text-ink-muted` total kcal line at cell bottom (sm+ only).
- Legend below as small pills: dot + label. Keep the note about Phase 2 as one muted line with sparkles icon.
- Keep month math + fetching logic as-is; NuxtLink cells → /today unchanged.

### pages/meals/index.vue + pantry.vue + fitness.vue (owner: library agent)
- **Meals**: header row: title + sub "One-tap logging for your usual plates."; primary button "New meal" (plus icon). Meal cards grid `sm:grid-cols-2`: Card + `transition hover:shadow-lift hover:-translate-y-0.5`; inside: top row — 40px rounded-xl brand-50 tile (bowl icon, brand-600; dark brand-600/15) + name `font-semibold` + kcal pill right (`rounded-full bg-brand-50 text-brand-700 dark:bg-brand-600/15 dark:text-brand-400 tnum text-xs font-bold px-2.5 py-1`); below: 3 mini macro chips (`rounded-md bg-surface-bg dark:bg-surface-dark-2 px-2 py-1 text-[11px] tnum`) "P 21g" "C 48g" "F 12g" + muted "· 4 ingredients". Empty state: dashed-border card, bowl icon in big tinted circle, headline "Build your first meal", sub-copy, centered primary button (this replaces needing the top button for first use).
- Keep `prompt()` naming flow for now.
- **Pantry**: keep "Phase 3" honesty but design it: page title + money-tinted Card with wallet icon tile, "The moat — coming in Phase 3" headline, then 3 feature rows each with icon (rupee, basket, activity) + one-liner; footer muted chip "Purchases → FIFO costing → run-out forecasts".
- **Fitness**: same pattern with scale/activity/droplet icons: weight & BMI auto, custom metrics, TDEE → calorie goal.

### Auth pages (owner: shell agent): login.vue, signup.vue
- Center card max-w-sm: brand tile + "Rasoi" mark on top, `font-display text-2xl font-extrabold` heading, inputs per recipe, primary button full-width, error text `text-sm text-danger`, links `font-semibold text-brand-600 hover:underline`. Dark-mode complete.

## Do / Don't

- DO make every interactive element visibly interactive (hover, active scale).
- DO use `text-ink-muted`→`ink-faint` hierarchy — three text levels max per card.
- DON'T use emoji, hover-only actions, default browser focus rings, or gray-* Tailwind colors (use stone-based tokens above).
- DON'T change routing, API calls, or data shapes.
