# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

`C:\Project\EngViet\EngViet` is the Next.js frontend for **TOPTI**, a SaaS platform for freelance English/IELTS teachers in Vietnam. Teachers create classes, students join via a 6-character class code, teachers import vocabulary from a spreadsheet, and the system auto-generates a timed ABCD quiz and a timed vocabulary-matching minigame from that vocabulary, auto-grades submissions, and shows leaderboards/reports.

This is a **standalone project**, not part of a monorepo — `C:\Project\EngViet` has no root `package.json`/workspace. Install and run everything from inside `C:\Project\EngViet\EngViet`. `pnpm-workspace.yaml` exists here only to carry `allowBuilds` (pnpm won't run native install scripts otherwise).

A real backend exists at `../Backend-EngViet` (NestJS + MongoDB Atlas + Redis — see its own `CLAUDE.md`). **The whole app is wired to it** — there is no mock layer any more (`src/lib/mock/*`, `.data/`, `resetDemo` are all gone). Every page fetches real data through `src/lib/api/*`; the backend must be running (plus Redis, plus a `pnpm seed` in the backend for demo content) or the dashboards are empty / redirect to `/login`.

### Auth — BFF session (httpOnly cookies set by *this* app)

The frontend keeps its own session: two httpOnly cookies **it** sets (not the backend's), `topti_at` (access JWT, ~15m) and `topti_rt` (refresh, ~7d). The backend's `/auth/*` responses are consumed server→server; the frontend re-sets the tokens under its own cookie names.

- **`src/lib/api/session.ts`** (server-only): `getSessionTokens()`, `writeSession()`, `clearSession()` (cookie writes silently no-op during a render — only work in Server Actions / Route Handlers / middleware), `getCurrentUser()` (React-`cache`d, verifies via `GET /users/me`).
- **`src/lib/api/server.ts`** (server-only): `apiServer<T>(path, opts)` attaches `Authorization: Bearer` and, on a 401, refreshes once (persisting the rotated pair when it can) and retries; `apiPublic<T>` for `@Public()` endpoints. `src/lib/api/envelope.ts` has `ApiError`, `parseResponse` (unwraps the backend's `{ success, data }` envelope), `Paginated<T>`, `googleLoginUrl`, and the cookie-name constants.
- **`src/proxy.ts`** (renamed Next middleware) does two jobs: next-intl locale routing **and** auth — it refreshes an expired `topti_at` from `topti_rt` *before render* (the only place cookies can be written pre-render), mirrors the fresh token onto the current request, and **gates** `/{locale}/(teacher|student|admin)/*`: no session → redirect `/login`, wrong role (from the JWT `role` claim) → redirect to that role's own dashboard. Role `layout.tsx` files also call `requireRole(role, locale)` as defense-in-depth.
- **`src/lib/api/auth-actions.ts`** (`"use server"`): `establishSessionFromCode` (Google callback), `loginWithPassword`, `registerAccount`, `logoutAction` — each hits the backend and calls `writeSession`/`clearSession`.
- **`AuthProvider`** (`src/components/auth/auth-provider.tsx`) is now display-only: `{ status, user, logout }`. It takes `initialUser` from each role `layout.tsx` (`getCurrentUser()` server-side) — **not** mounted in `[locale]/layout.tsx` any more, so marketing/auth pages stay static and make zero API calls.
- **Google flow**: `<a href={googleLoginUrl(role)}>` → backend → Google → backend → `${FRONTEND_URL}/auth/callback?code=...` → `src/app/[locale]/auth/callback/page.tsx` renders a client leaf (`auth-callback-runner.tsx`) that calls `establishSessionFromCode` then `router.replace` to the dashboard. Email/password `/login` + `/register` are real (`loginWithPassword` / `registerAccount`).
- **Needs backend + Redis running.** Base URL: `NEXT_PUBLIC_API_URL` (client) / `API_URL` (server, defaults to it) — `.env.local` / `.env.example`, baked at build time for the public one.
- **Deploy**: `render.yaml` (repo root) Blueprint for `topti-web`; backend repo's `DEPLOY.md` is the runbook. Nothing deployed yet.

The repo originally also held a set of static design-tool exports (`code.html` + `screen.png` mockups per screen, plus a `DESIGN.md` with the color/type scale) that this app was built from; they've since been deleted as redundant now that the real implementation exists. `tailwind.config.ts`'s color tokens (`primary: #004ac6`, `secondary: #006c49`, `tertiary: #ad0033`, etc.) and type scale (`headline-*`, `body-*`, `label-*`) were transcribed from that design system and remain the source of truth for the visual language — treat `tailwind.config.ts` itself as the spec now.

## Commands

This project uses **pnpm** (pinned via `"packageManager"` in `package.json`), not npm/yarn — don't regenerate `package-lock.json`.

```bash
pnpm install
pnpm dev      # Next.js dev server (Turbopack), http://localhost:3000
pnpm build    # production build — also runs the TypeScript check
pnpm start    # serve the production build (run `build` first)
pnpm lint     # eslint . (flat config, eslint.config.mjs)
```

On this machine the `pnpm` binary on PATH is broken (corrupted shim, throws `MODULE_NOT_FOUND` on a mangled path); `corepack pnpm <command>` works reliably and resolves the version pinned in `package.json`. Try plain `pnpm` first — if it fails the same way, fall back to `corepack pnpm`.

There is no test suite / test runner configured in this repo yet.

## Architecture

### Internationalization (vi / en) — `next-intl`, URL-prefixed

The whole UI is bilingual (Vietnamese default, English) via **`next-intl` v4** with **locale-prefixed routes** (`/vi/...`, `/en/...`; `/` 307-redirects to `/vi`).

- **Infra**: `src/i18n/routing.ts` (`locales`, `defaultLocale: "vi"`, `localePrefix: "always"` — the single source of truth for the locale list), `src/i18n/navigation.ts` (locale-aware `Link`/`useRouter`/`usePathname`/`redirect` — **import these instead of `next/link` and `next/navigation` for internal navigation**; `usePathname` returns the path *without* the locale prefix), `src/i18n/request.ts` (loads `messages/{locale}.json`, sets `timeZone: "Asia/Ho_Chi_Minh"`), `src/proxy.ts` (the locale-routing proxy — Next 16's renamed `middleware`; keep it named `proxy.ts`), and `createNextIntlPlugin` wrapping `next.config.ts`.
- **App tree**: every route lives under `src/app/[locale]/`. There is **no `src/app/layout.tsx`** — `src/app/[locale]/layout.tsx` is the root layout (renders `<html lang={locale}>`, fonts, `NextIntlClientProvider`, `AntdProvider`); it calls `setRequestLocale(locale)` and every page/layout that should stay static must call `setRequestLocale` too. `src/app/[locale]/[...rest]/page.tsx` catches unknown paths → `notFound()`. The non-localized metadata routes stay at `src/app/` root: `sitemap.ts` (emits both locales + hreflang), `robots.ts`, `manifest.ts`, `opengraph-image.tsx`, `llms.txt/route.ts`, `globals.css`.
- **Strings**: `messages/vi.json` + `messages/en.json`, same key tree (a script check keeps them in parity). Namespaces: `common`, `nav`, `roles`, `pageTitles`, `dashboardShell`, `seo`, `marketing.*`, `auth.*`, `dash.*` (the whole authenticated area — `dash.common` for shared labels, `dash.teacher/student/admin/quiz/matching/builder/...` per surface). Server Components use `getTranslations(ns)` / `getFormatter()`; Client Components use `useTranslations(ns)` / `useFormatter()` / `useLocale()`. Data from the API (names, class names, vocabulary) is content, not UI — never translated. A couple of server-built strings *are* Vietnamese-only by design: the teacher activity feed (`/leaderboard/teacher/activity`) and backend error messages.
- **Config that used to hold Vietnamese literals now holds keys**: `NAV_ITEMS`/`SECONDARY_NAV_ITEMS` in `lib/constants.ts` carry a `labelKey` (resolved via `useTranslations("nav")` in the nav components); `getSectionTitle` in `lib/page-titles.ts` returns `{ titleKey, subtitleKey }` (resolved in `DashboardShell`); `lib/seo.ts`'s `buildMetadata` takes a `locale` and is called from each public page's `generateMetadata`; `lib/site.ts` keeps only language-neutral facts (name, URL, email) — its `tagline`/`description` are the vi fallback for the non-localized artifacts only.
- **Dates/relative time**: use `getFormatter().dateTime(...)` / `.relativeTime(...)` (locale-aware). `formatCurrencyVND`/`formatNumber` in `lib/utils.ts` stay `vi-VN` (VND is a Vietnam-market fact). **`Date.now()` must not be called in a component body** (even an async Server Component — `react-hooks/purity` flags it); use `currentTimestamp()` / `hoursUntil()` from `lib/utils.ts` instead.
- **Language switcher**: `components/layout/language-switcher.tsx` (antd `Segmented`) — in the marketing header/footer, the auth layout, and the dashboard top bar. `AntdProvider` takes a `locale` prop and maps it to `antd/locale/{vi_VN,en_US}` so antd's own strings localize too.
- **Deferred, still English-key placeholders**: Google sign-in buttons on `/login` and `/register` are rendered **disabled with a "coming soon" pill** — no wiring (real Google OAuth, MongoDB Atlas, Cloudinary are all deferred per the user).

### Motion & generative art (marketing + auth only)

The public surface (`(marketing)` + `(auth)`) has a CSS-only 3D / animation layer and hand-built vector artwork. **No `three` / `@react-three/fiber` / `framer-motion` — this was a deliberate "no new deps" constraint.** Dashboards are intentionally left plain.

- **Primitives** (`src/components/motion/`, all `"use client"`): `Reveal` / `RevealGroup` (scroll-in via `src/hooks/use-in-view.ts`), `TiltCard` (pointer-tracked `rotateX/rotateY` + glare; off on touch/reduced-motion), `Parallax` (rAF-throttled scroll translate). `use-in-view` is **failsafe-by-default**: content renders fully visible (`.reveal-init`), and only after a `requestAnimationFrame` check does it hide (`.reveal-pending`) elements still *below* the fold — so SSR, no-JS, bots and screenshot tools always see everything. The reveal CSS lives in `globals.css` under `@media (prefers-reduced-motion: no-preference)`.
- **Artwork** (`src/components/art/`): `GradientMesh` (drifting blurred SVG blobs — `variant="surface"|"onPrimary"`), `HeroScene` (2.5D layered hero illustration, replaces the old flat mock card), `FeatureGlyph` / `StepIllustration` (per-item inline SVG, indexed to the `marketing.home.features`/`steps` arrays), `AuthPanelArt` (brand-panel backdrop). All are **deterministic** — placement seeds come from `src/lib/seeded.ts` (`mulberry32` / `stringSeed`), **never `Math.random()`** (would break hydration + fail `react-hooks/purity`). `GradientMesh`/`FeatureGlyph`/`StepIllustration`/`AuthPanelArt` are Server Components; `HeroScene` is client (uses `TiltCard`).
- **Tailwind/CSS**: `tailwind.config.ts` adds `animate-{float,float-slow,blob,spin-slow,shimmer}` + `ease-out-back` + `shadow-float`; keyframes (`blob-drift`, `float-y`, …) and utilities (`.bg-grain`, `.card-3d`) are in `globals.css`. Gate looping animations with the `motion-safe:` variant.
- **Pattern for pages**: keep the page a Server Component; wrap only the interactive bits in the client primitives as leaves. `RevealGroup` clones its direct children and injects `className`+`style`, so its children must be plain elements that accept those props (wrap a `TiltCard` in a `<div>` if needed).

### Theming — light/dark via CSS variables

**All colours are CSS custom properties** (`--token`, value is space-separated `R G B`). `tailwind.config.ts` maps each token to `rgb(var(--token) / <alpha-value>)`; light values are on `:root` in `globals.css`, dark values on `.dark`. **Never add a raw hex to `tailwind.config.ts` or a component** — add a `--token` pair instead. `darkMode: "class"`.

- Toggle: `src/components/layout/theme-toggle.tsx` cycles `system → light → dark`, stores `topti-theme` in `localStorage`, toggles `.dark` on `<html>`. A **pre-paint inline script** (`THEME_INIT_SCRIPT` in `src/lib/theme.ts`) sets the class before first paint — no flash. It's rendered in `[locale]/layout.tsx` `<head>` via the `<ThemeScript>` component (`src/components/theme/theme-script.tsx`), which emits `type="text/javascript"` on the server (runs during HTML parse) and `type="text/plain"` on the client + `suppressHydrationWarning` (React 19 / Next 16 logs "Encountered a script tag while rendering React component" for any executable inline `<script>` — raw or via `next/script` — that a component renders; the split `type` is the documented workaround, see `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`). `<html>` carries `suppressHydrationWarning` since the script mutates its class. Use `<ThemeScript>`'s pattern for any new pre-paint inline script. It's in the marketing header, dashboard top bar and auth layout.
- `AntdProvider` (`src/components/antd-provider.tsx`) is `"use client"`, watches the `.dark` class via `useIsDark()` (`src/hooks/use-media-query.ts`) and switches `theme.darkAlgorithm` + a matching token set.
- The M3 "primary" flips to a light tint in dark mode — so a full-bleed `bg-primary` panel becomes bright. The auth brand panel uses a **fixed** blue gradient (inline style) instead, so its white artwork text works in both modes. Watch for this on any large `bg-primary` surface.

### PWA & mobile (students are mostly on phones)

- **Manifest**: `src/app/manifest.ts` — `display: "standalone"` + `display_override` = **no URL bar when installed**; `start_url: "/vi"` (not `/`, so launch skips the `/`→`/vi` redirect and never flashes an address bar); iOS gets the same chrome-less launch from `appleWebApp.capable`. Shortcuts + `categories`. Icons **generated** via `ImageResponse` — `src/app/icon.tsx` (512 PNG) + `src/app/apple-icon.tsx` (180) + `public/icon.svg` (maskable). `public/favicon.svg` is the tab icon. **`icon` / `apple-icon` / `sw.js` / `offline.html` are excluded from the `proxy.ts` matcher** — add any new root-level asset there or the locale proxy 307s it.
- **Service worker**: hand-written `public/sw.js` (no `next-pwa`) — network-first for navigations with `public/offline.html` fallback, cache-first for `_next/static`. Registered by `src/components/pwa/service-worker-register.tsx` (production only). Bump `VERSION` in `sw.js` when its logic changes.
- **Mobile**: `DashboardShell` uses `h-[100dvh]` (not `100vh`), `min-w-0`/`overflow-x-hidden` on the scroll column (a `mx-auto` flex item content-sizes — always give game/result wrappers `w-full`). Safe-area utilities (`.h-bottom-nav`, `.pb-safe`) in `globals.css`; `viewportFit: "cover"`. Bottom nav is student-only. The command palette is teacher/admin only.

### Demo data

Lives in the **backend** DB now (`../Backend-EngViet`, run `corepack pnpm seed` there — idempotent, wipes+recreates app data, prints an account table). Seed accounts: `admin@topti.seed`, `teacher1@topti.seed` (Free), `teacher2@topti.seed` (Pro, 3 classes + submissions), `student01..40@topti.seed` — all password `Topti@12345`. No frontend persistence layer, no "reset demo" button.

### Command palette (⌘K)

`src/components/features/command-palette/command-palette.tsx` — teacher & admin only, mounted by `DashboardShell`. Native `<dialog>` (free focus-trap/Escape), `mod+k` or the top-bar "⌘K" button (dispatches a `topti-open-command` event). Entries: `NAV_ITEMS`/`SECONDARY_NAV_ITEMS` + quick actions + dynamic class/teacher links passed from the layout as `commandEntities`. Accent-insensitive match via `slugify`.

### Errors, i18n edge cases, list filtering

- `src/app/[locale]/error.tsx` (localized, `"use client"`) + `src/app/global-error.tsx` (bare, bilingual) — don't remove; any thrown render error lands here.
- **Server Actions can't translate.** `joinClassByCode` returns an error *code* (`"code_length" | "not_found"`); the three client callers translate it via `useTranslations("joinErrors")`. Follow this pattern for any new action error.
- **Lists: debounced search + infinite scroll, never numbered pagination.** `src/hooks/use-debounce.ts` (`useDebounce` value, `useDebouncedCallback`) + `src/hooks/use-infinite-scroll.ts` (`useInfiniteScroll(items, {pageSize})` → `{ visible, sentinelRef, hasMore }`; resets to page 1 when `items` identity changes, via the "adjust state during render" pattern). `use-list-filter.ts` uses `useDebounce`. Reusable row list: `src/components/ui/filterable-list.tsx` — the server page renders each row (incl. async Server Components) and passes `{ id, searchText, node }[]`; the client wrapper debounce-filters + infinite-scrolls. Table variants (their own file, client): `transactions-table.tsx`, `student-roster-table.tsx`, `leaderboard-table.tsx`. The API readers pass `limit=100` and the client list does the search/scroll over that page (good enough at current scale; wire real pagination if a class exceeds ~100).
- `pnpm typecheck` (`tsc --noEmit`) is a script now — run it alongside `pnpm lint`.
- **`react-hooks/set-state-in-effect`** is an error here: never call `setState(x)` synchronously in an effect body. Read external state with `useSyncExternalStore` (see `use-media-query.ts`, `theme-toggle.tsx`) or set it from a callback (observer / `setTimeout` / rAF).

### Performance: antd is not on the marketing/auth critical path

`AntdProvider` is **not** in `[locale]/layout.tsx` — it's in `admin/`, `teacher/`, `student/` layouts and `(auth)/join/layout.tsx` only. `/`, `/pricing`, `/help`, `/login`, `/register` ship no antd. If a new marketing/login component needs antd, either don't (use `components/ui/*`) or you're adding ~280 KB to those pages — reconsider.

### Route groups vs. role sections

`src/app/(marketing)` and `src/app/(auth)` are route groups (no URL segment) for the public site (`/`, `/pricing`, `/help`) and auth pages (`/login`, `/register`, `/join`). `src/app/admin`, `src/app/teacher`, `src/app/student` are real URL segments, each with its own `layout.tsx` that renders `<DashboardShell role="..." ...>{children}</DashboardShell>` (`src/components/layout/dashboard-shell.tsx`).

`DashboardShell` is the persistent chrome (sidebar, top bar, mobile drawer/bottom nav) for all three roles; `{children}` is the route "outlet" — Next.js swaps the nested page while the shell stays mounted. Nav items and their icons live in `src/lib/constants.ts` (`NAV_ITEMS`, `SECONDARY_NAV_ITEMS`), and the top bar's title/subtitle per section is resolved from the current pathname by `src/lib/page-titles.ts` (`getSectionTitle`) rather than being passed down from each page — add a new dashboard route's title there, not as a prop.

For tab-style UI that should **not** be its own URL (e.g. Quiz vs. Matching mode on the assignment builder, or a class's "Học sinh"/"Bài tập" panels), use `src/components/ui/tabs.tsx` (`<Tabs><TabsList><TabsTrigger>...`) instead of adding routes.

All three role layouts export `export const dynamic = "force-dynamic"` — they're personalized/authenticated and read per-request session cookies. Because `force-dynamic` routes are **not** prefetched in full and (by Next default) not client-cached, `next.config.ts` sets `experimental.staleTimes.dynamic: 30` so re-visiting a dashboard tab within 30s reuses the RSC payload with no server round-trip; the mutation Server Actions' callers already `router.refresh()`, so this doesn't serve stale data after a write. The content wrapper in `DashboardShell` keeps `key={pathname}` (per-route state isolation) but has **no** enter animation — a per-nav fade made tab switches *feel* slow. Navigation between sections is a normal client-side RSC transition (the shell never re-renders); if it feels slow in `pnpm dev`, that's Turbopack compiling the route on first visit, not the app — check with `pnpm build && pnpm start`.

### Data flow: `src/lib/api/*` readers + Server Actions

- `src/lib/api/{classes,assignments,submissions,leaderboard,billing,admin,users}.ts` — one file per domain. Each exports `async` functions that call `apiServer`/`apiPublic` and **map the backend DTO onto the frontend type** in `src/lib/types.ts` (e.g. `ClassResponseDto` → `ClassRoom` with `studentCount`; assignment vocab/questions get synthetic stable ids). Pages (Server Components) call these directly with `await`. `getMyClasses()` / `getAssignments()` etc. are scoped to the caller by the backend (`/classes/mine`), so no id args.
- `src/lib/actions.ts` (`"use server"`) — every **write**: `createClass`, `joinClassByCode` (still returns an error *code* the client translates via `useTranslations("joinErrors")`), `updateProfile`, `createAssignment`, `submitQuiz`, `submitMatching`. All go through `apiServer` (bearer token + auto-refresh). Client components (`create-class-dialog`, `assignment-builder-form`, `quiz-runner`, `matching-board`, the join forms, `login-form`/`register-form`) call these.
- `src/lib/generators.ts` — still used, but **only for the assignment builder's live preview** (`generateMatchingBoard` also builds the matching game's two-column board client-side, since the backend's play DTO only returns the vocab). The real quiz questions are generated **server-side** by the backend (`POST /assignments`), so a teacher's preview ≠ the final assignment.
- `src/lib/csv.ts` — hand-rolled RFC-4180 CSV parser for the vocabulary uploader. CSV-only, no `.xlsx` — see "Deliberate omissions".
- Grading is **server-side**: `quiz-runner` / `matching-board` submit answers and display the score + per-question review from the response, never compute it locally (the playable assignment has no answer key).

### Component layers

- `components/ui/*` — presentational primitives only (Button, Card, Badge, Input, Tabs, Dialog, Table, Progress, Avatar, Skeleton...). No domain knowledge, no data fetching.
- `components/layout/*` — app chrome (Sidebar, TopBar, DashboardShell, MobileBottomNav, PageHeader, Breadcrumbs).
- `components/features/<domain>/*` — everything domain-specific (billing, classes, assignments, quiz, matching, leaderboard, auth, settings), composed from `ui/`.
- `components/marketing/*` — public site header/footer only.

### Lazy loading

Client components that are interactive-only and not needed for first paint have a sibling `*.lazy.tsx` file that wraps them in `next/dynamic` with a `Skeleton` loading state (e.g. `quiz-runner.lazy.tsx`, `matching-board.lazy.tsx`, `bar-chart.lazy.tsx`, `qr-checkout.lazy.tsx`, `assignment-builder-form.lazy.tsx`). Pages import the `.lazy` version, never the raw component, so its JS ships in a separate chunk. Follow this pattern for any new heavy/interactive-only component instead of importing it directly.

### Icons

All icons are from `@ant-design/icons`, imported only through `src/components/icons.tsx` — never import `@ant-design/icons` directly in any other file. That wrapper carries a `"use client"` directive because `@ant-design/icons` creates a React Context at module scope for its theming, which throws (`createContext is not a function`) the moment a Server Component evaluates it; re-exporting through one client-boundary file lets Server Component pages still render icons as ordinary Client Component leaves. When adding a new icon, add its import to `icons.tsx` and import it from `@/components/icons` everywhere else. Sizing follows Ant Design's own convention — icons are inline SVGs sized `1em`, so they're sized via `text-*` (font-size) Tailwind classes on the icon or an ancestor, not `h-*`/`w-*` (which sizes lucide's stroke-based SVGs but does nothing for an em-sized icon). An icon inline with button/badge text usually needs no size class at all — it just inherits the surrounding text's font-size. `src/lib/constants.ts` exports `IconType` (`ComponentType<{ className?: string }>`), the shared prop type for anything that accepts an icon component (`StatCard`, `EmptyState`, nav items) — deliberately not `@ant-design/icons`' own type, so swapping icon libraries again wouldn't require touching those call sites.

### UI kit policy: antd for new work

**New UI work must use real `antd` components** (`Modal`, `Form`, `Input`, `Button`, `QRCode`, `Segmented`, `Table`, `Tag`, `Typography`, etc.) instead of adding to the hand-rolled `components/ui/*` kit. This is a deliberate, explicit rule — not a stylistic preference — decided when the QR join/live-session feature was built. The existing `components/ui/*` primitives (Button, Card, Dialog, Input, Table, Tabs, Progress, Badge, Select...) are **left as-is** and still power all the pre-existing pages; this is an intentional scope boundary (a full retrofit was considered and explicitly deferred as high-risk for ~40 already-working files), not an oversight. Concretely:

- Touching an existing page only to wire in new functionality (e.g. adding a QR trigger) may mix an antd component into a page that otherwise uses `components/ui/*` — that's expected, not a bug to "clean up".
- A component substantially rewritten for new functionality (e.g. `create-class-dialog.tsx`, `student-join-form.tsx`) is rebuilt fully in antd rather than patched with `components/ui/*` additions.
- `src/components/antd-provider.tsx` (`AntdProvider`, wrapping `{children}` in `src/app/layout.tsx`) is the one place antd's theme is configured — its `ConfigProvider` `theme.token` values are hand-mapped from the same source `tailwind.config.ts` uses (`colorPrimary: #004ac6`, etc.), so antd components should look native to TOPTI, not default antd blue. Add new theme tokens there, not inline per-component.
- Static-method APIs (`message`, `notification`, `Modal.confirm`) must go through `App.useApp()` (antd is wrapped in `<App>` inside `AntdProvider`) — the global `message.success()` singleton is deprecated in antd v5+ and won't pick up the theme.
- Only ask for explicit approval before doing a wholesale migration of `components/ui/*` to antd — it's a legitimate future direction, just not one to do unprompted.

### QR join / live-session flow (UC03/UC04/UC06)

Two independent QR features, both encoding a plain `https://` URL (not an app deep link) so any phone's stock camera app can scan and open it — no TOPTI app, no typing:

- **Join a class**: `ClassQrModal`/`ClassQrButton` (`components/features/classes/class-qr-modal.tsx`) and the QR shown inside `CreateClassDialog` both encode `{siteConfig.url}/join/{code}`. That route (`app/(auth)/join/[code]/page.tsx`) looks the class up server-side and renders a one-tap `JoinByCodeButton` that calls the existing `joinClassByCode` Server Action — it's the zero-typing sibling of the manual `/join` page (`StudentJoinForm`, which now offers both "Nhập mã" and "Quét mã QR" via an antd `Segmented`, the latter being pure instructional copy since the actual scanning happens in the phone's own camera app, not an in-page scanner).
- **Start an exam live**: `AssignmentQrButton` (`components/features/assignments/assignment-qr-modal.tsx`, wired into the teacher's assignment report page) encodes `{siteConfig.url}/student/assignments/{assignmentId}` — the *existing* student intro page, reused as-is. There is no separate "live session" route; projecting this QR and having the whole class scan it at once is what makes the start synchronized, since there's no realtime backend to broker it any other way.

Don't build an in-browser camera-based QR scanner (e.g. via `getUserMedia`) for the reverse direction — it's unnecessary complexity here because the phone's native camera already resolves a URL QR code without any app-side scanning logic.

### SEO / GEO

- `src/lib/site.ts` (`siteConfig`) is the single source of truth for name/description/URL/keywords — metadata should always derive from it, not hardcode strings.
- `src/lib/seo.ts`: `buildMetadata()` builds the full `Metadata` object (canonical, OG, Twitter, robots) for public pages; pass `absoluteTitle: true` only for the homepage (its title already includes the brand name, so it must bypass the root layout's `"%s | TOPTI"` template — see the comment in `seo.ts` for why). `buildPrivateMetadata()` is for everything under `/admin`, `/teacher`, `/student` (sets `noindex`).
- `src/lib/structured-data.ts` + `components/seo/json-ld.tsx` — JSON-LD builders (Organization, SoftwareApplication, FAQPage, Product/Offer, BreadcrumbList).
- `src/app/llms.txt/route.ts` — plain-text product summary for LLM/answer-engine crawlers (the GEO counterpart to `robots.txt`).
- `src/app/opengraph-image.tsx` — OG image generated at request time via `next/og`'s `ImageResponse`; `siteConfig.ogImage` points at this route, not a static file.

## Rules specific to this codebase

- **Never write a literal `*/` inside a `/** ... */` block comment**, even as part of a path/glob (e.g. `app/teacher/*/layout.tsx`). Turbopack's parser treats the first `*/` it finds as the comment's end, silently turning the rest of the comment into code and producing a confusing "Unterminated template" / "Expected ';'" error possibly dozens of lines later in the file. If a JSDoc needs to reference a wildcard path, write it without the `*/` substring (e.g. "the per-role layout.tsx files under app/teacher, app/student and app/admin").
- **No `Date.now()` / `Math.random()` calls during render**, including as a `useRef`/`useState` non-lazy initializer argument or a bare ref mutation in the component body — the `react-hooks` (v7) "purity" and "refs" ESLint rules (part of `eslint-config-next`) fail the lint on these. Patterns already established here: derive "unique per instance" values from `useId()` or a passed-in stable key, seed randomness from stable strings via `lib/generators.ts`, and sync a "latest callback" ref inside a `useLayoutEffect`, not inline (see `hooks/use-countdown.ts`).
- **Don't reset local state from a prop/pathname change inside a `useEffect`+`setState`** — the same `react-hooks` rule flags synchronous `setState` in effects. Compare against a `useState`-held previous value during render instead (see `DashboardShell`'s mobile-drawer-closes-on-navigation logic).
- **Any component using an event handler (`onClick`, `onChange`, etc.) on a plain DOM element must be a Client Component** (`"use client"`). A Server Component can accept a handler prop only if it's never actually wired to a DOM element — if you add interactivity to something in `components/ui` or `components/features` that's currently a Server Component (e.g. `PlanCard`), either mark it `"use client"` or don't attach the handler unconditionally.
- **No `xlsx` (SheetJS) dependency** — it has two unpatched high-severity advisories (prototype pollution, ReDoS) with no fix on npm. Vocabulary import is CSV via `lib/csv.ts` instead of true `.xlsx` binary parsing; don't reintroduce `xlsx` without addressing that.
- **`/admin`, `/teacher`, `/student` are auth-gated** — `src/proxy.ts` redirects an unauthenticated (or wrong-role) request before render, and each role `layout.tsx` calls `requireRole()`. `getCurrentUser()` (`src/lib/api/session.ts`) is the guard; it returns `null` when there's no valid session. `/join`, `/join/[code]`, `/pricing` and the marketing pages stay public.
- **Never bulk-edit `.ts`/`.tsx` files with Windows PowerShell's `Get-Content`/`Set-Content` (or any tool) without explicit `-Encoding utf8` on both the read and the write.** PowerShell 5.1's default encoding for `Get-Content`/`Set-Content` without a BOM is the system codepage (cp1252 here), not UTF-8. Reading a UTF-8 file that way silently mojibakes every Vietnamese character, and writing it back bakes the corruption in — a repo-wide find/replace done this way once destroyed Vietnamese text (and one regex, `/đ/gi`, got corrupted into `/d/gi`, a real functional bug) across ~60 files in this project and had to be manually reconstructed. Prefer the `Edit` tool for text changes; if a script is unavoidable, always pass `-Encoding utf8` (or `-Raw -Encoding UTF8` / a `UTF8Encoding($false)` writer) explicitly, and verify by grepping for `[a-zA-Z]\?[a-zA-Z]` (mid-word `?`, the telltale sign of silently-dropped non-ASCII characters) afterward.

## Deliberate omissions (not TODOs to "fix" silently)

- No real payment processing — the VietQR checkout renders a real scannable QR (`react-qr-code`) encoding a reference string, and `POST /billing/orders` creates a real pending `Transaction`, but confirming it is admin-only (no gateway webhook). All QR codes added since (class join, live exam start) use antd's own `QRCode` component — two QR libraries coexist on purpose.
- No `.xlsx` binary import, only CSV — see the security note above.
- No image upload — `avatarUrl` comes only from Google.
- No automated tests.
- Some admin surfaces are thin: the teacher-detail page shows the overview row (plan/slots/class count) but not that teacher's class list (no endpoint for an arbitrary teacher's classes).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
