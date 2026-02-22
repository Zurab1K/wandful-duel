import { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHandTracking } from "@/hooks/useHandTracking";
import { INITIAL_GAME_STATE, SPELLS, type GameState } from "@/lib/spells";
import SpellHUD from "@/components/game/SpellHUD";
import WandCanvas from "@/components/game/WandCanvas";
import { Button } from "@/components/ui/button";

export default function DuelArena() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });

  const {
    isLoading,
    isTracking,
    error,
    hands,
    wandTrail,
    startTracking,
    stopTracking,
  } = useHandTracking(videoRef);

  // Cast spell based on gesture
  const lastGestureRef = useRef<string>("");
  const castCooldownRef = useRef<boolean>(false);

  const castSpell = useCallback((gesture: string) => {
    if (castCooldownRef.current) return;

    let spell = null;
    if (gesture === "pointing") spell = SPELLS.find((s) => s.name === "Stupefy");
    if (gesture === "open_palm") spell = SPELLS.find((s) => s.name === "Protego");
    if (gesture === "fist") spell = SPELLS.find((s) => s.name === "Expelliarmus");
    if (gesture === "peace") spell = SPELLS.find((s) => s.name === "Lumos");

    if (!spell) return;

    setGameState((prev) => {
      if (prev.playerMana < spell.manaCost) return prev;

      const newState = { ...prev };
      newState.playerMana -= spell.manaCost;
      newState.lastSpellCast = spell.name;

      if (spell.isDefensive) {
        newState.shieldActive = true;
        setTimeout(() => setGameState((s) => ({ ...s, shieldActive: false })), 3000);
      } else {
        newState.enemyHealth = Math.max(0, prev.enemyHealth - spell.damage);
        newState.combo += 1;
      }

      return newState;
    });

    castCooldownRef.current = true;
    setTimeout(() => {
      castCooldownRef.current = false;
      setGameState((s) => ({ ...s, lastSpellCast: null }));
    }, 1500);
  }, []);

  // Watch for gesture changes
  useEffect(() => {
    const wand = hands.find((h) => h.handedness === "Right");
    if (wand && wand.gesture !== lastGestureRef.current) {
      lastGestureRef.current = wand.gesture;
      if (wand.gesture !== "unknown" && wand.gesture !== "partial") {
        castSpell(wand.gesture);
      }
    }
  }, [hands, castSpell]);

  // Mana regen
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState((s) => ({
        ...s,
        playerMana: Math.min(100, s.playerMana + 2),
      }));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Update video dimensions
  useEffect(() => {
    const updateDims = () => {
      if (containerRef.current) {
        setVideoDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDims();
    window.addEventListener("resize", updateDims);
    return () => window.removeEventListener("resize", updateDims);
  }, []);

  const currentGesture = hands[0]?.gesture || "";

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden" ref={containerRef}>
      {/* Webcam feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-80"
        style={{ transform: "scaleX(-1)" }}
        playsInline
        muted
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-background/30 pointer-events-none" />

      {/* Wand trail canvas */}
      <WandCanvas
        hands={hands}
        wandTrail={wandTrail}
        width={videoDimensions.width}
        height={videoDimensions.height}
      />

      {/* HUD */}
      <SpellHUD gameState={gameState} detectedGesture={currentGesture} />

      {/* Controls overlay */}
      {!isTracking && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/80">
          <div className="text-center space-y-6 max-w-md px-6">
            <h2 className="font-display text-3xl text-primary text-glow-gold">
              Duel Arena
            </h2>
            <p className="font-body text-lg text-foreground/70">
              Enable your webcam to begin. Hold a stick as your wand and use
              hand gestures to cast spells.
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
                {isLoading ? "Loading AI Model..." : "⚡ Start Duel"}
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

            {/* Gesture guide */}
            <div className="bg-parchment rounded-lg p-4 text-left">
              <h3 className="font-display text-sm text-primary tracking-wider uppercase mb-3">
                Spell Gestures
              </h3>
              <div className="space-y-2 font-body text-sm text-foreground/80">
                <div>✊ <strong>Fist</strong> → Expelliarmus (disarm)</div>
                <div>🖐️ <strong>Open Palm</strong> → Protego (shield)</div>
                <div>☝️ <strong>Point</strong> → Stupefy (stun)</div>
                <div>✌️ <strong>Peace</strong> → Lumos (light)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exit button when tracking */}
      {isTracking && (
        <Button
          variant="spell"
          size="sm"
          className="absolute top-4 left-4 z-30 pointer-events-auto"
          onClick={() => {
            stopTracking();
            navigate("/");
          }}
        >
          ✕ Exit
        </Button>
      )}
    </div>
  );
}
