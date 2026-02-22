import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useHandTracking } from "@/hooks/useHandTracking";
import MaraudersMap from "@/components/game/MaraudersMap";
import WandCanvas from "@/components/game/WandCanvas";
import { Button } from "@/components/ui/button";
import {
  INITIAL_NPCS,
  ENCOUNTER_RADIUS,
  type NPC,
} from "@/lib/hogwartsLocations";
import { toast } from "@/hooks/use-toast";

const WEBCAM_W = 200;
const WEBCAM_H = 150;

export default function HogwartsMap() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playerPos, setPlayerPos] = useState({ x: 0.5, y: 0.55 });
  const [npcs, setNpcs] = useState<NPC[]>(INITIAL_NPCS);
  const [nearbyNPC, setNearbyNPC] = useState<NPC | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const {
    isLoading,
    isTracking,
    error,
    hands,
    wandTrail,
    startTracking,
    stopTracking,
  } = useHandTracking(videoRef);

  const navHand = hands.find((h) => h.handedness === "Left");

  // Move player based on left hand position
  useEffect(() => {
    if (!navHand?.wandTip) return;

    // Map hand position to movement direction (center = no movement)
    const dx = (navHand.wandTip.x - 0.5) * 0.008;
    const dy = (navHand.wandTip.y - 0.5) * 0.008;

    setPlayerPos((prev) => ({
      x: Math.max(0.05, Math.min(0.95, prev.x - dx)), // inverted x (mirror)
      y: Math.max(0.08, Math.min(0.95, prev.y + dy)),
    }));
  }, [navHand]);

  // Move NPCs
  useEffect(() => {
    const interval = setInterval(() => {
      setNpcs((prev) =>
        prev.map((npc) => {
          const dx = npc.targetX - npc.x;
          const dy = npc.targetY - npc.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Reached target — pick new random target
          if (dist < 0.02) {
            return {
              ...npc,
              targetX: 0.1 + Math.random() * 0.8,
              targetY: 0.15 + Math.random() * 0.7,
            };
          }

          const speed = 0.003;
          return {
            ...npc,
            x: npc.x + (dx / dist) * speed,
            y: npc.y + (dy / dist) * speed,
          };
        })
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Check NPC encounters
  useEffect(() => {
    let closest: NPC | null = null;
    let closestDist = Infinity;

    for (const npc of npcs) {
      const dx = playerPos.x - npc.x;
      const dy = playerPos.y - npc.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < ENCOUNTER_RADIUS && dist < closestDist) {
        closest = npc;
        closestDist = dist;
      }
    }
    setNearbyNPC(closest);
  }, [playerPos, npcs]);

  // Start duel on right-hand gesture (fist or pointing)
  const wandHand = hands.find((h) => h.handedness === "Right");
  const lastGesture = useRef("");

  useEffect(() => {
    if (!wandHand || !nearbyNPC) return;
    if (
      wandHand.gesture !== lastGesture.current &&
      (wandHand.gesture === "fist" || wandHand.gesture === "pointing")
    ) {
      // Start duel!
      stopTracking();
      navigate("/duel", {
        state: {
          opponent: {
            name: nearbyNPC.name,
            title: nearbyNPC.title,
            level: nearbyNPC.level,
          },
        },
      });
    }
    lastGesture.current = wandHand.gesture;
  }, [wandHand, nearbyNPC, navigate, stopTracking]);

  // Dimensions
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-background overflow-hidden"
    >
      {/* Map fills the screen */}
      {isTracking && (
        <div className="absolute inset-0 z-0">
          <MaraudersMap
            playerPos={playerPos}
            npcs={npcs}
            width={dimensions.width}
            height={dimensions.height}
            nearbyNPC={nearbyNPC}
          />
        </div>
      )}

      {/* Encounter prompt */}
      {nearbyNPC && isTracking && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-parchment rounded-lg px-6 py-3 text-center">
          <p className="font-display text-sm text-primary tracking-wider uppercase">
            {nearbyNPC.hostile ? "⚔️ Hostile" : "🤝 Friendly"} Encounter
          </p>
          <p className="font-display text-lg text-foreground mt-1">
            {nearbyNPC.name}{" "}
            <span className="text-muted-foreground text-sm">
              — {nearbyNPC.title} (Lvl {nearbyNPC.level})
            </span>
          </p>
          <p className="font-body text-xs text-muted-foreground mt-2">
            Make a fist or point with wand hand to duel!
          </p>
        </div>
      )}

      {/* Webcam corner */}
      <div
        className={`absolute z-30 rounded-lg overflow-hidden border-2 border-primary/50 shadow-lg transition-all ${
          isTracking ? "top-4 right-4" : "-left-[9999px]"
        }`}
        style={{ width: WEBCAM_W, height: WEBCAM_H }}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
          playsInline
          muted
        />
        {isTracking && (
          <WandCanvas
            hands={hands}
            wandTrail={wandTrail}
            width={WEBCAM_W}
            height={WEBCAM_H}
          />
        )}
      </div>

      {/* Direction hint */}
      {isTracking && !nearbyNPC && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-parchment rounded-lg px-4 py-2">
          <p className="font-body text-xs text-muted-foreground">
            ✋ Move left hand to navigate • 👊 Fist near NPC to duel
          </p>
        </div>
      )}

      {/* Pre-game overlay */}
      {!isTracking && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/90">
          <div className="text-center space-y-6 max-w-lg px-6">
            <h2 className="font-display text-4xl text-primary text-glow-gold">
              The Marauder's Map
            </h2>
            <p className="font-body text-sm text-muted-foreground italic">
              "I solemnly swear that I am up to no good"
            </p>
            <p className="font-body text-lg text-foreground/80">
              Navigate Hogwarts with your left hand. Approach other wizards to
              initiate duels. Your right hand controls your wand.
            </p>

            {error && (
              <div className="bg-accent/20 border border-accent/40 rounded-lg p-3 text-accent text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Button
                variant="hero"
                size="lg"
                className="w-full h-14"
                onClick={startTracking}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "🗺️ Open Map"}
              </Button>
              <Button
                variant="spell"
                size="lg"
                className="w-full"
                onClick={() => navigate("/")}
              >
                ← Back to Hall
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Exit */}
      {isTracking && (
        <div className="absolute bottom-4 right-4 z-30">
          <Button
            variant="spell"
            size="sm"
            onClick={() => {
              stopTracking();
              navigate("/");
            }}
          >
            ✕ Exit Map
          </Button>
        </div>
      )}
    </div>
  );
}
