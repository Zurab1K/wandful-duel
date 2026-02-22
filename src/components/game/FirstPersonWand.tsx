import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WandModelProps {
  /** Wand tip position in normalized screen coords (0-1) */
  wandTip: { x: number; y: number } | null;
  spellActive: boolean;
  spellColor: string;
}

function Wand({ wandTip, spellActive, spellColor }: WandModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const smoothedRot = useRef({ x: 0, y: 0 });

  // Map wand tip screen position to rotation angles
  const targetRot = useMemo(() => {
    if (!wandTip) return { x: 0, y: 0 };
    // x: 0-1 maps to rotation around Y (-30 to 30 degrees)
    // y: 0-1 maps to rotation around X (-20 to 40 degrees)
    return {
      x: -(wandTip.y - 0.5) * 1.2, // pitch
      y: -(wandTip.x - 0.5) * 1.0, // yaw
    };
  }, [wandTip]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Smooth interpolation
    const speed = 8;
    smoothedRot.current.x += (targetRot.x - smoothedRot.current.x) * speed * delta;
    smoothedRot.current.y += (targetRot.y - smoothedRot.current.y) * speed * delta;

    groupRef.current.rotation.x = smoothedRot.current.x;
    groupRef.current.rotation.z = smoothedRot.current.y;

    // Wand tip glow
    if (glowRef.current) {
      glowRef.current.intensity = spellActive
        ? 3 + Math.sin(performance.now() * 0.01) * 1.5
        : 0.8;
    }
  });

  return (
    <group ref={groupRef} position={[0.8, -0.6, -1]} rotation={[0.3, -0.2, 0.5]}>
      {/* Wand shaft */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.015, 0.025, 0.7, 8]} />
        <meshStandardMaterial color="#4a3728" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Wand handle (thicker) */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.028, 0.032, 0.15, 8]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.8} metalness={0.05} />
      </mesh>

      {/* Handle grip rings */}
      {[0, 0.04, -0.04].map((offset, i) => (
        <mesh key={i} position={[0, -0.08 + offset, 0]}>
          <torusGeometry args={[0.033, 0.004, 8, 16]} />
          <meshStandardMaterial color="#5a4a35" roughness={0.6} metalness={0.2} />
        </mesh>
      ))}

      {/* Wand tip */}
      <mesh position={[0, 0.66, 0]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial
          color={spellActive ? spellColor : "#8a7a6a"}
          emissive={spellActive ? spellColor : "#000000"}
          emissiveIntensity={spellActive ? 2 : 0}
        />
      </mesh>

      {/* Wand tip glow */}
      <pointLight
        ref={glowRef}
        position={[0, 0.7, 0]}
        color={spellActive ? spellColor : "#eab308"}
        intensity={0.8}
        distance={3}
        decay={2}
      />

      {/* Spell casting particle burst */}
      {spellActive && (
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial
            color={spellColor}
            transparent
            opacity={0.4}
          />
        </mesh>
      )}
    </group>
  );
}

function SpellBeam({ active, color }: { active: boolean; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progress = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current || !active) {
      progress.current = 0;
      if (meshRef.current) meshRef.current.visible = false;
      return;
    }
    meshRef.current.visible = true;
    progress.current = Math.min(progress.current + delta * 4, 1);
    const t = progress.current;

    // Beam shoots forward from wand tip
    meshRef.current.position.set(0.8, -0.2 + t * 0.5, -1 - t * 8);
    meshRef.current.scale.set(1 - t * 0.3, 1 - t * 0.3, 1 + t * 3);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 1 - t * 0.7;
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

interface FirstPersonWandProps {
  wandTip: { x: number; y: number } | null;
  spellActive: boolean;
  spellColor: string;
  shieldActive: boolean;
}

export default function FirstPersonWand({
  wandTip,
  spellActive,
  spellColor,
  shieldActive,
}: FirstPersonWandProps) {
  return (
    <div className="absolute inset-0 z-[3] pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 0], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} color="#ffd699" />
        <directionalLight position={[2, 3, 1]} intensity={0.6} color="#ffe0b0" />

        <Wand wandTip={wandTip} spellActive={spellActive} spellColor={spellColor} />
        <SpellBeam active={spellActive} color={spellColor} />

        {/* Shield sphere */}
        {shieldActive && (
          <mesh position={[0, 0, -2]}>
            <sphereGeometry args={[1.2, 32, 32]} />
            <meshBasicMaterial
              color="#3b82f6"
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </Canvas>
    </div>
  );
}
