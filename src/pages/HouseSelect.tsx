import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import FloatingParticles from "@/components/game/FloatingParticles";

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

  const handleConfirm = () => {
    if (!selected) return;
    const house = HOUSES.find((h) => h.name === selected);
    if (house) {
      navigate(`/explore?house=${house.name}&color=${encodeURIComponent(house.color)}`);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <FloatingParticles count={20} />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-3xl w-full">
        <div className="space-y-2">
          <p className="font-display text-sm tracking-[0.4em] text-primary/70 uppercase">
            The Sorting Ceremony
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-glow-gold text-primary leading-tight">
            Choose Your House
          </h1>
          <p className="font-body text-base text-muted-foreground mt-2 italic">
            "It is our choices that show what we truly are"
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
          {HOUSES.map((house) => (
            <button
              key={house.name}
              onClick={() => setSelected(house.name)}
              className={`
                relative rounded-xl p-5 text-left transition-all duration-300 border-2
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
              <div className="text-3xl mb-2">{house.emoji}</div>
              <h3
                className="font-display text-lg tracking-wider uppercase"
                style={{ color: house.name === "Hufflepuff" ? house.accent : house.color === "#0e1a40" ? "#5b7fc7" : house.color === "#1a472a" ? "#4caf50" : "#c75050" }}
              >
                {house.name}
              </h3>
              <p className="font-body text-xs text-muted-foreground mt-1">{house.trait}</p>
              <p className="font-body text-[11px] text-foreground/50 mt-2 italic leading-tight">
                {house.description}
              </p>
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
  );
}
