# DKV Circuit Lab 3D — V0.8.0 (ESP32-C3 Detailed Board)

Website React/Vite/Three.js 3D, public, no login, no Supabase.

## What's new
- Integrated user-supplied Esp32C3Board.tsx and ESP32-C3-DevKitM-1 pin data.
- 30 independently clickable pins (`J1-01` through `J3-15`), wired via `partId:pinId`.
- Old saved projects with virtual pins GPIO2, GPIO4, GND and 3V3 are migrated when loaded.
- GPIO2 demo circuit uses J1-04 and J1-01 GND.
- Enhanced PCB details: SMDs, antenna, USB shell, metal contacts and silk labels.
- Camera rotation 360 enabled again, with zoom/pan and reset.
- Retains white/blue UI, inspector, project import/export, delete-part operation and no grid.

## Limits
- Board shape and pin location are visual approximations, NOT verified manufacture-accurate PCB footprints; verify orientation with Espressif datasheet before relying on electrical pin placement.
- This is not ESP32-C3 Super Mini; it is a model of ESP32-C3-DevKitM-1.
- No Arduino C++ execution: the Run button toggles a virtual GPIO state only.
- Models are procedurally drawn by Three.js, not scanned photorealistic GLB assets.

## Install / build
`npm install` then `npm run build` (Vite outputs `dist/`).

## Deploy
Replace the repository root with this package and delete any stale `src/supabase.ts` left by old uploads. Push to GitHub and Vercel will redeploy.
