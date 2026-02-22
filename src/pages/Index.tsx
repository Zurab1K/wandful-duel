import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FloatingParticles from "@/components/game/FloatingParticles";
import heroDuel from "@/assets/hero-duel.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroDuel}
          alt="Wizard duel arena"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
      </div>

      <FloatingParticles count={30} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-2xl">
        {/* Logo / Title */}
        <div className="space-y-2">
          <p className="font-display text-sm tracking-[0.4em] text-primary/70 uppercase">
            Welcome to
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-glow-gold text-primary leading-tight">
            The Hackwarts
            <br />
            <span className="text-foreground">Duelist</span>
          </h1>
        </div>

        {/* Tagline */}
        <p className="font-body text-xl md:text-2xl text-foreground/70 italic max-w-lg">
          "Grab your wand. Face the camera. Cast your spells."
        </p>

        {/* Subtitle */}
        <p className="font-body text-base text-muted-foreground max-w-md">
          A zero-hardware wizard dueling simulator powered by Computer Vision.
          Your webcam is your arena. A stick is your wand.
        </p>

        {/* CTA */}
        <Button
          variant="hero"
          size="lg"
          className="mt-4 h-14 px-12 text-base"
          onClick={() => navigate("/duel")}
        >
          Enter the Arena
        </Button>

        {/* Instructions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {[
            { icon: "🎥", title: "Webcam", desc: "Allow camera access" },
            { icon: "🪄", title: "Wand", desc: "Hold any stick" },
            { icon: "✋", title: "Gestures", desc: "Cast with your hands" },
          ].map((step) => (
            <div key={step.title} className="bg-parchment rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">{step.icon}</div>
              <div className="font-display text-sm text-primary tracking-wider uppercase">
                {step.title}
              </div>
              <div className="font-body text-sm text-muted-foreground mt-1">
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  );
};

export default Index;
