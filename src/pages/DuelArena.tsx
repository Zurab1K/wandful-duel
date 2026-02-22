import { useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHandTracking } from "@/hooks/useHandTracking";
import { INITIAL_GAME_STATE, SPELLS, type GameState } from "@/lib/spells";
import { recognizeGesture, gestureToSpell, type SpellGesture } from "@/lib/gestureRecognizer";
import SpellHUD from "@/components/game/SpellHUD";
import WandCanvas from "@/components/game/WandCanvas";
import DungeonScene from "@/components/game/DungeonScene";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default function DuelArena() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });
  const [showScene, setShowScene] = useState(true);
  const [spellActive, setSpellActive] = useState(false);
  const [activeSpellColor, setActiveSpellColor] = useState("#ef4444");
  const [pathGesture, setPathGesture] = useState<SpellGesture>("none");
  const playerSpellHistory = useRef<string[]>([]);
  const [enemyTaunt, setEnemyTaunt] = useState<string | null>(null);

  const {
    isLoading,
    isTracking,
    error,
    hands,
    wandTrail,
    startTracking,
    stopTracking,
  } = useHandTracking(videoRef);

  // Navigation hand - off-hand controls movement
  const navHand = hands.find((h) => h.handedness === "Left");
  const wandHand = hands.find((h) => h.handedness === "Right");

  // Wand path gesture recognition
  useEffect(() => {
    if (wandTrail.length > 5) {
      const gesture = recognizeGesture(wandTrail);
      setPathGesture(gesture);
    }
  }, [wandTrail]);

  const castCooldownRef = useRef(false);

  // Play voice taunt
  const playTaunt = useCallback(async (text: string) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/voice-taunt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) return;

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.volume = 0.7;
      await audio.play();
    } catch (err) {
      console.error("Voice taunt failed:", err);
    }
  }, []);

  // AI opponent turn
  const triggerEnemyTurn = useCallback(async (newGameState: GameState) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-opponent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          playerSpells: playerSpellHistory.current.slice(-3),
          playerHealth: newGameState.playerHealth,
          enemyHealth: newGameState.enemyHealth,
          enemyMana: newGameState.enemyMana,
        }),
      });

      const data = await response.json();
      if (data.error) {
        console.error("AI opponent error:", data.error);
        return;
      }

      const enemySpell = SPELLS.find((s) => s.name === data.spell);

      // Show taunt
      setEnemyTaunt(data.taunt);
      setTimeout(() => setEnemyTaunt(null), 3000);

      // Play voice taunt
      playTaunt(data.taunt);

      // Apply enemy spell
      if (enemySpell) {
        setTimeout(() => {
          setGameState((prev) => {
            const updated = { ...prev };
            updated.enemyMana = Math.max(0, prev.enemyMana - enemySpell.manaCost);

            if (!enemySpell.isDefensive && !prev.shieldActive) {
              updated.playerHealth = Math.max(0, prev.playerHealth - enemySpell.damage);
            } else if (!enemySpell.isDefensive && prev.shieldActive) {
              // Shield blocks it
              toast({ title: "Protego!", description: `Blocked ${enemySpell.name}!` });
            }
            return updated;
          });
        }, 1000);
      }
    } catch (err) {
      console.error("AI opponent error:", err);
    }
  }, [playTaunt]);

  // Cast spell
  const castSpell = useCallback((spellName: string) => {
    if (castCooldownRef.current) return;

    const spell = SPELLS.find((s) => s.name === spellName);
    if (!spell) return;

    setGameState((prev) => {
      if (prev.playerMana < spell.manaCost) {
        toast({ title: "Not enough mana!", variant: "destructive" });
        return prev;
      }

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

      // Track history
      playerSpellHistory.current.push(spell.name);

      // Trigger spell visual
      setActiveSpellColor(spell.color);
      setSpellActive(true);
      setTimeout(() => setSpellActive(false), 800);

      // Trigger AI opponent response
      setTimeout(() => triggerEnemyTurn(newState), 1500);

      return newState;
    });

    castCooldownRef.current = true;
    setTimeout(() => {
      castCooldownRef.current = false;
      setGameState((s) => ({ ...s, lastSpellCast: null }));
    }, 2000);
  }, [triggerEnemyTurn]);

  // Watch for hand gestures (simple gestures)
  const lastGestureRef = useRef("");
  useEffect(() => {
    if (wandHand && wandHand.gesture !== lastGestureRef.current) {
      lastGestureRef.current = wandHand.gesture;
      if (wandHand.gesture === "fist") castSpell("Expelliarmus");
      else if (wandHand.gesture === "open_palm") castSpell("Protego");
      else if (wandHand.gesture === "pointing") castSpell("Stupefy");
      else if (wandHand.gesture === "peace") castSpell("Lumos");
    }
  }, [wandHand, castSpell]);

  // Watch for path gestures
  const lastPathGestureRef = useRef<SpellGesture>("none");
  useEffect(() => {
    if (pathGesture !== "none" && pathGesture !== lastPathGestureRef.current) {
      const spellName = gestureToSpell(pathGesture);
      if (spellName) {
        castSpell(spellName);
        toast({ title: `${pathGesture} gesture detected!`, description: `Casting ${spellName}` });
      }
    }
    lastPathGestureRef.current = pathGesture;
  }, [pathGesture, castSpell]);

  // Mana regen
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState((s) => ({
        ...s,
        playerMana: Math.min(100, s.playerMana + 2),
        enemyMana: Math.min(100, s.enemyMana + 1),
      }));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Video dimensions
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

  // Game over check
  useEffect(() => {
    if (gameState.playerHealth <= 0) {
      toast({ title: "Defeat!", description: "The opponent has bested you...", variant: "destructive" });
      setTimeout(() => {
        setGameState(INITIAL_GAME_STATE);
        playerSpellHistory.current = [];
      }, 3000);
    }
    if (gameState.enemyHealth <= 0) {
      toast({ title: "Victory!", description: "You are the champion duelist!" });
      setTimeout(() => {
        setGameState(INITIAL_GAME_STATE);
        playerSpellHistory.current = [];
      }, 3000);
    }
  }, [gameState.playerHealth, gameState.enemyHealth]);

  const currentGesture = wandHand?.gesture || "";
  const wandTip = wandHand?.wandTip || null;

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden" ref={containerRef}>
      {/* 3D Dungeon Scene */}
      {showScene && isTracking && (
        <DungeonScene
          wandScreenPos={wandTip}
          spellActive={spellActive}
          spellColor={activeSpellColor}
          shieldActive={gameState.shieldActive}
        />
      )}

      {/* Webcam feed (semi-transparent over 3D) */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform: "scaleX(-1)",
          opacity: isTracking && showScene ? 0.3 : isTracking ? 0.8 : 0,
          zIndex: showScene ? 5 : 0,
        }}
        playsInline
        muted
      />

      {/* Wand trail canvas */}
      {isTracking && (
        <WandCanvas
          hands={hands}
          wandTrail={wandTrail}
          width={videoDimensions.width}
          height={videoDimensions.height}
        />
      )}

      {/* HUD */}
      {isTracking && (
        <SpellHUD gameState={gameState} detectedGesture={currentGesture} />
      )}

      {/* Path gesture indicator */}
      {isTracking && pathGesture !== "none" && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-parchment rounded-lg px-4 py-2">
          <span className="font-display text-sm text-spell-blue tracking-wider uppercase">
            Wand Pattern: {pathGesture}
          </span>
        </div>
      )}

      {/* Enemy taunt */}
      {enemyTaunt && isTracking && (
        <div className="absolute top-32 right-4 z-30 max-w-xs bg-parchment rounded-lg px-4 py-3 border border-accent/30">
          <p className="font-display text-xs text-accent tracking-wider uppercase mb-1">Opponent</p>
          <p className="font-body text-sm text-foreground/90 italic">"{enemyTaunt}"</p>
        </div>
      )}

      {/* Navigation hand indicator */}
      {navHand && isTracking && (
        <div className="absolute bottom-24 right-4 z-30 bg-parchment rounded-lg px-3 py-2">
          <p className="font-display text-[10px] text-muted-foreground tracking-wider uppercase">Nav Hand</p>
          <p className="font-display text-xs text-primary">
            {navHand.gesture === "fist" ? "🏃 Sprint" : navHand.gesture === "open_palm" ? "🛡️ Block" : "✋ Ready"}
          </p>
        </div>
      )}

      {/* Controls overlay */}
      {!isTracking && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/80">
          <div className="text-center space-y-6 max-w-lg px-6">
            <h2 className="font-display text-3xl text-primary text-glow-gold">
              Duel Arena
            </h2>
            <p className="font-body text-lg text-foreground/70">
              Enable your webcam to begin. Hold a stick as your wand and use
              hand gestures to cast spells. An AI wizard opponent will counter
              your moves with snarky taunts!
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
                Hand Gestures
              </h3>
              <div className="space-y-2 font-body text-sm text-foreground/80">
                <div>✊ <strong>Fist</strong> → Expelliarmus (disarm)</div>
                <div>🖐️ <strong>Open Palm</strong> → Protego (shield)</div>
                <div>☝️ <strong>Point</strong> → Stupefy (stun)</div>
                <div>✌️ <strong>Peace</strong> → Lumos (light)</div>
              </div>
              <h3 className="font-display text-sm text-primary tracking-wider uppercase mt-4 mb-3">
                Wand Patterns
              </h3>
              <div className="space-y-2 font-body text-sm text-foreground/80">
                <div>✏️ <strong>Draw V</strong> → Expelliarmus</div>
                <div>⭕ <strong>Draw Circle</strong> → Protego</div>
                <div>➖ <strong>Draw Line</strong> → Stupefy</div>
                <div>⚡ <strong>Draw Zigzag</strong> → Incendio</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exit + toggle buttons */}
      {isTracking && (
        <div className="absolute top-4 left-4 z-30 flex gap-2 pointer-events-auto">
          <Button
            variant="spell"
            size="sm"
            onClick={() => {
              stopTracking();
              navigate("/");
            }}
          >
            ✕ Exit
          </Button>
          <Button
            variant="spell"
            size="sm"
            onClick={() => setShowScene((s) => !s)}
          >
            {showScene ? "🎥 Webcam" : "🏰 3D Arena"}
          </Button>
        </div>
      )}
    </div>
  );
}
