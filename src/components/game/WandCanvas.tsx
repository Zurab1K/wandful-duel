import { useRef, useEffect } from "react";
import type { HandData, HeadPose } from "@/hooks/useHandTracking";

interface WandCanvasProps {
  hands: HandData[];
  wandTrail: Array<{ x: number; y: number; t: number }>;
  width: number;
  height: number;
  headPose?: HeadPose | null;
}

export default function WandCanvas({ hands, wandTrail, width, height, headPose }: WandCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    // Draw wand trail
    if (wandTrail.length > 1) {
      const now = performance.now();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let i = 1; i < wandTrail.length; i++) {
        const age = (now - wandTrail[i].t) / 1000;
        const alpha = Math.max(0, 1 - age * 1.5);
        const lineWidth = Math.max(1, (1 - age) * 6);

        ctx.beginPath();
        ctx.moveTo(wandTrail[i - 1].x * width, wandTrail[i - 1].y * height);
        ctx.lineTo(wandTrail[i].x * width, wandTrail[i].y * height);

        ctx.strokeStyle = `rgba(234, 179, 8, ${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        ctx.strokeStyle = `rgba(234, 179, 8, ${alpha * 0.3})`;
        ctx.lineWidth = lineWidth * 3;
        ctx.stroke();
      }
    }

    // Draw hand landmarks
    for (const hand of hands) {
      const lm = hand.landmarks;
      if (!lm || lm.length < 21) continue;

      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
        [5, 9], [9, 13], [13, 17],
      ];

      ctx.strokeStyle = "rgba(234, 179, 8, 0.4)";
      ctx.lineWidth = 1.5;
      for (const [a, b] of connections) {
        ctx.beginPath();
        ctx.moveTo(lm[a].x * width, lm[a].y * height);
        ctx.lineTo(lm[b].x * width, lm[b].y * height);
        ctx.stroke();
      }

      for (let i = 0; i < lm.length; i++) {
        const x = lm[i].x * width;
        const y = lm[i].y * height;
        ctx.beginPath();
        ctx.arc(x, y, i === 8 ? 6 : 3, 0, Math.PI * 2);
        ctx.fillStyle = i === 8 ? "rgba(234, 179, 8, 1)" : "rgba(234, 179, 8, 0.6)";
        ctx.fill();
      }

      if (hand.wandTip) {
        const wx = hand.wandTip.x * width;
        const wy = hand.wandTip.y * height;
        const gradient = ctx.createRadialGradient(wx, wy, 0, wx, wy, 25);
        gradient.addColorStop(0, "rgba(234, 179, 8, 0.8)");
        gradient.addColorStop(0.5, "rgba(234, 179, 8, 0.2)");
        gradient.addColorStop(1, "rgba(234, 179, 8, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(wx, wy, 25, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw head pose indicator
    if (headPose) {
      if (headPose.faceLandmarks) {
        for (let i = 0; i < headPose.faceLandmarks.length; i += 7) {
          const lm = headPose.faceLandmarks[i];
          const fx = lm.x * width;
          const fy = lm.y * height;
          ctx.beginPath();
          ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(34, 197, 94, 0.6)";
          ctx.fill();
        }
      }

      // Nose tip glow
      const hx = headPose.x * width;
      const hy = headPose.y * height;
      const gradient = ctx.createRadialGradient(hx, hy, 0, hx, hy, 14);
      gradient.addColorStop(0, "rgba(34, 197, 94, 0.9)");
      gradient.addColorStop(0.5, "rgba(34, 197, 94, 0.3)");
      gradient.addColorStop(1, "rgba(34, 197, 94, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(hx, hy, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(hx, hy, 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(34, 197, 94, 1)";
      ctx.fill();
    }
  }, [hands, wandTrail, width, height, headPose]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10 pointer-events-none"
      style={{ width, height, transform: "scaleX(-1)" }}
    />
  );
}
