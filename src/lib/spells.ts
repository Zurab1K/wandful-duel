export interface Spell {
  name: string;
  gesture: string;
  description: string;
  color: string;
  cssColor: string;
  damage: number;
  manaCost: number;
  icon: string;
  isDefensive: boolean;
}

export const SPELLS: Spell[] = [
  {
    name: "Expelliarmus",
    gesture: "V shape",
    description: "Disarming charm",
    color: "#ef4444",
    cssColor: "hsl(var(--spell-red))",
    damage: 25,
    manaCost: 20,
    icon: "⚡",
    isDefensive: false,
  },
  {
    name: "Protego",
    gesture: "Circle",
    description: "Shield charm",
    color: "#3b82f6",
    cssColor: "hsl(var(--spell-blue))",
    damage: 0,
    manaCost: 15,
    icon: "🛡️",
    isDefensive: true,
  },
  {
    name: "Stupefy",
    gesture: "Straight line",
    description: "Stunning spell",
    color: "#f97316",
    cssColor: "hsl(var(--ember))",
    damage: 30,
    manaCost: 25,
    icon: "💫",
    isDefensive: false,
  },
  {
    name: "Lumos",
    gesture: "Point up",
    description: "Light spell",
    color: "#eab308",
    cssColor: "hsl(var(--gold-glow))",
    damage: 0,
    manaCost: 5,
    icon: "✨",
    isDefensive: false,
  },
  {
    name: "Incendio",
    gesture: "Zigzag",
    description: "Fire spell",
    color: "#dc2626",
    cssColor: "hsl(var(--spell-red))",
    damage: 35,
    manaCost: 30,
    icon: "🔥",
    isDefensive: false,
  },
];

export interface GameState {
  playerHealth: number;
  playerMana: number;
  enemyHealth: number;
  enemyMana: number;
  lastSpellCast: string | null;
  combo: number;
  shieldActive: boolean;
}

export const INITIAL_GAME_STATE: GameState = {
  playerHealth: 100,
  playerMana: 100,
  enemyHealth: 100,
  enemyMana: 100,
  lastSpellCast: null,
  combo: 0,
  shieldActive: false,
};
