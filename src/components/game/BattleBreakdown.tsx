import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { BattleStats } from "@/lib/spells";

interface BattleBreakdownProps {
  stats: BattleStats | null;
  onClose: () => void;
}

export default function BattleBreakdown({ stats, onClose }: BattleBreakdownProps) {
  if (!stats) return null;

  const isVictory = stats.result === "victory";
  const minutes = Math.floor(stats.duration / 60);
  const seconds = Math.floor(stats.duration % 60);
  const sortedSpells = Object.entries(stats.spellBreakdown).sort((a, b) => b[1] - a[1]);

  return (
    <Dialog open={!!stats} onOpenChange={() => onClose()}>
      <DialogContent className="bg-parchment border-primary/30 max-w-md">
        <DialogHeader>
          <DialogTitle
            className={`font-display text-3xl text-center tracking-wider uppercase ${
              isVictory ? "text-spell-green" : "text-accent"
            }`}
          >
            {isVictory ? "⚡ Victory!" : "💀 Defeat"}
          </DialogTitle>
          <DialogDescription className="text-center font-body text-muted-foreground">
            vs {stats.opponentName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Health remaining */}
          <div className="space-y-1">
            <div className="flex justify-between font-body text-xs text-muted-foreground">
              <span>Your Health</span>
              <span>{isVictory ? `${Math.max(0, 100 - stats.damageTaken)}%` : "0%"}</span>
            </div>
            <Progress
              value={isVictory ? Math.max(0, 100 - stats.damageTaken) : 0}
              className="h-2"
            />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Spells Cast" value={stats.spellsCast} icon="🪄" />
            <StatCard label="Damage Dealt" value={stats.damageDealt} icon="💥" />
            <StatCard label="Damage Taken" value={stats.damageTaken} icon="🩸" />
            <StatCard label="Spells Blocked" value={stats.spellsBlocked} icon="🛡️" />
            <StatCard label="Highest Combo" value={`${stats.highestCombo}x`} icon="🔥" />
            <StatCard label="Duration" value={`${minutes}:${seconds.toString().padStart(2, "0")}`} icon="⏱️" />
          </div>

          {/* Spell breakdown */}
          {sortedSpells.length > 0 && (
            <div className="bg-background/50 rounded-lg p-3">
              <p className="font-display text-xs text-primary tracking-wider uppercase mb-2">
                Spell Breakdown
              </p>
              <div className="space-y-1.5">
                {sortedSpells.map(([spell, count]) => (
                  <div key={spell} className="flex items-center justify-between font-body text-sm">
                    <span className="text-foreground/80">{spell}</span>
                    <span className="text-primary font-semibold">{count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button variant="hero" className="w-full" onClick={onClose}>
            Continue Exploring
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-background/50 rounded-lg p-2.5 text-center">
      <p className="text-lg">{icon}</p>
      <p className="font-display text-lg text-primary">{value}</p>
      <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}
