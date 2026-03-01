# The Hackwarts Duelist

The Hackwarts Duelist is a webcam-driven wizard game built with React, TypeScript, Vite, Tailwind CSS, and React Three Fiber. The app uses MediaPipe hand and face tracking so the player can navigate with head movement, cast spells with hand gestures or wand patterns, and duel NPCs inside a stylized Hogwarts-inspired world.

## 👨‍💻 About

This project was created by **Zurabi Kochiashvili** as a **solo hackathon project** at **HopperHacks 2026**, held on **February 21-22, 2026** at **Stony Brook University**.

It received the **Best Creativity Hack** award.

🎥 Demo and project page: https://devpost.com/software/the-hackwarts-duelist

## ✨ Inspiration

The goal was to make wizard dueling feel physical and magical without VR headsets, controllers, or custom hardware. The core idea was simple: if a webcam could track hands and motion reliably enough, then a stick, pencil, or even a bare hand could become a wand.

The project was also designed to be fun in a live demo setting, so the dueling system was combined with a Hogwarts-inspired world, theatrical AI opponents, and voice taunts to make the whole experience feel performative and memorable.

## 🎮 What the project does

- Landing page and house selection flow
- First-person Hogwarts exploration with 3D rooms and NPC encounters
- Duel arena with gesture-based and wand-trail-based spell casting
- AI opponent responses through a Supabase Edge Function
- Optional voiced enemy taunts through ElevenLabs via a Supabase Edge Function
- Zero-hardware interaction using the webcam as the primary input device

## 🧠 How it works

The app combines several interaction systems into one gameplay loop:

- **Hand pose recognition** for instant spell casts
- **Wand trail recognition** for motion-based spell patterns
- **Head tracking** for first-person movement in exploration mode
- **AI-driven enemy responses** for dynamic duels
- **Voice synthesis** for taunts and personality during combat

The result is a browser-based dueling game where the player can move, cast, defend, and fight using natural body motion instead of traditional controllers.

## 🗺️ Main routes

- `/` - landing page
- `/house-select` - choose a house and robe colors
- `/explore` - first-person Hogwarts exploration and NPC duels
- `/map` - 2D Marauder's Map prototype
- `/duel` - direct duel arena

## 🕹️ Controls

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

## 🛠️ How it was built

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Three Fiber / Drei / Three.js
- MediaPipe Tasks Vision
- Supabase Edge Functions
- ElevenLabs Text-to-Speech

Key implementation details:

- A custom `useHandTracking` hook manages webcam access, hand tracking, face tracking, smoothing, and wand-trail capture
- A custom gesture recognizer maps wand paths like circles, lines, V-shapes, and zigzags into spells
- Combat logic tracks mana, cooldowns, combos, shielding, and battle stats
- Supabase Edge Functions keep AI and text-to-speech integrations off the client

## 🏆 What I'm proud of

- Building a wizard dueling experience that feels interactive using only a webcam
- Combining hand poses, motion gestures, and head movement into one coherent game loop
- Giving the opponents personality through strategy, taunts, and voice playback
- Expanding the concept beyond a duel screen into a Hogwarts-inspired exploration experience

## 📚 What I learned

- Computer vision projects depend heavily on UX details like smoothing, calibration, forgiveness, and feedback
- Gesture systems need to be designed for messy real-world motion, not perfect test inputs
- Async systems like AI responses and text-to-speech have to be integrated carefully into gameplay loops
- Shipping solo under hackathon constraints rewards focusing on the core interaction loop first and polishing afterward

## 🚀 What's next

- More spells, combos, and richer casting systems
- AI opponents with different personalities and difficulty levels
- Better calibration and accessibility options, including stronger left-handed support
- More rooms, quests, progression, and world interactions
- Multiplayer duels, replays, clips, and social features

## 🧱 Project structure

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

## 📦 Requirements

- Node.js 18+ recommended
- npm
- Webcam permission in the browser
- Network access for MediaPipe model downloads

## 🔐 Environment variables

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

## 🧪 Local development

Install dependencies:

```sh
npm install
```

Start the Vite dev server on port `8080`:

```sh
npm run dev
```

Open the app in your browser and allow webcam access when prompted.

## ☁️ Supabase functions

This repo includes two edge functions configured in `supabase/config.toml`:

- `ai-opponent`
- `voice-taunt`

To work on the backend side locally, run them with your normal Supabase workflow and make sure the required secrets are present in that environment.

## 📜 Available scripts

```sh
npm run dev
npm run build
npm run build:dev
npm run lint
npm run preview
npm run test
```

## ✅ Testing status

The repository currently contains a minimal Vitest placeholder test in `src/test/example.test.ts`. It does not yet provide meaningful coverage of the tracking, rendering, or duel systems.
