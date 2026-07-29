# HeartWell

A wellbeing app for cardiac patients and their families. Users look up cardiac terms in plain language, save the ones relevant to them with personal notes, log daily check-ins (mood, symptoms, medication), and review trends over time.

## Run & Operate

- `pnpm --filter @workspace/mobile run dev` — run the Expo mobile app (via the workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (SDK 54) + Expo Router, React Native
- Persistence: AsyncStorage (all data stored on-device, no backend required)
- Fonts: Inter (400/500/600/700) via @expo-google-fonts/inter
- Icons: @expo/vector-icons (Feather, Ionicons, MaterialCommunityIcons)

## Where things live

- `artifacts/mobile/` — Expo mobile app
- `artifacts/mobile/app/(tabs)/` — 5 tab screens: index (Lookup), checkin, timeline, summary, profile
- `artifacts/mobile/context/AppDataContext.tsx` — all app state + AsyncStorage persistence
- `artifacts/mobile/constants/cardiacTerms.ts` — built-in database of 25 cardiac terms
- `artifacts/mobile/constants/colors.ts` — teal/blue calm palette

## Product

**5 screens:**
1. **Lookup** — Search/browse 25 cardiac terms. Tap any to see plain-language explanation + "why it matters". Save to personal glossary with optional personal note.
2. **Check-in** — Daily entry: mood (5 faces), symptoms checklist (4), medication toggle, tag to a saved word, free-text note.
3. **Timeline** — Unified chronological feed of saved words + check-ins. Filterable. Each entry opens a detail view.
4. **Summary** — Mood trend chart, symptom frequency bars, medication adherence %, across 7 / 30 / 90 day ranges.
5. **Profile** — Name, condition, medications list (add/remove), doctor name/phone/email. All saved on-device.

## User preferences

- Calm, reassuring design — no red or alarm colors. Teal/blue accent, generous white space.
- No authentication. No notifications. Single-user, on-device only.
- Mobile-first, single-column layouts with bottom tab navigation.

## Architecture decisions

- Frontend-only: all data stored in AsyncStorage, no backend needed for this app's scope.
- Liquid glass tab bar on iOS 26+, classic BlurView tabs on older iOS/Android, solid web fallback.
- Built-in cardiac term database (static array) — no API calls needed for lookup.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for mobile development guidelines
