import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Torch flame particle
function TorchFlame({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const t = clock.getElapsedTime();
      lightRef.current.intensity = 1.5 + Math.sin(t * 5) * 0.3 + Math.sin(t * 13) * 0.15;
    }
  });

  return (
    <group position={position}>
      <pointLight ref={lightRef} color="#ff8844" intensity={1.5} distance={12} decay={2} />
      <mesh>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ffaa33" />
      </mesh>
    </group>
  );
}

// Stone wall
function Wall({ position, rotation, size }: {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation || [0, 0, 0]} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#3a3228" roughness={0.95} metalness={0.05} />
    </mesh>
  );
}

// Stone floor
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
      <planeGeometry args={[16, 16]} />
      <meshStandardMaterial color="#2a261f" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

// Gothic arch
function Arch({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Left pillar */}
      <mesh position={[-1.2, 1, 0]}>
        <boxGeometry args={[0.4, 4, 0.4]} />
        <meshStandardMaterial color="#4a4038" roughness={0.9} />
      </mesh>
      {/* Right pillar */}
      <mesh position={[1.2, 1, 0]}>
        <boxGeometry args={[0.4, 4, 0.4]} />
        <meshStandardMaterial color="#4a4038" roughness={0.9} />
      </mesh>
      {/* Top */}
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[2.8, 0.4, 0.4]} />
        <meshStandardMaterial color="#4a4038" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Spell light that follows wand
function SpellLight({ wandPosition, spellColor, intensity }: {
  wandPosition: [number, number, number];
  spellColor: string;
  intensity: number;
}) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.set(...wandPosition);
    }
  });

  return (
    <pointLight
      ref={lightRef}
      color={spellColor}
      intensity={intensity}
      distance={15}
      decay={2}
    />
  );
}

// Spell projectile
function SpellProjectile({ active, startPos, color }: {
  active: boolean;
  startPos: [number, number, number];
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current || !active) {
      progressRef.current = 0;
      return;
    }
    progressRef.current += delta * 3;
    const t = Math.min(progressRef.current, 1);
    meshRef.current.position.set(
      startPos[0] + (0 - startPos[0]) * t,
      startPos[1] + (1 - startPos[1]) * t,
      startPos[2] + (-6 - startPos[2]) * t
    );
    meshRef.current.scale.setScalar(1 - t * 0.5);
    if (t >= 1) progressRef.current = 0;
  });

  if (!active) return null;

  return (
    <group>
      <mesh ref={meshRef} position={startPos}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <pointLight position={startPos} color={color} intensity={3} distance={8} decay={2} />
    </group>
  );
}

interface DungeonSceneProps {
  wandScreenPos: { x: number; y: number } | null;
  spellActive: boolean;
  spellColor: string;
  shieldActive: boolean;
}

function DungeonInner({ wandScreenPos, spellActive, spellColor, shieldActive }: DungeonSceneProps) {
  const wandPos: [number, number, number] = useMemo(() => {
    if (!wandScreenPos) return [0, 0, 2];
    const x = (wandScreenPos.x - 0.5) * 8;
    const y = -(wandScreenPos.y - 0.5) * 6 + 1;
    return [x, y, 2] as [number, number, number];
  }, [wandScreenPos]);

  return (
    <>
      <ambientLight intensity={0.3} color="#ffd699" />

      {/* Dynamic wand light */}
      <SpellLight wandPosition={wandPos} spellColor={spellColor || "#eab308"} intensity={spellActive ? 6 : 1.5} />

      {/* Spell projectile */}
      <SpellProjectile active={spellActive} startPos={wandPos} color={spellColor || "#ef4444"} />

      {/* Shield */}
      {shieldActive && (
        <mesh position={[0, 1.5, 1]}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial color="#3b82f6" opacity={0.25} transparent side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Opponent figure */}
      <group position={[0, 0.5, -6]}>
        <mesh position={[0, 0.8, 0]}>
          <capsuleGeometry args={[0.3, 1.2, 8, 16]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.9, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#2a2a3e" roughness={0.7} />
        </mesh>
        <pointLight position={[0.5, 1.2, 0]} color="#ff4444" intensity={1.5} distance={8} />
      </group>
    </>
  );
}

export default function DungeonScene(props: DungeonSceneProps) {
  return (
    <div className="absolute inset-0 z-[2] pointer-events-none">
      <Canvas
        shadows
        camera={{ position: [0, 2, 6], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <DungeonInner {...props} />
      </Canvas>
    </div>
  );
}
