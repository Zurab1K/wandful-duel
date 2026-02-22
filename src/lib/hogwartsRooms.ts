export interface RoomDef {
  id: string;
  name: string;
  /** Room center in world coords */
  center: [number, number, number];
  /** Room half-extents (width/2, height/2, depth/2) */
  size: [number, number, number];
  /** Wall color */
  wallColor: string;
  floorColor: string;
  ceilingColor: string;
  /** Ambient light color & intensity */
  ambientColor: string;
  ambientIntensity: number;
  /** Torches / point lights */
  lights: Array<{ position: [number, number, number]; color: string; intensity: number }>;
  /** Simple props (boxes/cylinders) */
  props: Array<{
    type: "box" | "cylinder";
    position: [number, number, number];
    size: [number, number, number]; // width, height, depth for box; radiusTop, height, radiusBottom for cylinder
    color: string;
    label?: string;
  }>;
  /** Doorways - openings that connect to other rooms */
  doors: Array<{
    /** Position of the door in world coords */
    position: [number, number, number];
    /** Which wall: north (-z), south (+z), east (+x), west (-x) */
    wall: "north" | "south" | "east" | "west";
    /** Target room id */
    targetRoom: string;
    /** Where player appears in target room */
    spawnPosition: [number, number, number];
    spawnRotation: number; // Y rotation in radians
  }>;
  /** NPCs in this room */
  npcs: Array<{
    id: string;
    name: string;
    title: string;
    position: [number, number, number];
    hostile: boolean;
    level: number;
    robeColor: string;
  }>;
}

export const ROOMS: RoomDef[] = [
  {
    id: "great-hall",
    name: "Great Hall",
    center: [0, 0, 0],
    size: [12, 5, 18],
    wallColor: "#4a4038",
    floorColor: "#3a3228",
    ceilingColor: "#2a2520",
    ambientColor: "#ffd699",
    ambientIntensity: 0.15,
    lights: [
      { position: [-5, 4, -6], color: "#ff9944", intensity: 1.5 },
      { position: [5, 4, -6], color: "#ff9944", intensity: 1.5 },
      { position: [-5, 4, 0], color: "#ff9944", intensity: 1.2 },
      { position: [5, 4, 0], color: "#ff9944", intensity: 1.2 },
      { position: [-5, 4, 6], color: "#ff9944", intensity: 1.5 },
      { position: [5, 4, 6], color: "#ff9944", intensity: 1.5 },
      { position: [0, 4.5, 0], color: "#ffeebb", intensity: 0.5 }, // chandelier
    ],
    props: [
      // Long tables
      { type: "box", position: [-3, 0.4, 0], size: [2, 0.1, 14], color: "#5a3a1a", label: "Gryffindor Table" },
      { type: "box", position: [3, 0.4, 0], size: [2, 0.1, 14], color: "#5a3a1a", label: "Slytherin Table" },
      // Benches
      { type: "box", position: [-3, 0.2, -3], size: [1.8, 0.05, 1], color: "#4a2a0a" },
      { type: "box", position: [-3, 0.2, 3], size: [1.8, 0.05, 1], color: "#4a2a0a" },
      { type: "box", position: [3, 0.2, -3], size: [1.8, 0.05, 1], color: "#4a2a0a" },
      { type: "box", position: [3, 0.2, 3], size: [1.8, 0.05, 1], color: "#4a2a0a" },
      // Head table
      { type: "box", position: [0, 0.5, -8], size: [8, 0.1, 1.5], color: "#6a4a2a", label: "Head Table" },
    ],
    doors: [
      {
        position: [0, 0, 9],
        wall: "south",
        targetRoom: "courtyard",
        spawnPosition: [0, 0, -7],
        spawnRotation: 0,
      },
      {
        position: [-6, 0, 0],
        wall: "west",
        targetRoom: "library",
        spawnPosition: [5, 0, 0],
        spawnRotation: Math.PI / 2,
      },
    ],
    npcs: [
      { id: "hermione", name: "Hermione", title: "Brightest Witch", position: [-3, 0, 2], hostile: false, level: 5, robeColor: "#8b0000" },
    ],
  },
  {
    id: "courtyard",
    name: "Grand Courtyard",
    center: [0, 0, 30],
    size: [16, 4, 16],
    wallColor: "#5a5248",
    floorColor: "#4a4640",
    ceilingColor: "#3a3835",
    ambientColor: "#aabbdd",
    ambientIntensity: 0.3,
    lights: [
      { position: [-7, 3, -7], color: "#ffaa55", intensity: 1 },
      { position: [7, 3, -7], color: "#ffaa55", intensity: 1 },
      { position: [-7, 3, 7], color: "#ffaa55", intensity: 1 },
      { position: [7, 3, 7], color: "#ffaa55", intensity: 1 },
      { position: [0, 3.5, 0], color: "#8899cc", intensity: 0.6 }, // moonlight
    ],
    props: [
      // Fountain
      { type: "cylinder", position: [0, 0.5, 0], size: [1.5, 1, 1.5], color: "#6a6a6a", label: "Fountain" },
      { type: "cylinder", position: [0, 1.2, 0], size: [0.8, 0.4, 0.8], color: "#7a7a7a" },
      // Pillars
      { type: "box", position: [-6, 1.5, -6], size: [0.6, 3, 0.6], color: "#5a5a5a" },
      { type: "box", position: [6, 1.5, -6], size: [0.6, 3, 0.6], color: "#5a5a5a" },
      { type: "box", position: [-6, 1.5, 6], size: [0.6, 3, 0.6], color: "#5a5a5a" },
      { type: "box", position: [6, 1.5, 6], size: [0.6, 3, 0.6], color: "#5a5a5a" },
    ],
    doors: [
      {
        position: [0, 0, -8],
        wall: "north",
        targetRoom: "great-hall",
        spawnPosition: [0, 0, 7],
        spawnRotation: Math.PI,
      },
      {
        position: [8, 0, 0],
        wall: "east",
        targetRoom: "dungeon",
        spawnPosition: [-4, 0, 0],
        spawnRotation: -Math.PI / 2,
      },
      {
        position: [0, 0, 8],
        wall: "south",
        targetRoom: "common-room",
        spawnPosition: [0, 0, -4],
        spawnRotation: 0,
      },
    ],
    npcs: [
      { id: "draco", name: "Draco", title: "Slytherin Prefect", position: [3, 0, 3], hostile: true, level: 3, robeColor: "#1a5a1a" },
      { id: "luna", name: "Luna", title: "Ravenclaw Oddity", position: [-4, 0, 2], hostile: false, level: 2, robeColor: "#1a3a6a" },
    ],
  },
  {
    id: "library",
    name: "Library",
    center: [-20, 0, 0],
    size: [10, 4, 12],
    wallColor: "#3a3530",
    floorColor: "#2a2822",
    ceilingColor: "#1a1815",
    ambientColor: "#ffddaa",
    ambientIntensity: 0.1,
    lights: [
      { position: [0, 3, -4], color: "#ffcc77", intensity: 0.8 },
      { position: [0, 3, 4], color: "#ffcc77", intensity: 0.8 },
      { position: [-3, 3, 0], color: "#ffcc77", intensity: 0.6 },
    ],
    props: [
      // Bookshelves along walls
      { type: "box", position: [-4, 1.5, -3], size: [0.6, 3, 3], color: "#4a3020", label: "Bookshelf" },
      { type: "box", position: [-4, 1.5, 3], size: [0.6, 3, 3], color: "#4a3020" },
      { type: "box", position: [0, 1.5, -5.5], size: [6, 3, 0.6], color: "#4a3020" },
      // Reading tables
      { type: "box", position: [0, 0.4, 0], size: [3, 0.08, 1.5], color: "#5a3a1a" },
      { type: "box", position: [0, 0.4, 3], size: [2, 0.08, 1], color: "#5a3a1a" },
    ],
    doors: [
      {
        position: [5, 0, 0],
        wall: "east",
        targetRoom: "great-hall",
        spawnPosition: [-5, 0, 0],
        spawnRotation: -Math.PI / 2,
      },
    ],
    npcs: [
      { id: "snape", name: "Snape", title: "Potions Master", position: [-2, 0, -3], hostile: true, level: 8, robeColor: "#0a0a0a" },
    ],
  },
  {
    id: "dungeon",
    name: "Dungeons",
    center: [25, -2, 30],
    size: [10, 3.5, 14],
    wallColor: "#2a2822",
    floorColor: "#1a1a18",
    ceilingColor: "#151512",
    ambientColor: "#335544",
    ambientIntensity: 0.06,
    lights: [
      { position: [-4, 2.5, -5], color: "#44dd66", intensity: 0.8 },
      { position: [4, 2.5, -5], color: "#44dd66", intensity: 0.8 },
      { position: [-4, 2.5, 5], color: "#ff6633", intensity: 0.6 },
      { position: [4, 2.5, 5], color: "#ff6633", intensity: 0.6 },
    ],
    props: [
      // Cauldrons
      { type: "cylinder", position: [-2, 0.3, -3], size: [0.4, 0.6, 0.4], color: "#2a2a2a", label: "Cauldron" },
      { type: "cylinder", position: [2, 0.3, -3], size: [0.4, 0.6, 0.4], color: "#2a2a2a" },
      // Potion shelves
      { type: "box", position: [-4, 1.2, 0], size: [0.5, 2.4, 8], color: "#3a2a18" },
      { type: "box", position: [4, 1.2, 0], size: [0.5, 2.4, 8], color: "#3a2a18" },
      // Workbench
      { type: "box", position: [0, 0.45, 3], size: [4, 0.08, 1.5], color: "#4a3a2a" },
    ],
    doors: [
      {
        position: [-5, 0, 0],
        wall: "west",
        targetRoom: "courtyard",
        spawnPosition: [6, 0, 0],
        spawnRotation: Math.PI / 2,
      },
    ],
    npcs: [
      { id: "bellatrix", name: "Bellatrix", title: "Death Eater", position: [0, 0, -4], hostile: true, level: 9, robeColor: "#1a0a1a" },
    ],
  },
  {
    id: "common-room",
    name: "Common Room",
    center: [0, 0, 55],
    size: [10, 4, 10],
    wallColor: "#5a2a1a",
    floorColor: "#3a2218",
    ceilingColor: "#2a1a12",
    ambientColor: "#ff8844",
    ambientIntensity: 0.15,
    lights: [
      { position: [0, 3, -3], color: "#ff6622", intensity: 1.5 }, // fireplace
      { position: [-3, 3, 3], color: "#ffaa55", intensity: 0.6 },
      { position: [3, 3, 3], color: "#ffaa55", intensity: 0.6 },
    ],
    props: [
      // Fireplace
      { type: "box", position: [0, 1, -4.5], size: [3, 2, 0.5], color: "#4a3a2a", label: "Fireplace" },
      // Armchairs
      { type: "box", position: [-2, 0.3, -2], size: [1, 0.6, 1], color: "#8b1a1a" },
      { type: "box", position: [2, 0.3, -2], size: [1, 0.6, 1], color: "#8b1a1a" },
      // Sofa
      { type: "box", position: [0, 0.3, 0], size: [3, 0.5, 1.2], color: "#8b1a1a" },
      // Table
      { type: "box", position: [0, 0.35, -1], size: [1.5, 0.05, 0.8], color: "#5a3a1a" },
    ],
    doors: [
      {
        position: [0, 0, -5],
        wall: "north",
        targetRoom: "courtyard",
        spawnPosition: [0, 0, 6],
        spawnRotation: Math.PI,
      },
    ],
    npcs: [
      { id: "neville", name: "Neville", title: "Herbology Student", position: [2, 0, 1], hostile: false, level: 1, robeColor: "#8b0000" },
    ],
  },
];

export function getRoomById(id: string): RoomDef | undefined {
  return ROOMS.find((r) => r.id === id);
}
