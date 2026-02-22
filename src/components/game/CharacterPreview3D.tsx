import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface CharacterPreviewProps {
  robeColor: string;
  accentColor: string;
}

// Skin material helper
const SKIN = "#c9a07a";
const SKIN_DARK = "#b08960";
const HAIR = "#3a2518";

function HumanHead() {
  return (
    <group position={[0, 1.58, 0]}>
      {/* Skull - slightly elongated sphere */}
      <mesh>
        <sphereGeometry args={[0.115, 32, 32]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>

      {/* Jaw / chin - lower face */}
      <mesh position={[0, -0.07, 0.02]}>
        <sphereGeometry args={[0.095, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>
      {/* Chin point */}
      <mesh position={[0, -0.12, 0.04]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>

      {/* Nose bridge */}
      <mesh position={[0, -0.01, 0.11]} rotation={[0.3, 0, 0]}>
        <capsuleGeometry args={[0.012, 0.05, 8, 12]} />
        <meshStandardMaterial color={SKIN_DARK} roughness={0.5} />
      </mesh>
      {/* Nose tip */}
      <mesh position={[0, -0.04, 0.12]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial color={SKIN_DARK} roughness={0.5} />
      </mesh>
      {/* Nostrils */}
      <mesh position={[-0.012, -0.05, 0.11]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial color="#a07050" roughness={0.6} />
      </mesh>
      <mesh position={[0.012, -0.05, 0.11]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial color="#a07050" roughness={0.6} />
      </mesh>

      {/* Eye sockets (slight indentation via darker color) */}
      <mesh position={[-0.04, 0.01, 0.095]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#b8906a" roughness={0.5} />
      </mesh>
      <mesh position={[0.04, 0.01, 0.095]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#b8906a" roughness={0.5} />
      </mesh>

      {/* Eyeballs - white */}
      <mesh position={[-0.04, 0.015, 0.105]}>
        <sphereGeometry args={[0.016, 16, 16]} />
        <meshStandardMaterial color="#f0ece8" roughness={0.3} />
      </mesh>
      <mesh position={[0.04, 0.015, 0.105]}>
        <sphereGeometry args={[0.016, 16, 16]} />
        <meshStandardMaterial color="#f0ece8" roughness={0.3} />
      </mesh>

      {/* Iris */}
      <mesh position={[-0.04, 0.015, 0.12]}>
        <sphereGeometry args={[0.009, 12, 12]} />
        <meshStandardMaterial color="#5a7a4a" roughness={0.4} />
      </mesh>
      <mesh position={[0.04, 0.015, 0.12]}>
        <sphereGeometry args={[0.009, 12, 12]} />
        <meshStandardMaterial color="#5a7a4a" roughness={0.4} />
      </mesh>

      {/* Pupils */}
      <mesh position={[-0.04, 0.015, 0.125]}>
        <sphereGeometry args={[0.005, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
      </mesh>
      <mesh position={[0.04, 0.015, 0.125]}>
        <sphereGeometry args={[0.005, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
      </mesh>

      {/* Eyebrows */}
      <mesh position={[-0.04, 0.045, 0.1]} rotation={[0.2, 0, 0.1]}>
        <boxGeometry args={[0.04, 0.006, 0.015]} />
        <meshStandardMaterial color={HAIR} roughness={0.9} />
      </mesh>
      <mesh position={[0.04, 0.045, 0.1]} rotation={[0.2, 0, -0.1]}>
        <boxGeometry args={[0.04, 0.006, 0.015]} />
        <meshStandardMaterial color={HAIR} roughness={0.9} />
      </mesh>

      {/* Upper lip */}
      <mesh position={[0, -0.065, 0.1]}>
        <boxGeometry args={[0.035, 0.008, 0.02]} />
        <meshStandardMaterial color="#b87060" roughness={0.5} />
      </mesh>
      {/* Lower lip */}
      <mesh position={[0, -0.078, 0.098]}>
        <boxGeometry args={[0.03, 0.01, 0.018]} />
        <meshStandardMaterial color="#c07868" roughness={0.45} />
      </mesh>

      {/* Ears */}
      <mesh position={[-0.115, 0.0, 0.0]} rotation={[0, -0.3, 0]}>
        <capsuleGeometry args={[0.015, 0.035, 8, 12]} />
        <meshStandardMaterial color={SKIN_DARK} roughness={0.6} />
      </mesh>
      <mesh position={[0.115, 0.0, 0.0]} rotation={[0, 0.3, 0]}>
        <capsuleGeometry args={[0.015, 0.035, 8, 12]} />
        <meshStandardMaterial color={SKIN_DARK} roughness={0.6} />
      </mesh>

      {/* Cheekbones */}
      <mesh position={[-0.07, -0.02, 0.07]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>
      <mesh position={[0.07, -0.02, 0.07]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>

      {/* === HAIR === */}
      {/* Hair top volume */}
      <mesh position={[0, 0.06, -0.01]}>
        <sphereGeometry args={[0.125, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={HAIR} roughness={0.95} />
      </mesh>
      {/* Hair left side */}
      <mesh position={[-0.1, 0.02, -0.01]}>
        <capsuleGeometry args={[0.04, 0.12, 8, 12]} />
        <meshStandardMaterial color={HAIR} roughness={0.95} />
      </mesh>
      {/* Hair right side */}
      <mesh position={[0.1, 0.02, -0.01]}>
        <capsuleGeometry args={[0.04, 0.12, 8, 12]} />
        <meshStandardMaterial color={HAIR} roughness={0.95} />
      </mesh>
      {/* Hair back - flowing down */}
      <mesh position={[0, -0.02, -0.08]}>
        <boxGeometry args={[0.22, 0.2, 0.06]} />
        <meshStandardMaterial color={HAIR} roughness={0.95} />
      </mesh>
      {/* Hair back lower */}
      <mesh position={[0, -0.1, -0.07]}>
        <boxGeometry args={[0.2, 0.1, 0.05]} />
        <meshStandardMaterial color={HAIR} roughness={0.95} />
      </mesh>
      {/* Fringe/bangs */}
      <mesh position={[0, 0.06, 0.09]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[0.18, 0.04, 0.05]} />
        <meshStandardMaterial color={HAIR} roughness={0.95} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, -0.17, 0]}>
        <cylinderGeometry args={[0.045, 0.055, 0.1, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>
    </group>
  );
}

function WizardBody({ robeColor, accentColor }: CharacterPreviewProps) {
  return (
    <group>
      {/* === UPPER BODY === */}
      {/* Chest/torso - tapered shape */}
      <mesh position={[0, 1.18, 0]}>
        <cylinderGeometry args={[0.13, 0.16, 0.35, 16]} />
        <meshStandardMaterial color="#3a3530" roughness={0.8} />
      </mesh>
      {/* Shoulders */}
      <mesh position={[0, 1.32, 0]}>
        <cylinderGeometry args={[0.18, 0.13, 0.08, 16]} />
        <meshStandardMaterial color="#3a3530" roughness={0.8} />
      </mesh>

      {/* Waist/belly */}
      <mesh position={[0, 0.98, 0]}>
        <cylinderGeometry args={[0.14, 0.13, 0.15, 16]} />
        <meshStandardMaterial color="#3a3530" roughness={0.8} />
      </mesh>

      {/* Vest front */}
      <mesh position={[0, 1.15, 0.1]}>
        <boxGeometry args={[0.18, 0.3, 0.06]} />
        <meshStandardMaterial color="#4a4035" roughness={0.85} />
      </mesh>
      {/* Vest buttons */}
      {[0, 0.06, 0.12, -0.06].map((y, i) => (
        <mesh key={i} position={[0, 1.12 + y, 0.135]}>
          <sphereGeometry args={[0.006, 8, 8]} />
          <meshStandardMaterial color="#8a7a60" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}

      {/* === WHITE SHIRT COLLAR peeking out === */}
      <mesh position={[0, 1.36, 0.06]}>
        <boxGeometry args={[0.12, 0.04, 0.08]} />
        <meshStandardMaterial color="#e8e0d4" roughness={0.7} />
      </mesh>

      {/* === BELT === */}
      <mesh position={[0, 0.92, 0]}>
        <cylinderGeometry args={[0.155, 0.155, 0.04, 16]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.65} metalness={0.15} />
      </mesh>
      {/* Belt buckle */}
      <mesh position={[0, 0.92, 0.155]}>
        <boxGeometry args={[0.04, 0.04, 0.015]} />
        <meshStandardMaterial color="#d4a625" roughness={0.25} metalness={0.85} />
      </mesh>
      {/* Belt pouch */}
      <mesh position={[0.12, 0.92, 0.1]} rotation={[0, -0.4, 0]}>
        <boxGeometry args={[0.04, 0.06, 0.03]} />
        <meshStandardMaterial color="#6a4a2a" roughness={0.8} />
      </mesh>

      {/* === LEGS === */}
      {/* Left thigh */}
      <mesh position={[-0.07, 0.72, 0]}>
        <capsuleGeometry args={[0.055, 0.2, 8, 16]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.9} />
      </mesh>
      {/* Right thigh */}
      <mesh position={[0.07, 0.72, 0]}>
        <capsuleGeometry args={[0.055, 0.2, 8, 16]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.9} />
      </mesh>
      {/* Left shin */}
      <mesh position={[-0.07, 0.45, 0]}>
        <capsuleGeometry args={[0.045, 0.25, 8, 16]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.9} />
      </mesh>
      {/* Right shin */}
      <mesh position={[0.07, 0.45, 0]}>
        <capsuleGeometry args={[0.045, 0.25, 8, 16]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.9} />
      </mesh>

      {/* === BOOTS === */}
      <mesh position={[-0.07, 0.24, 0]}>
        <capsuleGeometry args={[0.05, 0.12, 8, 16]} />
        <meshStandardMaterial color="#2a1a0e" roughness={0.8} />
      </mesh>
      <mesh position={[0.07, 0.24, 0]}>
        <capsuleGeometry args={[0.05, 0.12, 8, 16]} />
        <meshStandardMaterial color="#2a1a0e" roughness={0.8} />
      </mesh>
      {/* Boot soles */}
      <mesh position={[-0.07, 0.17, 0.02]}>
        <boxGeometry args={[0.1, 0.03, 0.14]} />
        <meshStandardMaterial color="#1a0e06" roughness={0.95} />
      </mesh>
      <mesh position={[0.07, 0.17, 0.02]}>
        <boxGeometry args={[0.1, 0.03, 0.14]} />
        <meshStandardMaterial color="#1a0e06" roughness={0.95} />
      </mesh>

      {/* === ARMS === */}
      {/* Left upper arm */}
      <mesh position={[-0.22, 1.22, 0]} rotation={[0, 0, 0.12]}>
        <capsuleGeometry args={[0.04, 0.2, 8, 16]} />
        <meshStandardMaterial color="#3a3530" roughness={0.8} />
      </mesh>
      {/* Left forearm */}
      <mesh position={[-0.26, 1.0, 0.02]} rotation={[0.15, 0, 0.08]}>
        <capsuleGeometry args={[0.035, 0.18, 8, 16]} />
        <meshStandardMaterial color="#3a3530" roughness={0.8} />
      </mesh>
      {/* Right upper arm */}
      <mesh position={[0.22, 1.22, 0]} rotation={[0, 0, -0.12]}>
        <capsuleGeometry args={[0.04, 0.2, 8, 16]} />
        <meshStandardMaterial color="#3a3530" roughness={0.8} />
      </mesh>
      {/* Right forearm - angled to hold wand */}
      <mesh position={[0.26, 1.0, 0.05]} rotation={[0.4, 0, -0.15]}>
        <capsuleGeometry args={[0.035, 0.18, 8, 16]} />
        <meshStandardMaterial color="#3a3530" roughness={0.8} />
      </mesh>

      {/* === HANDS === */}
      {/* Left hand */}
      <mesh position={[-0.28, 0.86, 0.03]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>
      {/* Left fingers */}
      <mesh position={[-0.28, 0.83, 0.04]}>
        <boxGeometry args={[0.025, 0.04, 0.02]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>
      {/* Right hand */}
      <mesh position={[0.29, 0.85, 0.1]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>

      {/* === WAND === */}
      <mesh position={[0.3, 0.88, 0.14]} rotation={[0.8, 0.1, -0.1]}>
        <cylinderGeometry args={[0.008, 0.014, 0.35, 8]} />
        <meshStandardMaterial color="#4a3728" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Wand handle detail */}
      <mesh position={[0.295, 0.84, 0.1]} rotation={[0.8, 0.1, -0.1]}>
        <cylinderGeometry args={[0.014, 0.016, 0.06, 8]} />
        <meshStandardMaterial color="#3a2718" roughness={0.8} />
      </mesh>
      {/* Wand tip glow */}
      <mesh position={[0.32, 1.06, 0.3]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[0.32, 1.06, 0.3]} color="#eab308" intensity={0.4} distance={0.8} />
    </group>
  );
}

function WizardRobes({ robeColor, accentColor }: CharacterPreviewProps) {
  return (
    <group>
      {/* === MAIN ROBE === */}
      {/* Robe body - flows from shoulders to ankles */}
      <mesh position={[0, 0.85, -0.01]}>
        <cylinderGeometry args={[0.19, 0.24, 1.1, 16, 1, true]} />
        <meshStandardMaterial color={robeColor} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Robe front-left panel */}
      <mesh position={[-0.08, 0.85, 0.1]} rotation={[0, 0.15, 0]}>
        <boxGeometry args={[0.16, 1.1, 0.025]} />
        <meshStandardMaterial color={robeColor} roughness={0.85} />
      </mesh>
      {/* Robe front-right panel */}
      <mesh position={[0.08, 0.85, 0.1]} rotation={[0, -0.15, 0]}>
        <boxGeometry args={[0.16, 1.1, 0.025]} />
        <meshStandardMaterial color={robeColor} roughness={0.85} />
      </mesh>

      {/* Front opening - V shape showing vest */}
      <mesh position={[0, 1.2, 0.12]} rotation={[0.05, 0, 0]}>
        <boxGeometry args={[0.06, 0.25, 0.02]} />
        <meshStandardMaterial color="#3a3530" roughness={0.8} />
      </mesh>

      {/* === CAPE / CLOAK === */}
      {/* Cape back panel - wide and flowing */}
      <mesh position={[0, 0.95, -0.13]} rotation={[0.05, 0, 0]}>
        <boxGeometry args={[0.42, 1.05, 0.025]} />
        <meshStandardMaterial color={robeColor} roughness={0.85} />
      </mesh>
      {/* Cape lower back - slight flare */}
      <mesh position={[0, 0.38, -0.15]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[0.46, 0.15, 0.02]} />
        <meshStandardMaterial color={robeColor} roughness={0.85} />
      </mesh>

      {/* === SHOULDER CAPE / MANTLE === */}
      {/* Left shoulder */}
      <mesh position={[-0.16, 1.32, 0]} rotation={[0, 0, 0.25]}>
        <boxGeometry args={[0.18, 0.22, 0.24]} />
        <meshStandardMaterial color={robeColor} roughness={0.85} />
      </mesh>
      {/* Right shoulder */}
      <mesh position={[0.16, 1.32, 0]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[0.18, 0.22, 0.24]} />
        <meshStandardMaterial color={robeColor} roughness={0.85} />
      </mesh>
      {/* Shoulder cape front drape - left */}
      <mesh position={[-0.14, 1.15, 0.08]} rotation={[0, 0.1, 0.15]}>
        <boxGeometry args={[0.14, 0.3, 0.025]} />
        <meshStandardMaterial color={robeColor} roughness={0.85} />
      </mesh>
      {/* Shoulder cape front drape - right */}
      <mesh position={[0.14, 1.15, 0.08]} rotation={[0, -0.1, -0.15]}>
        <boxGeometry args={[0.14, 0.3, 0.025]} />
        <meshStandardMaterial color={robeColor} roughness={0.85} />
      </mesh>

      {/* === COLLAR - high and dramatic === */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 0.1, 16]} />
        <meshStandardMaterial color={robeColor} roughness={0.8} />
      </mesh>
      {/* Collar inner lining */}
      <mesh position={[0, 1.42, 0.05]}>
        <cylinderGeometry args={[0.06, 0.09, 0.06, 16, 1, true, -Math.PI * 0.6, Math.PI * 1.2]} />
        <meshStandardMaterial color={accentColor} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* === ACCENT TRIMS === */}
      {/* Bottom hem trim */}
      <mesh position={[0, 0.31, -0.01]}>
        <cylinderGeometry args={[0.245, 0.25, 0.03, 16]} />
        <meshStandardMaterial color={accentColor} roughness={0.65} />
      </mesh>
      {/* Cape edge trim - left */}
      <mesh position={[-0.1, 0.85, 0.115]}>
        <boxGeometry args={[0.012, 1.05, 0.015]} />
        <meshStandardMaterial color={accentColor} roughness={0.6} />
      </mesh>
      {/* Cape edge trim - right */}
      <mesh position={[0.1, 0.85, 0.115]}>
        <boxGeometry args={[0.012, 1.05, 0.015]} />
        <meshStandardMaterial color={accentColor} roughness={0.6} />
      </mesh>
      {/* Horizontal trim across chest */}
      <mesh position={[0, 1.0, 0.12]}>
        <boxGeometry args={[0.2, 0.012, 0.015]} />
        <meshStandardMaterial color={accentColor} roughness={0.6} />
      </mesh>

      {/* === SCARF / TIE === */}
      <mesh position={[0, 1.35, 0.1]}>
        <boxGeometry args={[0.04, 0.06, 0.02]} />
        <meshStandardMaterial color={accentColor} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.28, 0.11]}>
        <boxGeometry args={[0.035, 0.1, 0.015]} />
        <meshStandardMaterial color={accentColor} roughness={0.7} />
      </mesh>

      {/* === HOUSE CREST === */}
      <mesh position={[-0.06, 1.22, 0.13]}>
        <boxGeometry args={[0.045, 0.055, 0.01]} />
        <meshStandardMaterial color={accentColor} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* === ROBE SLEEVE details === */}
      {/* Left sleeve trim */}
      <mesh position={[-0.27, 0.92, 0.02]}>
        <cylinderGeometry args={[0.042, 0.042, 0.02, 12]} />
        <meshStandardMaterial color={accentColor} roughness={0.65} />
      </mesh>
      {/* Right sleeve trim */}
      <mesh position={[0.27, 0.92, 0.04]}>
        <cylinderGeometry args={[0.042, 0.042, 0.02, 12]} />
        <meshStandardMaterial color={accentColor} roughness={0.65} />
      </mesh>
    </group>
  );
}

function WizardCharacter({ robeColor, accentColor }: CharacterPreviewProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 1.2) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.95, 0]}>
      <HumanHead />
      <WizardBody robeColor={robeColor} accentColor={accentColor} />
      <WizardRobes robeColor={robeColor} accentColor={accentColor} />
    </group>
  );
}

function CharacterScene({ robeColor, accentColor }: CharacterPreviewProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} castShadow />
      <directionalLight position={[-2, 3, -2]} intensity={0.3} color="#aaccff" />
      <pointLight position={[0, 1, 2.5]} intensity={0.5} color="#ffeedd" />
      <pointLight position={[0, -1, -1]} intensity={0.15} color="#aaaacc" />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, 0]} receiveShadow>
        <circleGeometry args={[0.7, 32]} />
        <meshStandardMaterial color="#2a2520" roughness={0.95} />
      </mesh>

      <WizardCharacter robeColor={robeColor} accentColor={accentColor} />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI * 0.3}
        maxPolarAngle={Math.PI * 0.6}
        target={[0, 0.1, 0]}
        autoRotate
        autoRotateSpeed={1.5}
      />
    </>
  );
}

export default function CharacterPreview3D({ robeColor, accentColor }: CharacterPreviewProps) {
  return (
    <div
      className="w-full h-[340px] md:h-[420px] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ background: "radial-gradient(ellipse at center, #1a1510 0%, #0a0808 100%)" }}
    >
      <Canvas
        camera={{ position: [0, 0.5, 3.5], fov: 35 }}
        gl={{ antialias: true, alpha: false }}
      >
        <CharacterScene robeColor={robeColor} accentColor={accentColor} />
      </Canvas>
      <p className="text-center font-body text-[10px] text-muted-foreground -mt-6 relative z-10 pointer-events-none">
        🖱️ Drag to spin
      </p>
    </div>
  );
}
