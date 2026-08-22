# IPL Auction Simulator

> Build your team. Manage your purse. Win the auction.

An **unofficial fan-made** IPL-style cricket auction simulator. Conduct a full
live auction against intelligent AI teams — with custom teams, independent
budgets, squad rules, Best XI generation, analytics and save/resume support.

![Tech](https://img.shields.io/badge/React_19-Vite_8-61dafb) ![TS](https://img.shields.io/badge/TypeScript-strict-3178c6) ![Tailwind](https://img.shields.io/badge/Tailwind_v4-CSS-38bdf8)

## Screenshots

> Add screenshots here after running the app (landing page, live auction, results dashboard).

## Features

- **Three modes** — IPL Preset (10 franchises, 95-player pool), Quick Auction (small pool, faster timer), Fully Custom (2–20 teams)
- **Co-op hot-seat** — mark any number of teams as *Human* and play together on one screen; every human team gets its own bid button, purse and squad view
- **Optional time limit** — turn the countdown off entirely and resolve each lot manually with **Hammer (SOLD)** / **Pass (UNSOLD)**
- **Fully configurable auctions** — per-team budgets, logos (upload/URL), colors, bid increment, timer, squad limits, overseas limits, player order
- **Live auction engine** — base-price opening, configurable increments, countdown that resets on every bid, purse validation, SOLD/UNSOLD flows with animations
- **AI bidding** — four difficulty levels evaluating squad needs, role gaps, overseas slots, scarcity, auction stage, purse pressure and randomness
- **Squad management** — min/max squad size enforcement, reserve-purse protection so teams can always fill mandatory slots
- **Results suite** — leaderboard (rating/balance/value/purse), per-team dashboards, auto-generated Best XI with manual swaps, Recharts analytics
- **Persistence** — auctions auto-save to localStorage; resume up to 5 recent auctions
- **Undo** — undo the last bid within a lot or the entire last lot (purse-safe)
- **Sounds** — synthesized WebAudio bid/timer/sold cues with mute toggle (no audio files needed)

## Tech Stack

| Layer | Choice |
|---|---|
| UI | React 19 + Tailwind CSS v4 |
| Build | Vite 8 + TypeScript (strict) |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Persistence | localStorage |
| Backend | None required — fully client-side |

## Installation

```bash
git clone https://github.com/YOUR_USERNAME/ipl-auction-simulator.git
cd ipl-auction-simulator
npm install
```

## Running

```bash
npm run dev       # development server
npm run build     # production build (typecheck + bundle)
npm run preview   # preview the production build
npm run lint      # oxlint
node scripts/generate-assets.cjs   # regenerate team/player SVG assets
```

No environment variables are required. The app is 100% client-side; `.env.example` is not needed.

## How to Play

1. **Pick a mode** — IPL Preset asks you to choose your franchise; Custom lets you build anything from 2 to 20 teams.
2. **Configure teams** — set each team's name, budget (in Cr — they can all be different), colors and logo. Mark one or more teams as *Human* for co-op, or none for an AI-only spectator auction.
3. **Curate the pool** — search/filter/sort players, exclude anyone, add custom players.
4. **Auction** — players come to the block one by one. Human teams press BID to raise by the increment; AI teams evaluate and counter-bid in real time. With a time limit the lot resolves when the clock hits zero; without one, press **Hammer** to sell or **Pass** to move on.
5. **Review** — after the final lot, open Results for the leaderboard, squads and Best XI, then Analytics for charts.

## Architecture

```
src/
├── components/        # PlayerImage, TeamLogo, TeamCard, BidHistory,
│                      # CountdownTimer, PurseBar, SoldOverlay, PlayerModal…
├── pages/             # Home, TeamSetup, PlayerSetup, Auction, Results, Analytics
├── engine/
│   ├── auctionEngine.ts   # state transitions: create/open/bid/sell/unsold/undo
│   ├── biddingEngine.ts   # increment & validity math
│   ├── squadEngine.ts     # squad status, reserve calculations
│   └── bestXI.ts          # constrained Best XI selection + manual swap
├── ai/
│   ├── strategies.ts      # player valuation model (role need, scarcity, stage…)
│   └── aiEngine.ts        # per-difficulty decision loop + interest indicators
├── hooks/             # useAuction (orchestrator), useTimer, useLocalStorage
├── data/              # teams.ts, players.ts (95 players), presets.ts
├── config/            # auctionRules.ts — every tunable rule lives here
├── utils/             # currency (lakh/crore), validation, calculations, sound
└── types/             # shared domain types
```

The engine is league-agnostic: `data/` holds presets (IPL today; BBL/PSL-style
leagues are just another data module), while `engine/`, `ai/` and `hooks/`
never reference IPL specifics.

### Auction Engine

All money is stored internally in **lakh** (1 Cr = 100 L). A bid is valid when:

- it is exactly `currentBid + increment` (or ≥ base price for the opener),
- it does not exceed the team's remaining purse,
- the squad isn't full, and
- the team keeps enough reserve to fill its remaining *mandatory* slots at minimum base price.

Purse is only deducted when the hammer falls (`sellCurrentPlayer`), never during bidding. `undoLastLot` reverses a completed sale atomically (purse, squad, history, queue).

### AI Bidding

Each AI team gets a personality (aggressiveness, risk tolerance, preferred roles). For every lot the engine computes a **valuation**:

```
value = basePrice × ratingFactor
      × roleNeedMultiplier      # fills a gap? saturated role?
      × overseasConstraint      # no slots left ⇒ value = 0
      × scarcityBoost           # few comparable players left in queue
      × stagePremium            # late auction + unfilled role ⇒ pay up
      × purseDiscipline         # tighter purse ⇒ lower ceiling
      × personalityFactor       # aggressive teams stretch further
```

Difficulty controls valuation noise, skip probability and composure:
Easy (±50 % noise) → Medium (±25 %) → Hard (±12 %) → Expert (±6 % plus strategic pass-outs that let rivals overspend). An AI never bids above its noisy valuation or its purse, and never bids against itself.

## Custom Teams & Budgets

Any number of teams (2–20) with completely independent budgets is supported — e.g. 8 teams at ₹150/₹120/₹100/₹90/₹80/₹75/₹110/₹60 Cr, or 10 × ₹100 Cr. No source edits needed; everything is set in Team Setup. Validation enforces unique names, positive budgets and at least one user-controlled team.

## Assets

Team crests and player avatars are original generated SVGs (see [ASSETS.md](ASSETS.md)) — official logos/photos are trademarked/licensed and deliberately not bundled. Multi-layer fallbacks guarantee a broken image can never appear: local SVG asset → code-rendered initials block.

## Deployment

Any static host works:

```bash
npm run build && npx vercel deploy --prod
# or: Netlify / GitHub Pages (set base in vite.config.ts) / any CDN
```

## Live Demo

[https://ipl-auction-simulator-e8kd1yasj-nihalreddymalleshs-projects.vercel.app](https://ipl-auction-simulator-e8kd1yasj-nihalreddymalleshs-projects.vercel.app)

SPA routing note: this app uses state-based navigation (no URL router), so no rewrite rules are required.

## Future Improvements

- Multiplayer auctions over WebSockets
- Retention/right-to-match cards
- Season simulation after the auction
- Additional league presets (BBL, PSL, The Hundred)
- Import/export auction setups as JSON

## Disclaimer

This is an **unofficial fan-made project** created for educational and entertainment purposes. It is not affiliated with, endorsed by, or connected to the IPL, BCCI, any franchise, or any player. All team names are used descriptively; all graphics are original creations. Player statistics are illustrative simulations, not official records.
