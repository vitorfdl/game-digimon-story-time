# SoS: Grand Bazaar – Player Guides (React + Tailwind + shadcn/ui)

A beautiful, fast, and searchable set of consulting guides for Story of Seasons: Grand Bazaar. This app focuses on practical, in-game reference: residents’ preferences, festivals and birthdays by season/year, and detailed windmill recipes/upgrades.

This project was made entirely by AI, and can have issues that were not detected by me.

The data is intentionally isolated under `src/data` so that fixing or expanding information is simple and low-risk.

<img width="2388" height="1444" alt="image" src="https://github.com/user-attachments/assets/02578e29-b801-4148-921a-8854c566eb7c" />

---

## Quick start

```bash
# Install (pnpm recommended)
pnpm i

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview the production build
pnpm preview
```

Dev server will print the local URL. The app is a single-page application powered by Vite + React Router.


## Project layout

```
src/
  components/
    layout/AppLayout.tsx   # App chrome + sidebar navigation
    any.tsx                # Any other component
    ui/                    # shadcn/ui primitives (local)
  data/
    any.ts                  # Any other data
    types.ts               # Shared domain types
  hooks/
    use-mobile.ts          # Small responsive helpers (if needed)
  lib/
    utils.ts               # `withBase`, `cn`, misc helpers
  index.css                # Tailwind v4 + theme tokens (shadcn-compatible)
  App.tsx                  # Routes
  main.tsx                 # App bootstrap
```

- Pages are routed in `src/App.tsx` and rendered within `src/components/layout/AppLayout.tsx`.
- All player-facing data lives in `src/data`.

---

## Notes & assumptions

- The calendar implements weekday shifting across seasons/years based on a 31‑day season length and observed in‑game screenshots.
- Missing images gracefully fall back to the Vite logo.

---

## License

MIT
