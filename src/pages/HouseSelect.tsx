import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import FloatingParticles from "@/components/game/FloatingParticles";
import CharacterPreview3D from "@/components/game/CharacterPreview3D";

const HOUSES = [
  {
    name: "Gryffindor",
    emoji: "🦁",
    color: "#740001",
    accent: "#d3a625",
    trait: "Courage & Bravery",
    description: "Where dwell the brave at heart",
  },
  {
    name: "Slytherin",
    emoji: "🐍",
    color: "#1a472a",
    accent: "#aaaaaa",
    trait: "Ambition & Cunning",
    description: "Those cunning folk use any means",
  },
  {
    name: "Ravenclaw",
    emoji: "🦅",
    color: "#0e1a40",
    accent: "#946b2d",
    trait: "Wisdom & Wit",
    description: "Where those of wit and learning will always find their kind",
  },
  {
    name: "Hufflepuff",
    emoji: "🦡",
    color: "#ecb939",
    accent: "#372e29",
    trait: "Loyalty & Dedication",
    description: "Those patient Hufflepuffs are true and unafraid of toil",
  },
];

export default function HouseSelect() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  const selectedHouse = HOUSES.find((h) => h.name === selected);
  const robeColor = selectedHouse?.color || "#3a3530";
  const accentColor = selectedHouse?.accent || "#8a7a6a";

  const handleConfirm = () => {
    if (!selectedHouse) return;
    navigate(`/explore?house=${selectedHouse.name}&color=${encodeURIComponent(selectedHouse.color)}`);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <FloatingParticles count={20} />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 px-6 w-full max-w-5xl">
        {/* Left: Character preview */}
        <div className="flex flex-col items-center gap-3 w-full lg:w-1/2">
          <CharacterPreview3D robeColor={robeColor} accentColor={accentColor} />
          {selected && (
            <p className="font-display text-sm tracking-widest text-primary uppercase animate-in fade-in">
              {selectedHouse?.emoji} {selected}
            </p>
          )}
          {!selected && (
            <p className="font-body text-xs text-muted-foreground italic">
              Select a house to see your robes
            </p>
          )}
        </div>

        {/* Right: Selection UI */}
        <div className="flex flex-col items-center gap-6 w-full lg:w-1/2">
          <div className="space-y-2 text-center">
            <p className="font-display text-sm tracking-[0.4em] text-primary/70 uppercase">
              The Sorting Ceremony
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-glow-gold text-primary leading-tight">
              Choose Your House
            </h1>
            <p className="font-body text-sm text-muted-foreground italic">
              "It is our choices that show what we truly are"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            {HOUSES.map((house) => (
              <button
                key={house.name}
                onClick={() => setSelected(house.name)}
                className={`
                  relative rounded-xl p-4 text-left transition-all duration-300 border-2
                  ${
                    selected === house.name
                      ? "scale-105 shadow-2xl ring-2 ring-primary/60"
                      : "hover:scale-[1.02] hover:shadow-lg"
                  }
                `}
                style={{
                  backgroundColor: house.color + "22",
                  borderColor: selected === house.name ? house.color : house.color + "44",
                }}
              >
                <div className="text-2xl mb-1">{house.emoji}</div>
                <h3
                  className="font-display text-sm tracking-wider uppercase"
                  style={{
                    color:
                      house.name === "Hufflepuff"
                        ? house.accent
                        : house.color === "#0e1a40"
                        ? "#5b7fc7"
                        : house.color === "#1a472a"
                        ? "#4caf50"
                        : "#c75050",
                  }}
                >
                  {house.name}
                </h3>
                <p className="font-body text-[11px] text-muted-foreground mt-1">{house.trait}</p>
                {selected === house.name && (
                  <div
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                    style={{ backgroundColor: house.color, color: "#fff" }}
                  >
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-3 w-full max-w-xs">
            <Button
              variant="hero"
              size="lg"
              className="w-full h-14"
              onClick={handleConfirm}
              disabled={!selected}
            >
              🏰 Enter Hogwarts
            </Button>
            <Button variant="spell" size="lg" className="w-full" onClick={() => navigate("/")}>
              ← Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
