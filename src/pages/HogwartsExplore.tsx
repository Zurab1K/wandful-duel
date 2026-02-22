import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as THREE from "three";
import { useHandTracking } from "@/hooks/useHandTracking";
import { ROOMS, getRoomById, type RoomDef } from "@/lib/hogwartsRooms";
import { INITIAL_GAME_STATE, SPELLS, type GameState } from "@/lib/spells";
import { recognizeGesture, gestureToSpell, type SpellGesture } from "@/lib/gestureRecognizer";
import HogwartsWorld from "@/components/game/HogwartsWorld";
import SpellHUD from "@/components/game/SpellHUD";
import WandCanvas from "@/components/game/WandCanvas";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const WEBCAM_W = 200;
const WEBCAM_H = 150;

const NPC_ENCOUNTER_DIST = 2.5;

export default function HogwartsExplore() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const houseColor = searchParams.get("color") || "#740001";
  const houseName = searchParams.get("house") || "Gryffindor";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentRoomId, setCurrentRoomId] = useState("great-hall");
  const currentRoom = getRoomById(currentRoomId) || ROOMS[0];

  const playerPos = useRef(new THREE.Vector3(0, 1.6, 5));
  const playerRot = useRef(0); // facing north
  const moveInput = useRef({ forward: 0, turn: 0, sprint: false });
  const smoothedInput = useRef({ forward: 0, turn: 0 });

  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [spellActive, setSpellActive] = useState(false);
  const [activeSpellColor, setActiveSpellColor] = useState("#ef4444");
  const [pathGesture, setPathGesture] = useState<SpellGesture>("none");
  const [nearbyNPC, setNearbyNPC] = useState<string | null>(null);
  const [inDuel, setInDuel] = useState(false);
  const [duelOpponent, setDuelOpponent] = useState<{ name: string; title: string; level: number } | null>(null);
  const playerSpellHistory = useRef<string[]>([]);
  const [enemyTaunt, setEnemyTaunt] = useState<string | null>(null);
  const castCooldownRef = useRef(false);

  const {
    isLoading,
    isTracking,
    error,
    hands,
    wandTrail,
    headPose,
    startTracking,
    stopTracking,
  } = useHandTracking(videoRef);

  const wandHand = hands.find((h) => h.handedness === "Right") || hands.find((h) => h.handedness === "Left");

  // ─── Head lean → movement input ────────────────────
  // Calibration: store initial head position as center reference
  const headCenterRef = useRef<{ x: number; y: number } | null>(null);
  const headCalibrationFrames = useRef(0);

  useEffect(() => {
    if (!headPose || !isTracking) {
      smoothedInput.current.forward = 0;
      smoothedInput.current.turn = 0;
      moveInput.current = { forward: 0, turn: 0, sprint: false };
      return;
    }

    // Auto-calibrate: average the first 30 frames as the "center" position
    if (!headCenterRef.current) {
      headCenterRef.current = { x: headPose.x, y: headPose.y };
      headCalibrationFrames.current = 1;
    } else if (headCalibrationFrames.current < 30) {
      headCalibrationFrames.current++;
      const n = headCalibrationFrames.current;
      headCenterRef.current = {
        x: headCenterRef.current.x + (headPose.x - headCenterRef.current.x) / n,
        y: headCenterRef.current.y + (headPose.y - headCenterRef.current.y) / n,
      };
      moveInput.current = { forward: 0, turn: 0, sprint: false };
      return;
    }

    const cx = headCenterRef.current.x;
    const cy = headCenterRef.current.y;

    // Offset from center
    const dx = headPose.x - cx; // positive = leaning right (in camera coords)
    const dy = headPose.y - cy; // positive = leaning down/forward

    // Deadzones
    const FORWARD_DEAD = 0.03;
    const TURN_DEAD = 0.04;

    // Y axis: leaning back (head goes up = lower y) = walk forward, leaning forward = backward
    let rawForward = 0;
    if (dy > FORWARD_DEAD) rawForward = Math.min(1, (dy - FORWARD_DEAD) * 8);
    else if (dy < -FORWARD_DEAD) rawForward = Math.max(-1, -(-dy - FORWARD_DEAD) * 8);

    // X axis: invert turn direction
    let rawTurn = 0;
    if (dx > TURN_DEAD) rawTurn = Math.max(-1, -(dx - TURN_DEAD) * 6);
    else if (dx < -TURN_DEAD) rawTurn = Math.min(1, (-dx - TURN_DEAD) * 6);

    // Quadratic for finer control
    rawForward = Math.sign(rawForward) * rawForward * rawForward;
    rawTurn = Math.sign(rawTurn) * rawTurn * rawTurn;

    // Smooth
    if (rawForward === 0) {
      smoothedInput.current.forward *= 0.7; // decay
    } else {
      smoothedInput.current.forward += (rawForward - smoothedInput.current.forward) * 0.2;
    }
    if (rawTurn === 0) {
      smoothedInput.current.turn *= 0.7;
    } else {
      smoothedInput.current.turn += (rawTurn - smoothedInput.current.turn) * 0.2;
    }

    if (Math.abs(smoothedInput.current.forward) < 0.02) smoothedInput.current.forward = 0;
    if (Math.abs(smoothedInput.current.turn) < 0.02) smoothedInput.current.turn = 0;

    moveInput.current = {
      forward: smoothedInput.current.forward,
      turn: smoothedInput.current.turn,
      sprint: false,
    };
  }, [headPose, isTracking]);

  // ─── Room transitions ─────────────────────────────
  const doorCooldown = useRef(false);
  const handleDoorEnter = useCallback(
    (doorIndex: number) => {
      if (doorCooldown.current) return;
      doorCooldown.current = true;

      const door = currentRoom.doors[doorIndex];
      const targetRoom = getRoomById(door.targetRoom);
      if (!targetRoom) return;

      // Teleport player
      const [sx, , sz] = door.spawnPosition;
      playerPos.current.set(
        targetRoom.center[0] + sx,
        1.6,
        targetRoom.center[2] + sz
      );
      playerRot.current = door.spawnRotation;
      setCurrentRoomId(door.targetRoom);

      toast({
        title: targetRoom.name,
        description: `You entered the ${targetRoom.name}`,
      });

      setTimeout(() => {
        doorCooldown.current = false;
      }, 1000);
    },
    [currentRoom]
  );

  // ─── NPC encounter check ──────────────────────────
  useEffect(() => {
    if (!isTracking || inDuel) return;
    const interval = setInterval(() => {
      let closest: string | null = null;
      for (const npc of currentRoom.npcs) {
        const nx = currentRoom.center[0] + npc.position[0];
        const nz = currentRoom.center[2] + npc.position[2];
        const dist = Math.sqrt(
          (playerPos.current.x - nx) ** 2 + (playerPos.current.z - nz) ** 2
        );
        if (dist < NPC_ENCOUNTER_DIST) {
          closest = npc.id;
        }
      }
      setNearbyNPC(closest);
    }, 200);
    return () => clearInterval(interval);
  }, [isTracking, currentRoom, inDuel]);

  // (Duel is now started via the UI button, not fist gesture)

  // ─── Spell casting (during duel) ──────────────────
  const castSpell = useCallback(
    (spellName: string) => {
      if (castCooldownRef.current || !inDuel) return;
      const spell = SPELLS.find((s) => s.name === spellName);
      if (!spell) return;

      setGameState((prev) => {
        if (prev.playerMana < spell.manaCost) {
          toast({ title: "Not enough mana!", variant: "destructive" });
          return prev;
        }
        const ns = { ...prev };
        ns.playerMana -= spell.manaCost;
        ns.lastSpellCast = spell.name;

        if (spell.isDefensive) {
          ns.shieldActive = true;
          setTimeout(() => setGameState((s) => ({ ...s, shieldActive: false })), 3000);
        } else {
          ns.enemyHealth = Math.max(0, prev.enemyHealth - spell.damage);
          ns.combo += 1;
        }

        playerSpellHistory.current.push(spell.name);
        setActiveSpellColor(spell.color);
        setSpellActive(true);
        setTimeout(() => setSpellActive(false), 800);

        // AI opponent response
        setTimeout(() => triggerEnemyTurn(ns), 1500);
        return ns;
      });

      castCooldownRef.current = true;
      setTimeout(() => {
        castCooldownRef.current = false;
        setGameState((s) => ({ ...s, lastSpellCast: null }));
      }, 2000);
    },
    [inDuel]
  );

  // AI opponent
  const triggerEnemyTurn = useCallback(async (gs: GameState) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-opponent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          playerSpells: playerSpellHistory.current.slice(-3),
          playerHealth: gs.playerHealth,
          enemyHealth: gs.enemyHealth,
          enemyMana: gs.enemyMana,
        }),
      });
      const data = await res.json();
      if (data.error) return;

      const enemySpell = SPELLS.find((s) => s.name === data.spell);
      setEnemyTaunt(data.taunt);
      setTimeout(() => setEnemyTaunt(null), 3000);

      if (enemySpell) {
        setTimeout(() => {
          setGameState((prev) => {
            const u = { ...prev };
            u.enemyMana = Math.max(0, prev.enemyMana - enemySpell.manaCost);
            if (!enemySpell.isDefensive && !prev.shieldActive) {
              u.playerHealth = Math.max(0, prev.playerHealth - enemySpell.damage);
            } else if (!enemySpell.isDefensive && prev.shieldActive) {
              toast({ title: "Protego!", description: `Blocked ${enemySpell.name}!` });
            }
            return u;
          });
        }, 1000);
      }
    } catch {}
  }, []);

  // Duel gestures
  const lastDuelGesture = useRef("");
  useEffect(() => {
    if (!wandHand || !inDuel) return;
    if (wandHand.gesture !== lastDuelGesture.current) {
      lastDuelGesture.current = wandHand.gesture;
      if (wandHand.gesture === "fist") castSpell("Expelliarmus");
      else if (wandHand.gesture === "open_palm") castSpell("Protego");
      else if (wandHand.gesture === "pointing") castSpell("Stupefy");
      else if (wandHand.gesture === "peace") castSpell("Lumos");
    }
  }, [wandHand, inDuel, castSpell]);

  // Path gestures
  useEffect(() => {
    if (wandTrail.length > 5) setPathGesture(recognizeGesture(wandTrail));
  }, [wandTrail]);

  const lastPathRef = useRef<SpellGesture>("none");
  useEffect(() => {
    if (pathGesture !== "none" && pathGesture !== lastPathRef.current && inDuel) {
      const spellName = gestureToSpell(pathGesture);
      if (spellName) castSpell(spellName);
    }
    lastPathRef.current = pathGesture;
  }, [pathGesture, inDuel, castSpell]);

  // Mana regen
  useEffect(() => {
    if (!inDuel) return;
    const interval = setInterval(() => {
      setGameState((s) => ({
        ...s,
        playerMana: Math.min(100, s.playerMana + 2),
        enemyMana: Math.min(100, s.enemyMana + 1),
      }));
    }, 500);
    return () => clearInterval(interval);
  }, [inDuel]);

  // Game over
  useEffect(() => {
    if (!inDuel) return;
    if (gameState.playerHealth <= 0) {
      toast({ title: "Defeat!", variant: "destructive" });
      setTimeout(() => { setInDuel(false); setDuelOpponent(null); }, 3000);
    }
    if (gameState.enemyHealth <= 0) {
      toast({ title: "Victory!", description: `You defeated ${duelOpponent?.name}!` });
      setTimeout(() => { setInDuel(false); setDuelOpponent(null); }, 3000);
    }
  }, [gameState.playerHealth, gameState.enemyHealth, inDuel, duelOpponent]);

  const wandTip = wandHand?.wandTip || null;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 3D World */}
      {isTracking && (
        <HogwartsWorld
          currentRoom={currentRoom}
          moveInput={moveInput}
          playerPos={playerPos}
          playerRot={playerRot}
          onDoorEnter={handleDoorEnter}
          wandTip={wandTip}
          spellActive={spellActive}
          spellColor={activeSpellColor}
          shieldActive={gameState.shieldActive}
          houseColor={houseColor}
        />
      )}

      {/* HUD - only during duel */}
      {isTracking && inDuel && duelOpponent && (
        <SpellHUD
          gameState={gameState}
          detectedGesture={wandHand?.gesture || ""}
          opponentName={duelOpponent.name}
        />
      )}

      {/* Room name */}
      {isTracking && !inDuel && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-parchment rounded-lg px-6 py-2">
          <span className="font-display text-sm tracking-widest text-primary uppercase">
            {currentRoom.name}
          </span>
        </div>
      )}

      {/* NPC encounter - duel button */}
      {nearbyNPC && isTracking && !inDuel && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-parchment rounded-lg px-6 py-3 text-center">
          {(() => {
            const npc = currentRoom.npcs.find((n) => n.id === nearbyNPC);
            if (!npc) return null;
            return (
              <>
                <p className="font-display text-sm text-primary tracking-wider uppercase">
                  {npc.hostile ? "⚔️" : "🤝"} {npc.name}
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  {npc.title} • Level {npc.level}
                </p>
                <Button
                  variant="hero"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setInDuel(true);
                    setDuelOpponent({ name: npc.name, title: npc.title, level: npc.level });
                    setGameState(INITIAL_GAME_STATE);
                    toast({ title: `Duel with ${npc.name}!`, description: npc.title });
                  }}
                >
                  ⚔️ Duel
                </Button>
              </>
            );
          })()}
        </div>
      )}

      {/* Enemy taunt */}
      {enemyTaunt && inDuel && (
        <div className="absolute top-32 right-4 z-30 max-w-xs bg-parchment rounded-lg px-4 py-3">
          <p className="font-display text-xs text-accent tracking-wider uppercase mb-1">{duelOpponent?.name}</p>
          <p className="font-body text-sm text-foreground/90 italic">"{enemyTaunt}"</p>
        </div>
      )}

      {/* Movement guide */}
      {isTracking && !inDuel && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-parchment rounded-lg px-4 py-3">
          <div className="font-body text-xs text-muted-foreground text-center space-y-1">
            <p className="font-display text-[10px] tracking-wider text-primary uppercase mb-2">
              Head Movement Controls
            </p>
            <p>🙂‍↕️ <strong>Lean Forward</strong> → Walk Forward</p>
            <p>🙂‍↕️ <strong>Lean Back</strong> → Walk Backward</p>
            <p>🙂‍↔️ <strong>Lean Left</strong> → Turn Left</p>
            <p>🙂‍↔️ <strong>Lean Right</strong> → Turn Right</p>
          </div>
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
          <WandCanvas hands={hands} wandTrail={wandTrail} width={WEBCAM_W} height={WEBCAM_H} headPose={headPose} />
        )}
      </div>

      {/* Pre-game overlay */}
      {!isTracking && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/90">
          <div className="text-center space-y-6 max-w-lg px-6">
            <h2 className="font-display text-4xl text-primary text-glow-gold">
              Explore Hogwarts
            </h2>
            <p className="font-body text-sm text-muted-foreground italic">
              "I solemnly swear that I am up to no good"
            </p>
            <p className="font-body text-lg text-foreground/80">
              Navigate Hogwarts castle in first person. Lean your head to
              move and use your hand to cast spells. Walk through glowing
              doorways to explore different rooms.
            </p>

            {error && (
              <div className="bg-accent/20 border border-accent/40 rounded-lg p-3 text-accent text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Button variant="hero" size="lg" className="w-full h-14" onClick={startTracking} disabled={isLoading}>
                {isLoading ? "Loading..." : "🏰 Enter Hogwarts"}
              </Button>
              <Button variant="spell" size="lg" className="w-full" onClick={() => navigate("/")}>
                ← Back to Hall
              </Button>
            </div>

            <div className="bg-parchment rounded-lg p-4 text-left">
              <h3 className="font-display text-sm text-primary tracking-wider uppercase mb-3">
                Movement (Head Lean)
              </h3>
              <div className="space-y-1 font-body text-sm text-foreground/80">
                <div>⬆️ <strong>Lean Forward</strong> → Walk Forward</div>
                <div>⬇️ <strong>Lean Back</strong> → Walk Backward</div>
                <div>⬅️ <strong>Lean Left</strong> → Turn Left</div>
                <div>➡️ <strong>Lean Right</strong> → Turn Right</div>
              </div>
              <h3 className="font-display text-sm text-primary tracking-wider uppercase mt-4 mb-3">
                Spells (Right Hand)
              </h3>
              <div className="space-y-1 font-body text-sm text-foreground/80">
                <div>✊ Fist → Expelliarmus</div>
                <div>🖐️ Open Palm → Protego</div>
                <div>☝️ Point → Stupefy</div>
                <div>✌️ Peace → Lumos</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exit */}
      {isTracking && (
        <div className="absolute top-4 left-4 z-30">
          <Button variant="spell" size="sm" onClick={() => { stopTracking(); navigate("/"); }}>
            ✕ Exit
          </Button>
        </div>
      )}
    </div>
  );
}
