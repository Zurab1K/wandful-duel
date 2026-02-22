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
      if (headPose.faceLandmarks && headPose.faceLandmarks.length >= 468) {
        const fl = headPose.faceLandmarks;

        // MediaPipe Face Mesh Tesselation connections (subset for clean wireframe)
        const MESH_CONNECTIONS: [number, number][] = [
          // Forehead & top
          [10,338],[338,297],[297,332],[332,284],[284,251],[251,389],[389,356],[356,454],
          [10,109],[109,67],[67,103],[103,54],[54,21],[21,162],[162,127],[127,234],
          [10,151],[151,9],[9,8],[8,168],[168,6],[6,197],[197,195],[195,5],
          // Left eye region
          [33,7],[7,163],[163,144],[144,145],[145,153],[153,154],[154,155],[155,133],
          [33,246],[246,161],[161,160],[160,159],[159,158],[158,157],[157,173],[173,133],
          [130,25],[25,110],[110,24],[24,23],[23,22],[22,26],[26,112],[112,243],
          // Right eye region
          [263,249],[249,390],[390,373],[373,374],[374,380],[380,381],[381,382],[382,362],
          [263,466],[466,388],[388,387],[387,386],[386,385],[385,384],[384,398],[398,362],
          [359,255],[255,339],[339,254],[254,253],[253,252],[252,256],[256,341],[341,463],
          // Left eyebrow
          [70,63],[63,105],[105,66],[66,107],[107,55],[55,65],
          // Right eyebrow
          [300,293],[293,334],[334,296],[296,336],[336,285],[285,295],
          // Nose
          [168,6],[6,197],[197,195],[195,5],[5,4],
          [48,115],[115,220],[220,45],[45,4],[4,275],[275,440],[440,344],[344,278],
          [19,94],[94,2],[2,164],[164,0],
          // Lips outer
          [61,146],[146,91],[91,181],[181,84],[84,17],[17,314],[314,405],[405,321],[321,375],[375,291],
          [61,185],[185,40],[40,39],[39,37],[37,0],[0,267],[267,269],[269,270],[270,409],[409,291],
          // Lips inner
          [78,95],[95,88],[88,178],[178,87],[87,14],[14,317],[317,402],[402,318],[318,324],[324,308],
          [78,191],[191,80],[80,81],[81,82],[82,13],[13,312],[312,311],[311,310],[310,415],[415,308],
          // Jawline
          [234,93],[93,132],[132,58],[58,172],[172,136],[136,150],[150,149],[149,176],[176,148],[148,152],
          [152,377],[377,400],[400,378],[378,379],[379,365],[365,397],[397,288],[288,361],[361,323],[323,454],
          // Cheek lines
          [234,127],[127,162],[162,21],[21,54],[54,103],[103,67],[67,109],[109,10],
          [454,356],[356,389],[389,251],[251,284],[284,332],[332,297],[297,338],[338,10],
          // Vertical connectors forehead to jaw
          [151,10],[9,151],[8,9],[168,8],[6,168],
          [109,67],[338,297],
          [127,34],[34,143],[143,116],[116,123],[123,147],[147,187],[187,207],[207,206],
          [356,264],[264,372],[372,345],[345,352],[352,376],[376,411],[411,427],[427,426],
        ];

        ctx.strokeStyle = "rgba(34, 197, 94, 0.25)";
        ctx.lineWidth = 0.7;

        for (const [a, b] of MESH_CONNECTIONS) {
          if (a >= fl.length || b >= fl.length) continue;
          ctx.beginPath();
          ctx.moveTo(fl[a].x * width, fl[a].y * height);
          ctx.lineTo(fl[b].x * width, fl[b].y * height);
          ctx.stroke();
        }

        // Small dots at key vertices (eyes, nose, lips, jawline)
        const keyPoints = [
          33, 133, 263, 362, // eye corners
          4, 5, 195, // nose
          61, 291, 0, 17, // lip corners & center
          10, 152, 234, 454, // top, chin, jaw sides
        ];
        for (const idx of keyPoints) {
          if (idx >= fl.length) continue;
          ctx.beginPath();
          ctx.arc(fl[idx].x * width, fl[idx].y * height, 2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(34, 197, 94, 0.7)";
          ctx.fill();
        }
      }
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
