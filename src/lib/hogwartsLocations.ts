export interface HogwartsLocation {
  id: string;
  name: string;
  x: number;
  y: number;
  description: string;
}

export interface NPC {
  id: string;
  name: string;
  title: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  hostile: boolean;
  level: number;
}

export const HOGWARTS_LOCATIONS: HogwartsLocation[] = [
  { id: "great-hall", name: "Great Hall", x: 0.5, y: 0.35, description: "The main dining hall" },
  { id: "courtyard", name: "Grand Courtyard", x: 0.5, y: 0.55, description: "The central courtyard" },
  { id: "library", name: "Library", x: 0.25, y: 0.3, description: "Restricted section nearby" },
  { id: "dungeon", name: "Dungeons", x: 0.3, y: 0.75, description: "Potions classroom below" },
  { id: "tower", name: "Astronomy Tower", x: 0.75, y: 0.2, description: "Highest tower of Hogwarts" },
  { id: "common", name: "Common Room", x: 0.8, y: 0.45, description: "Your house common room" },
  { id: "grounds", name: "Castle Grounds", x: 0.65, y: 0.8, description: "Near the Forbidden Forest" },
  { id: "corridor", name: "Third Floor", x: 0.35, y: 0.5, description: "A forbidden corridor..." },
];

export const INITIAL_NPCS: NPC[] = [
  { id: "draco", name: "Draco", title: "Slytherin Prefect", x: 0.4, y: 0.6, vx: 0, vy: 0, targetX: 0.6, targetY: 0.4, hostile: true, level: 3 },
  { id: "hermione", name: "Hermione", title: "Brightest Witch", x: 0.25, y: 0.35, vx: 0, vy: 0, targetX: 0.3, targetY: 0.3, hostile: false, level: 5 },
  { id: "neville", name: "Neville", title: "Herbology Student", x: 0.6, y: 0.7, vx: 0, vy: 0, targetX: 0.5, targetY: 0.5, hostile: false, level: 1 },
  { id: "luna", name: "Luna", title: "Ravenclaw Oddity", x: 0.7, y: 0.25, vx: 0, vy: 0, targetX: 0.5, targetY: 0.6, hostile: false, level: 2 },
  { id: "snape", name: "Snape", title: "Potions Master", x: 0.3, y: 0.72, vx: 0, vy: 0, targetX: 0.5, targetY: 0.5, hostile: true, level: 8 },
  { id: "bellatrix", name: "Bellatrix", title: "Death Eater", x: 0.15, y: 0.8, vx: 0, vy: 0, targetX: 0.5, targetY: 0.3, hostile: true, level: 9 },
];

export const ENCOUNTER_RADIUS = 0.04;
