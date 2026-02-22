import { useRef, useEffect, useCallback } from "react";
import {
  HOGWARTS_LOCATIONS,
  ENCOUNTER_RADIUS,
  type NPC,
} from "@/lib/hogwartsLocations";

interface MaraudersMapProps {
  playerPos: { x: number; y: number };
  npcs: NPC[];
  width: number;
  height: number;
  nearbyNPC: NPC | null;
}

export default function MaraudersMap({
  playerPos,
  npcs,
  width,
  height,
  nearbyNPC,
}: MaraudersMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    // Parchment background
    ctx.fillStyle = "hsl(38, 40%, 82%)";
    ctx.fillRect(0, 0, width, height);

    // Aged texture overlay
    for (let i = 0; i < 200; i++) {
      const tx = Math.random() * width;
      const ty = Math.random() * height;
      ctx.fillStyle = `rgba(139, 119, 80, ${Math.random() * 0.15})`;
      ctx.fillRect(tx, ty, Math.random() * 4, Math.random() * 4);
    }

    // Border
    ctx.strokeStyle = "hsl(35, 30%, 35%)";
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, width - 16, height - 16);
    ctx.lineWidth = 1;
    ctx.strokeRect(14, 14, width - 28, height - 28);

    // Title
    ctx.font = "italic 22px 'Cinzel', serif";
    ctx.fillStyle = "hsl(35, 40%, 25%)";
    ctx.textAlign = "center";
    ctx.fillText("The Marauder's Map", width / 2, 42);

    ctx.font = "italic 11px 'Crimson Text', serif";
    ctx.fillStyle = "hsl(35, 30%, 40%)";
    ctx.fillText(
      "I solemnly swear that I am up to no good",
      width / 2,
      60
    );

    // Draw corridors (lines between locations)
    const corridors = [
      [0, 1], [1, 7], [7, 2], [0, 4], [4, 5],
      [1, 6], [3, 7], [5, 1],
    ];
    ctx.strokeStyle = "hsl(35, 25%, 55%)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    for (const [a, b] of corridors) {
      const la = HOGWARTS_LOCATIONS[a];
      const lb = HOGWARTS_LOCATIONS[b];
      ctx.beginPath();
      ctx.moveTo(la.x * width, la.y * height);
      ctx.lineTo(lb.x * width, lb.y * height);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw locations
    for (const loc of HOGWARTS_LOCATIONS) {
      const lx = loc.x * width;
      const ly = loc.y * height;

      ctx.fillStyle = "hsl(35, 20%, 45%)";
      ctx.beginPath();
      ctx.arc(lx, ly, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "12px 'Cinzel', serif";
      ctx.fillStyle = "hsl(35, 30%, 25%)";
      ctx.textAlign = "center";
      ctx.fillText(loc.name, lx, ly - 12);
    }

    // Draw NPCs as footsteps
    for (const npc of npcs) {
      const nx = npc.x * width;
      const ny = npc.y * height;

      // Footstep pairs
      ctx.fillStyle = npc.hostile
        ? "hsl(0, 60%, 35%)"
        : "hsl(35, 30%, 30%)";

      // Left foot
      ctx.beginPath();
      ctx.ellipse(nx - 3, ny, 2.5, 4, -0.2, 0, Math.PI * 2);
      ctx.fill();
      // Right foot
      ctx.beginPath();
      ctx.ellipse(nx + 3, ny + 5, 2.5, 4, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Name label
      ctx.font = "italic 10px 'Crimson Text', serif";
      ctx.textAlign = "center";
      ctx.fillText(npc.name, nx, ny - 10);
    }

    // Draw player
    const px = playerPos.x * width;
    const py = playerPos.y * height;

    // Player glow
    const gradient = ctx.createRadialGradient(px, py, 0, px, py, 20);
    gradient.addColorStop(0, "hsla(42, 100%, 60%, 0.5)");
    gradient.addColorStop(1, "hsla(42, 100%, 60%, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(px, py, 20, 0, Math.PI * 2);
    ctx.fill();

    // Player footsteps
    ctx.fillStyle = "hsl(42, 80%, 40%)";
    ctx.beginPath();
    ctx.ellipse(px - 3, py, 3, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + 3, py + 6, 3, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "bold italic 11px 'Crimson Text', serif";
    ctx.fillStyle = "hsl(42, 80%, 35%)";
    ctx.textAlign = "center";
    ctx.fillText("You", px, py - 14);

    // Encounter indicator
    if (nearbyNPC) {
      const ex = nearbyNPC.x * width;
      const ey = nearbyNPC.y * height;
      const r = ENCOUNTER_RADIUS * Math.max(width, height);

      ctx.strokeStyle = "hsla(0, 80%, 50%, 0.6)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc((px + ex) / 2, (py + ey) / 2, r * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [playerPos, npcs, width, height, nearbyNPC]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: "auto" }}
    />
  );
}
