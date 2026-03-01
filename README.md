# The Hackwarts Duelist

The Hackwarts Duelist is a webcam-driven wizard game built with React, TypeScript, Vite, Tailwind CSS, and React Three Fiber. The app uses MediaPipe hand and face tracking so the player can navigate with head movement, cast spells with hand gestures or wand patterns, and duel NPCs inside a stylized Hogwarts-inspired world.

## What the project does

- Landing page and house selection flow
- First-person Hogwarts exploration with 3D rooms and NPC encounters
- Duel arena with gesture-based and wand-trail-based spell casting
- AI opponent responses through a Supabase Edge Function
- Optional voiced enemy taunts through ElevenLabs via a Supabase Edge Function

## Main routes

- `/` - landing page
- `/house-select` - choose a house and robe colors
- `/explore` - first-person Hogwarts exploration and NPC duels
- `/map` - 2D Marauder's Map prototype
- `/duel` - direct duel arena

## Controls

### Explore mode

- Lean forward or backward to move
- Lean left or right to turn
- Use the wand hand to cast spells during duels
- Walk into glowing doorways to move between rooms

### Duel controls

Hand gestures:

- `fist` -> `Expelliarmus`
- `open_palm` -> `Protego`
- `pointing` -> `Stupefy`
- `peace` -> `Lumos`

Wand patterns:

- `V` -> `Expelliarmus`
- `circle` -> `Protego`
- `line` -> `Stupefy`
- `zigzag` -> `Incendio`

## Tech stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Three Fiber / Drei / Three.js
- MediaPipe Tasks Vision
- Supabase Edge Functions
- ElevenLabs Text-to-Speech

## Project structure

```text
src/
  components/game/      3D scenes, HUD, wand overlay, battle breakdown
  hooks/                webcam, hand tracking, and utility hooks
  lib/                  spells, gesture recognition, room and NPC data
  pages/                app routes
supabase/functions/
  ai-opponent/          AI spell and taunt generation
  voice-taunt/          text-to-speech taunt generation
```

## Requirements

- Node.js 18+ recommended
- npm
- Webcam permission in the browser
- Network access for MediaPipe model downloads

## Environment variables

The frontend expects:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

The Supabase Edge Functions expect:

```bash
LOVABLE_API_KEY=...
ELEVENLABS_API_KEY=...
```

Notes:

- `ai-opponent` uses `LOVABLE_API_KEY` to call the AI gateway.
- `voice-taunt` uses `ELEVENLABS_API_KEY` to synthesize spoken taunts.
- If the frontend `VITE_SUPABASE_*` values are missing, remote AI responses and voice taunts will not work.

## Local development

Install dependencies:

```sh
npm install
```

Start the Vite dev server on port `8080`:

```sh
npm run dev
```

Open the app in your browser and allow webcam access when prompted.

## Supabase functions

This repo includes two edge functions configured in `supabase/config.toml`:

- `ai-opponent`
- `voice-taunt`

To work on the backend side locally, run them with your normal Supabase workflow and make sure the required secrets are present in that environment.

## Available scripts

```sh
npm run dev
npm run build
npm run build:dev
npm run lint
npm run preview
npm run test
```

## Testing status

The repository currently contains a minimal Vitest placeholder test in `src/test/example.test.ts`. It does not yet provide meaningful coverage of the tracking, rendering, or duel systems.
