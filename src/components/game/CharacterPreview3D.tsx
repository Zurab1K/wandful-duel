import { useRef, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface CharacterPreviewProps {
  robeColor: string;
  accentColor: string;
}

function WizardCharacter({ robeColor, accentColor }: CharacterPreviewProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Gentle idle animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 1.2) * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      {/* === LEGS === */}
      {/* Left leg */}
      <mesh position={[-0.12, -0.65, 0]}>
        <capsuleGeometry args={[0.06, 0.5, 8, 16]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.12, -0.65, 0]}>
        <capsuleGeometry args={[0.06, 0.5, 8, 16]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>

      {/* === BOOTS === */}
      <mesh position={[-0.12, -1.0, 0.03]}>
        <boxGeometry args={[0.14, 0.12, 0.2]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.85} />
      </mesh>
      <mesh position={[0.12, -1.0, 0.03]}>
        <boxGeometry args={[0.14, 0.12, 0.2]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.85} />
      </mesh>

      {/* === TORSO (vest/shirt) === */}
      <mesh position={[0, 0.05, 0]}>
        <capsuleGeometry args={[0.18, 0.45, 8, 16]} />
        <meshStandardMaterial color="#3a3530" roughness={0.8} />
      </mesh>

      {/* === VEST front detail === */}
      <mesh position={[0, 0.1, 0.14]}>
        <boxGeometry args={[0.22, 0.35, 0.05]} />
        <meshStandardMaterial color="#4a4035" roughness={0.85} />
      </mesh>

      {/* === BELT === */}
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.06, 16]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Belt buckle */}
      <mesh position={[0, -0.18, 0.19]}>
        <boxGeometry args={[0.06, 0.06, 0.02]} />
        <meshStandardMaterial color="#d4a625" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* === ROBE / CLOAK === */}
      {/* Main robe body - outer layer */}
      <mesh position={[0, -0.1, -0.02]}>
        <capsuleGeometry args={[0.24, 0.9, 8, 16]} />
        <meshStandardMaterial color={robeColor} roughness={0.85} transparent opacity={0.95} />
      </mesh>

      {/* Robe front flaps - left */}
      <mesh position={[-0.15, -0.15, 0.12]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.18, 0.85, 0.04]} />
        <meshStandardMaterial color={robeColor} roughness={0.85} />
      </mesh>
      {/* Robe front flaps - right */}
      <mesh position={[0.15, -0.15, 0.12]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.18, 0.85, 0.04]} />
        <meshStandardMaterial color={robeColor} roughness={0.85} />
      </mesh>

      {/* Robe accent trim - bottom hem */}
      <mesh position={[0, -0.6, -0.02]}>
        <cylinderGeometry args={[0.25, 0.27, 0.04, 16]} />
        <meshStandardMaterial color={accentColor} roughness={0.7} />
      </mesh>

      {/* === CAPE / CLOAK BACK === */}
      <mesh position={[0, 0.05, -0.16]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.46, 1.1, 0.04]} />
        <meshStandardMaterial color={robeColor} roughness={0.85} />
      </mesh>
      {/* Cape accent stripe */}
      <mesh position={[0, -0.15, -0.185]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.48, 0.03, 0.01]} />
        <meshStandardMaterial color={accentColor} roughness={0.6} />
      </mesh>

      {/* === SHOULDER CAPE === */}
      {/* Left shoulder drape */}
      <mesh position={[-0.22, 0.32, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.2, 0.35, 0.3]} />
        <meshStandardMaterial color={robeColor} roughness={0.85} />
      </mesh>
      {/* Right shoulder drape */}
      <mesh position={[0.22, 0.32, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.2, 0.35, 0.3]} />
        <meshStandardMaterial color={robeColor} roughness={0.85} />
      </mesh>

      {/* === COLLAR === */}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.14, 0.18, 0.12, 16]} />
        <meshStandardMaterial color={robeColor} roughness={0.8} />
      </mesh>
      {/* Collar accent */}
      <mesh position={[0, 0.46, 0.08]}>
        <boxGeometry args={[0.16, 0.06, 0.08]} />
        <meshStandardMaterial color={accentColor} roughness={0.7} />
      </mesh>

      {/* === SCARF / TIE === */}
      <mesh position={[0, 0.35, 0.15]}>
        <boxGeometry args={[0.06, 0.15, 0.03]} />
        <meshStandardMaterial color={accentColor} roughness={0.7} />
      </mesh>

      {/* === ARMS === */}
      {/* Left arm */}
      <mesh position={[-0.3, 0.05, 0]} rotation={[0, 0, 0.15]}>
        <capsuleGeometry args={[0.06, 0.5, 8, 16]} />
        <meshStandardMaterial color={robeColor} roughness={0.85} />
      </mesh>
      {/* Right arm */}
      <mesh position={[0.3, 0.05, 0]} rotation={[0, 0, -0.15]}>
        <capsuleGeometry args={[0.06, 0.5, 8, 16]} />
        <meshStandardMaterial color={robeColor} roughness={0.85} />
      </mesh>

      {/* === HANDS === */}
      <mesh position={[-0.34, -0.28, 0]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color="#d4a574" roughness={0.6} />
      </mesh>
      <mesh position={[0.34, -0.28, 0]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color="#d4a574" roughness={0.6} />
      </mesh>

      {/* === WAND (right hand) === */}
      <mesh position={[0.36, -0.2, 0.08]} rotation={[0.5, 0, -0.2]}>
        <cylinderGeometry args={[0.012, 0.018, 0.4, 8]} />
        <meshStandardMaterial color="#4a3728" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Wand tip glow */}
      <mesh position={[0.34, -0.01, 0.18]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={1.5} />
      </mesh>
      <pointLight position={[0.34, -0.01, 0.18]} color="#eab308" intensity={0.5} distance={1} />

      {/* === HEAD === */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#d4a574" roughness={0.6} />
      </mesh>

      {/* === HAIR === */}
      {/* Hair top */}
      <mesh position={[0, 0.7, -0.02]}>
        <sphereGeometry args={[0.17, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color="#4a3020" roughness={0.9} />
      </mesh>
      {/* Hair sides - left */}
      <mesh position={[-0.12, 0.6, -0.03]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.08, 0.22, 0.14]} />
        <meshStandardMaterial color="#4a3020" roughness={0.9} />
      </mesh>
      {/* Hair sides - right */}
      <mesh position={[0.12, 0.6, -0.03]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.08, 0.22, 0.14]} />
        <meshStandardMaterial color="#4a3020" roughness={0.9} />
      </mesh>
      {/* Hair back */}
      <mesh position={[0, 0.55, -0.12]}>
        <boxGeometry args={[0.26, 0.28, 0.08]} />
        <meshStandardMaterial color="#4a3020" roughness={0.9} />
      </mesh>

      {/* === FACE DETAILS === */}
      {/* Eyes */}
      <mesh position={[-0.05, 0.62, 0.14]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.5} />
      </mesh>
      <mesh position={[0.05, 0.62, 0.14]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.5} />
      </mesh>

      {/* === HOUSE CREST on chest === */}
      <mesh position={[-0.08, 0.2, 0.18]}>
        <boxGeometry args={[0.06, 0.07, 0.01]} />
        <meshStandardMaterial color={accentColor} roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  );
}

function CharacterScene({ robeColor, accentColor }: CharacterPreviewProps) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-2, 3, -1]} intensity={0.4} color="#aaccff" />
      <pointLight position={[0, -0.5, 2]} intensity={0.3} color="#ffeedd" />

      {/* Ground circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.06, 0]} receiveShadow>
        <circleGeometry args={[0.8, 32]} />
        <meshStandardMaterial color="#2a2520" roughness={0.95} />
      </mesh>

      <WizardCharacter robeColor={robeColor} accentColor={accentColor} />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI * 0.3}
        maxPolarAngle={Math.PI * 0.6}
        target={[0, 0, 0]}
        autoRotate
        autoRotateSpeed={1.5}
      />
    </>
  );
}

export default function CharacterPreview3D({ robeColor, accentColor }: CharacterPreviewProps) {
  return (
    <div className="w-full h-[340px] md:h-[400px] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ background: "radial-gradient(ellipse at center, #1a1510 0%, #0a0808 100%)" }}
    >
      <Canvas
        camera={{ position: [0, 0.3, 2.2], fov: 45 }}
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
