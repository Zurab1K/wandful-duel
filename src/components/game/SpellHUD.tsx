import { SPELLS, type GameState } from "@/lib/spells";

interface SpellHUDProps {
  gameState: GameState;
  detectedGesture: string;
}

function HealthBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="font-display text-xs tracking-widest uppercase text-foreground/80">
          {label}
        </span>
        <span className="font-display text-xs text-primary">
          {Math.round(value)}/{max}
        </span>
      </div>
      <div className="h-3 bg-secondary/60 rounded-sm border border-border overflow-hidden">
        <div
          className="h-full transition-all duration-300 rounded-sm"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}

export default function SpellHUD({ gameState, detectedGesture }: SpellHUDProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Player stats - bottom left */}
      <div className="absolute bottom-4 left-4 w-64 bg-parchment rounded-lg p-4 pointer-events-auto">
        <h3 className="font-display text-sm tracking-widest text-primary mb-3 uppercase">
          Duelist
        </h3>
        <div className="space-y-2">
          <HealthBar label="Health" value={gameState.playerHealth} max={100} color="hsl(0, 85%, 55%)" />
          <HealthBar label="Mana" value={gameState.playerMana} max={100} color="hsl(210, 90%, 60%)" />
        </div>
        {gameState.shieldActive && (
          <div className="mt-2 text-spell-blue text-xs font-display tracking-wider animate-pulse-glow">
            🛡️ PROTEGO ACTIVE
          </div>
        )}
      </div>

      {/* Enemy stats - top right */}
      <div className="absolute top-4 right-4 w-64 bg-parchment rounded-lg p-4">
        <h3 className="font-display text-sm tracking-widest text-accent mb-3 uppercase">
          Opponent
        </h3>
        <div className="space-y-2">
          <HealthBar label="Health" value={gameState.enemyHealth} max={100} color="hsl(0, 85%, 55%)" />
          <HealthBar label="Mana" value={gameState.enemyMana} max={100} color="hsl(210, 90%, 60%)" />
        </div>
      </div>

      {/* Spell bar - bottom center */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
        {SPELLS.map((spell) => (
          <div
            key={spell.name}
            className="flex flex-col items-center gap-1 bg-parchment rounded-lg px-3 py-2 min-w-[70px] group cursor-default"
            title={`${spell.name}: ${spell.gesture}`}
          >
            <span className="text-xl">{spell.icon}</span>
            <span className="font-display text-[10px] tracking-wider text-foreground/70 uppercase">
              {spell.name}
            </span>
            <span className="text-[9px] text-muted-foreground italic font-body">
              {spell.gesture}
            </span>
          </div>
        ))}
      </div>

      {/* Gesture indicator - top center */}
      {detectedGesture && detectedGesture !== "unknown" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-parchment rounded-lg px-6 py-2">
          <span className="font-display text-sm tracking-widest text-primary uppercase">
            Gesture: {detectedGesture.replace("_", " ")}
          </span>
        </div>
      )}

      {/* Last spell cast */}
      {gameState.lastSpellCast && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="font-display text-3xl text-primary text-glow-gold animate-pulse-glow tracking-[0.3em] uppercase">
            {gameState.lastSpellCast}!
          </div>
        </div>
      )}

      {/* Combo counter */}
      {gameState.combo > 1 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2">
          <span className="font-display text-xl text-gold-glow text-glow-gold">
            COMBO x{gameState.combo}
          </span>
        </div>
      )}
    </div>
  );
}
