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
    if (headPose && headPose.faceLandmarks) {
      const fl = headPose.faceLandmarks;

      // MediaPipe face mesh contour indices for key facial features
      const contours: { indices: number[]; connect: boolean }[] = [
        // Face oval / jawline
        { indices: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10], connect: true },
        // Left eyebrow
        { indices: [276, 283, 282, 295, 285, 300, 293, 334, 296, 336], connect: true },
        // Right eyebrow
        { indices: [46, 53, 52, 65, 55, 70, 63, 105, 66, 107], connect: true },
        // Left eye
        { indices: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398, 362], connect: true },
        // Right eye
        { indices: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33], connect: true },
        // Nose bridge
        { indices: [168, 6, 197, 195, 5, 4, 1, 19, 94, 2], connect: true },
        // Nose bottom
        { indices: [98, 240, 75, 59, 166, 219, 218, 237, 44, 1, 274, 457, 438, 439, 392, 289, 305, 270, 460, 327], connect: true },
        // Outer lips
        { indices: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185, 61], connect: true },
        // Inner lips
        { indices: [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191, 78], connect: true },
      ];

      // Draw contour lines
      ctx.strokeStyle = "rgba(34, 197, 94, 0.4)";
      ctx.lineWidth = 1;
      for (const contour of contours) {
        if (!contour.connect) continue;
        ctx.beginPath();
        for (let i = 0; i < contour.indices.length; i++) {
          const idx = contour.indices[i];
          if (idx >= fl.length) continue;
          const fx = fl[idx].x * width;
          const fy = fl[idx].y * height;
          if (i === 0) ctx.moveTo(fx, fy);
          else ctx.lineTo(fx, fy);
        }
        ctx.stroke();
      }

      // Draw dots at contour vertices
      const drawnIndices = new Set<number>();
      for (const contour of contours) {
        for (const idx of contour.indices) {
          if (idx >= fl.length || drawnIndices.has(idx)) continue;
          drawnIndices.add(idx);
          const fx = fl[idx].x * width;
          const fy = fl[idx].y * height;
          ctx.beginPath();
          ctx.arc(fx, fy, 2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(34, 197, 94, 0.7)";
          ctx.fill();
        }
      }

      // Nose tip glow
      const hx = headPose.x * width;
      const hy = headPose.y * height;
      const gradient = ctx.createRadialGradient(hx, hy, 0, hx, hy, 10);
      gradient.addColorStop(0, "rgba(34, 197, 94, 0.7)");
      gradient.addColorStop(1, "rgba(34, 197, 94, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(hx, hy, 10, 0, Math.PI * 2);
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
