import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Floating Candle (visual only — NO pointLight for performance) ────
function FloatingCandle({ position, phase }: { position: [number, number, number]; phase: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.8 + phase) * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Candle body */}
      <mesh>
        <cylinderGeometry args={[0.035, 0.045, 0.55, 6]} />
        <meshStandardMaterial color="#f5e6c8" roughness={0.5} emissive="#f5e6c8" emissiveIntensity={0.1} />
      </mesh>
      {/* Flame core — emissive, no light */}
      <mesh position={[0, 0.34, 0]} scale={[1, 1.5, 1]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Flame outer glow */}
      <mesh position={[0, 0.38, 0]} scale={[0.8, 1.8, 0.8]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshBasicMaterial color="#ffaa22" transparent opacity={0.7} />
      </mesh>
      {/* Glow halo */}
      <mesh position={[0, 0.36, 0]} scale={[2, 2, 2]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshBasicMaterial color="#ff8811" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

// ─── Gothic Arch (pillar + arch) ─────────────────────────
function GothicPillar({ position, height = 9 }: { position: [number, number, number]; height?: number }) {
  return (
    <group position={position}>
      {/* Main pillar shaft */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[0.5, height, 0.5]} />
        <meshStandardMaterial color="#7a6b5a" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.7, 0.3, 0.7]} />
        <meshStandardMaterial color="#6a5b4a" roughness={0.95} />
      </mesh>
      {/* Capital */}
      <mesh position={[0, height - 0.15, 0]}>
        <boxGeometry args={[0.7, 0.3, 0.7]} />
        <meshStandardMaterial color="#6a5b4a" roughness={0.95} />
      </mesh>
      {/* Small decorative ribs going up */}
      <mesh position={[0.15, height / 2, 0.15]}>
        <boxGeometry args={[0.08, height, 0.08]} />
        <meshStandardMaterial color="#6a5a48" roughness={0.95} />
      </mesh>
      <mesh position={[-0.15, height / 2, 0.15]}>
        <boxGeometry args={[0.08, height, 0.08]} />
        <meshStandardMaterial color="#6a5a48" roughness={0.95} />
      </mesh>
    </group>
  );
}

// ─── Gothic Arch between pillars ─────────────────────────
function GothicArch({ 
  position, 
  rotation = [0, 0, 0], 
  width = 4, 
  height = 9 
}: { 
  position: [number, number, number]; 
  rotation?: [number, number, number]; 
  width?: number; 
  height?: number;
}) {
  // Create pointed arch shape
  const archShape = useMemo(() => {
    const shape = new THREE.Shape();
    const hw = width / 2;
    const archH = 1.5;
    // Rectangle with pointed arch top
    shape.moveTo(-hw, 0);
    shape.lineTo(-hw, height - archH);
    // Pointed arch
    shape.quadraticCurveTo(-hw, height, 0, height + 0.5);
    shape.quadraticCurveTo(hw, height, hw, height - archH);
    shape.lineTo(hw, 0);
    // Cut out inner arch
    const inner = new THREE.Path();
    const ihw = hw - 0.3;
    const iArchH = 1.2;
    inner.moveTo(-ihw, 0);
    inner.lineTo(-ihw, height - iArchH - 0.3);
    inner.quadraticCurveTo(-ihw, height - 0.3, 0, height + 0.1);
    inner.quadraticCurveTo(ihw, height - 0.3, ihw, height - iArchH - 0.3);
    inner.lineTo(ihw, 0);
    shape.holes.push(inner);
    return shape;
  }, [width, height]);

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <extrudeGeometry args={[archShape, { depth: 0.25, bevelEnabled: false }]} />
        <meshStandardMaterial color="#7a6b5a" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── House Banner ────────────────────────────────────────
function HouseBanner({ 
  position, 
  rotation, 
  color, 
  emblemColor 
}: { 
  position: [number, number, number]; 
  rotation: [number, number, number]; 
  color: string; 
  emblemColor: string; 
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Subtle sway
      meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5 + position[0]) * 0.03;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Banner pole */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 2.5, 6]} />
        <meshStandardMaterial color="#3a2a1a" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Banner fabric */}
      <mesh ref={meshRef} position={[0, -1.5, 0.05]}>
        <planeGeometry args={[1.8, 3.5]} />
        <meshStandardMaterial color={color} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* Shield/emblem shape */}
      <mesh position={[0, -1.3, 0.08]}>
        <circleGeometry args={[0.35, 6]} />
        <meshStandardMaterial color={emblemColor} roughness={0.7} metalness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Border stripes */}
      <mesh position={[0, -1.5, 0.06]}>
        <planeGeometry args={[1.9, 0.08]} />
        <meshStandardMaterial color={emblemColor} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.5, 0.06]}>
        <planeGeometry args={[1.9, 0.08]} />
        <meshStandardMaterial color={emblemColor} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Stained Glass Window ────────────────────────────────
function StainedGlassWindow({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.intensity = 2 + Math.sin(clock.getElapsedTime() * 0.3) * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Window frame - pointed gothic arch shape */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[6, 7, 0.3]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
      </mesh>
      {/* Glass panels - main */}
      <mesh position={[0, 0.5, 0.1]}>
        <planeGeometry args={[5, 5.5]} />
        <meshBasicMaterial color="#1a2a5a" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* Glass panel sections - vertical mullions */}
      {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
        <mesh key={`mullion-${i}`} position={[x, 0.5, 0.15]}>
          <boxGeometry args={[0.08, 5.5, 0.1]} />
          <meshStandardMaterial color="#4a3a28" roughness={0.8} metalness={0.2} />
        </mesh>
      ))}
      {/* Horizontal transoms */}
      {[-1.5, 0, 1.5].map((y, i) => (
        <mesh key={`transom-${i}`} position={[0, y + 0.5, 0.15]}>
          <boxGeometry args={[5, 0.08, 0.1]} />
          <meshStandardMaterial color="#4a3a28" roughness={0.8} metalness={0.2} />
        </mesh>
      ))}
      {/* Colored glass accents */}
      <mesh position={[-1, 2, 0.12]}>
        <circleGeometry args={[0.4, 8]} />
        <meshBasicMaterial color="#cc3333" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[1, 2, 0.12]}>
        <circleGeometry args={[0.4, 8]} />
        <meshBasicMaterial color="#33aa33" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 2.8, 0.12]}>
        <circleGeometry args={[0.5, 8]} />
        <meshBasicMaterial color="#ddaa33" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Gold crest/emblem at center */}
      <mesh position={[0, 1, 0.12]}>
        <circleGeometry args={[0.7, 8]} />
        <meshStandardMaterial color="#c4a033" metalness={0.6} roughness={0.3} emissive="#c4a033" emissiveIntensity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Pointed arch top piece */}
      <mesh position={[0, 3.8, 0.05]}>
        <coneGeometry args={[2.8, 1.5, 3]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
      </mesh>
      {/* Light coming through */}
      <pointLight ref={lightRef} position={[0, 1, 2]} color="#8899cc" intensity={2} distance={20} decay={1.5} />
      <pointLight position={[0, 3, 1]} color="#aabbdd" intensity={1} distance={15} decay={2} />
    </group>
  );
}

// ─── Wall Torch/Sconce ───────────────────────────────────
function WallTorch({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const flameRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (lightRef.current) {
      lightRef.current.intensity = 4 + Math.sin(t * 5 + position[0] * 3) * 1 + Math.sin(t * 8.3 + position[2] * 2) * 0.5;
    }
    if (flameRef.current) {
      flameRef.current.scale.y = 1 + Math.sin(t * 7 + position[0]) * 0.2;
    }
  });

  return (
    <group position={position} rotation={rotation || [0, 0, 0]}>
      {/* Iron bracket */}
      <mesh position={[0, -0.05, 0.12]}>
        <boxGeometry args={[0.06, 0.5, 0.12]} />
        <meshStandardMaterial color="#2a1a0a" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Torch cup */}
      <mesh position={[0, 0.22, 0.22]}>
        <cylinderGeometry args={[0.07, 0.1, 0.18, 8]} />
        <meshStandardMaterial color="#1a0a04" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Flame */}
      <mesh ref={flameRef} position={[0, 0.38, 0.22]} scale={[1, 1, 1]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color="#ffaa22" />
      </mesh>
      {/* Flame glow */}
      <mesh position={[0, 0.38, 0.22]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.12} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0.4, 0.35]} color="#ff9933" intensity={4} distance={12} decay={1.5} />
    </group>
  );
}

// ─── Long Dining Table ───────────────────────────────────
function DiningTable({ position, length = 14 }: { position: [number, number, number]; length?: number }) {
  return (
    <group position={position}>
      {/* Table top */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[1.8, 0.08, length]} />
        <meshStandardMaterial color="#4a2a12" roughness={0.85} />
      </mesh>
      {/* Table legs */}
      {Array.from({ length: Math.floor(length / 3) + 1 }, (_, i) => {
        const z = -length / 2 + i * 3;
        return (
          <group key={i}>
            <mesh position={[-0.7, 0.37, z]}>
              <boxGeometry args={[0.1, 0.75, 0.1]} />
              <meshStandardMaterial color="#3a1a08" roughness={0.9} />
            </mesh>
            <mesh position={[0.7, 0.37, z]}>
              <boxGeometry args={[0.1, 0.75, 0.1]} />
              <meshStandardMaterial color="#3a1a08" roughness={0.9} />
            </mesh>
          </group>
        );
      })}
      {/* Benches on each side */}
      <mesh position={[-1.3, 0.35, 0]}>
        <boxGeometry args={[0.5, 0.06, length - 0.5]} />
        <meshStandardMaterial color="#3a1a08" roughness={0.9} />
      </mesh>
      <mesh position={[1.3, 0.35, 0]}>
        <boxGeometry args={[0.5, 0.06, length - 0.5]} />
        <meshStandardMaterial color="#3a1a08" roughness={0.9} />
      </mesh>
      {/* Bench legs */}
      {Array.from({ length: Math.floor(length / 4) + 1 }, (_, i) => {
        const z = -length / 2 + 1 + i * 4;
        return (
          <group key={`bl-${i}`}>
            <mesh position={[-1.3, 0.17, z]}>
              <boxGeometry args={[0.08, 0.35, 0.08]} />
              <meshStandardMaterial color="#2a0a04" roughness={0.9} />
            </mesh>
            <mesh position={[1.3, 0.17, z]}>
              <boxGeometry args={[0.08, 0.35, 0.08]} />
              <meshStandardMaterial color="#2a0a04" roughness={0.9} />
            </mesh>
          </group>
        );
      })}
      {/* Plates & goblets scattered on table */}
      {Array.from({ length: Math.floor(length / 1.5) }, (_, i) => {
        const z = -length / 2 + 0.8 + i * 1.5;
        const xOff = (i % 2 === 0 ? -0.4 : 0.4);
        return (
          <group key={`food-${i}`}>
            {/* Plate */}
            <mesh position={[xOff, 0.81, z]}>
              <cylinderGeometry args={[0.15, 0.15, 0.02, 12]} />
              <meshStandardMaterial color="#c4a033" metalness={0.4} roughness={0.4} />
            </mesh>
            {/* Goblet */}
            <mesh position={[xOff + 0.25, 0.87, z + 0.1]}>
              <cylinderGeometry args={[0.04, 0.06, 0.12, 8]} />
              <meshStandardMaterial color="#b8860b" metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ─── Night Sky Window ────────────────────────────────────
function NightSkyWindow({
  position,
  facing,
  showMoon = false,
  seed = 0,
}: {
  position: [number, number, number];
  facing: "east" | "west";
  showMoon?: boolean;
  seed?: number;
}) {
  // Deterministic pseudo-random from seed
  const stars = useMemo(() => {
    const arr: { y: number; z: number; size: number; brightness: number }[] = [];
    let s = seed * 1337 + 42;
    const rng = () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < 18; i++) {
      arr.push({
        y: (rng() - 0.5) * 4,
        z: (rng() - 0.5) * 1.6,
        size: 0.015 + rng() * 0.025,
        brightness: 0.5 + rng() * 0.5,
      });
    }
    return arr;
  }, [seed]);

  const rot: [number, number, number] = facing === "east" ? [0, 0, 0] : [0, Math.PI, 0];

  return (
    <group position={position} rotation={rot}>
      {/* Stone window surround/frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.3, 5.5, 2.4]} />
        <meshStandardMaterial color="#6a5a48" roughness={0.92} />
      </mesh>
      {/* Inner frame recess */}
      <mesh position={[0.08, 0, 0]}>
        <boxGeometry args={[0.12, 5, 2]} />
        <meshStandardMaterial color="#5a4a38" roughness={0.95} />
      </mesh>

      {/* Night sky — deep blue gradient (layered planes) */}
      {/* Bottom darker */}
      <mesh position={[0.14, -1, 0]}>
        <planeGeometry args={[1.8, 2.5]} />
        <meshBasicMaterial color="#0a1128" side={THREE.DoubleSide} />
      </mesh>
      {/* Mid blue */}
      <mesh position={[0.14, 0.5, 0]}>
        <planeGeometry args={[1.8, 2]} />
        <meshBasicMaterial color="#0f1b3d" side={THREE.DoubleSide} />
      </mesh>
      {/* Upper lighter blue */}
      <mesh position={[0.14, 1.5, 0]}>
        <planeGeometry args={[1.8, 1.5]} />
        <meshBasicMaterial color="#152652" side={THREE.DoubleSide} />
      </mesh>
      {/* Very top — subtle purple-blue horizon glow */}
      <mesh position={[0.14, -1.8, 0]}>
        <planeGeometry args={[1.8, 0.8]} />
        <meshBasicMaterial color="#1a1a40" side={THREE.DoubleSide} />
      </mesh>

      {/* Stars */}
      {stars.map((star, s) => (
        <mesh key={s} position={[0.15, star.y, star.z]}>
          <circleGeometry args={[star.size, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={star.brightness} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Brighter prominent stars */}
      <mesh position={[0.15, 1.2, 0.4]}>
        <circleGeometry args={[0.04, 8]} />
        <meshBasicMaterial color="#aaccff" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.15, 0.3, -0.5]}>
        <circleGeometry args={[0.035, 8]} />
        <meshBasicMaterial color="#ffeedd" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Wispy cloud layer */}
      <mesh position={[0.145, -0.5, 0.2]}>
        <planeGeometry args={[1.2, 0.3]} />
        <meshBasicMaterial color="#2a3a6a" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.145, 0.8, -0.3]}>
        <planeGeometry args={[0.8, 0.2]} />
        <meshBasicMaterial color="#253560" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Moon */}
      {showMoon && (
        <>
          <mesh position={[0.16, 1.3, 0.2]}>
            <circleGeometry args={[0.22, 24]} />
            <meshBasicMaterial color="#e8eeff" side={THREE.DoubleSide} />
          </mesh>
          {/* Moon glow */}
          <mesh position={[0.155, 1.3, 0.2]}>
            <circleGeometry args={[0.35, 24]} />
            <meshBasicMaterial color="#8899cc" transparent opacity={0.2} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.15, 1.3, 0.2]}>
            <circleGeometry args={[0.55, 24]} />
            <meshBasicMaterial color="#556699" transparent opacity={0.08} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}

      {/* Stone mullions (vertical dividers) */}
      <mesh position={[0.16, 0, -0.35]}>
        <boxGeometry args={[0.06, 5, 0.08]} />
        <meshStandardMaterial color="#5a4a38" roughness={0.9} />
      </mesh>
      <mesh position={[0.16, 0, 0.35]}>
        <boxGeometry args={[0.06, 5, 0.08]} />
        <meshStandardMaterial color="#5a4a38" roughness={0.9} />
      </mesh>
      {/* Horizontal transoms */}
      <mesh position={[0.16, 0.8, 0]}>
        <boxGeometry args={[0.06, 0.08, 1.8]} />
        <meshStandardMaterial color="#5a4a38" roughness={0.9} />
      </mesh>
      <mesh position={[0.16, -0.8, 0]}>
        <boxGeometry args={[0.06, 0.08, 1.8]} />
        <meshStandardMaterial color="#5a4a38" roughness={0.9} />
      </mesh>
      {/* Pointed arch top */}
      <mesh position={[0.16, 2.7, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.95, 1, 3]} />
        <meshStandardMaterial color="#5a4a38" roughness={0.9} />
      </mesh>
      {/* Sill at bottom */}
      <mesh position={[0.1, -2.5, 0]}>
        <boxGeometry args={[0.35, 0.15, 2.4]} />
        <meshStandardMaterial color="#6a5a48" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ─── The Great Hall Scene ────────────────────────────────
export default function GreatHallScene() {
  const hw = 12;
  const hd = 18;
  const wallH = 10;
  const cx = 0, cz = 0;

  // Generate floating candle positions — more candles, clustered over tables
  const candles = useMemo(() => {
    const arr: { pos: [number, number, number]; phase: number }[] = [];
    // Candles above tables — fewer per table
    const tableXs = [-7, -3, 3, 7];
    for (const tx of tableXs) {
      for (let j = 0; j < 6; j++) {
        arr.push({
          pos: [tx + (Math.random() - 0.5) * 1.5, 4 + Math.random() * 4.5, -12 + j * 5 + Math.random()],
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
    // A few scattered aisle candles
    for (let i = 0; i < 10; i++) {
      arr.push({
        pos: [
          (Math.random() - 0.5) * 5,
          6 + Math.random() * 3,
          (Math.random() - 0.5) * (hd * 2 - 6),
        ],
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  return (
    <group position={[cx, 0, cz]}>
      {/* ═══ Floor — stone tiles ═══ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[hw * 2, hd * 2]} />
        <meshStandardMaterial color="#5a4a38" roughness={0.88} />
      </mesh>
      {/* Center aisle — worn dark stone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[3.5, hd * 2 - 2]} />
        <meshStandardMaterial color="#3e2e1e" roughness={0.92} />
      </mesh>
      {/* Floor tile lines for realism */}
      {Array.from({ length: 12 }, (_, i) => {
        const z = -hd + 3 + i * 3;
        return (
          <mesh key={`ftile-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.007, z]}>
            <planeGeometry args={[hw * 2, 0.03]} />
            <meshStandardMaterial color="#2a1a0e" roughness={1} />
          </mesh>
        );
      })}

      {/* ═══ Ceiling — dark vaulted ═══ */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, wallH, 0]}>
        <planeGeometry args={[hw * 2, hd * 2]} />
        <meshStandardMaterial color="#1e1208" roughness={1} />
      </mesh>
      {/* Ceiling ribs — cross beams */}
      {Array.from({ length: 10 }, (_, i) => {
        const z = -hd + 1.5 + i * (hd * 2 / 9);
        return (
          <group key={`rib-${i}`}>
            <mesh position={[0, wallH - 0.12, z]}>
              <boxGeometry args={[hw * 2, 0.25, 0.2]} />
              <meshStandardMaterial color="#3a2818" roughness={0.85} />
            </mesh>
            {/* Diagonal rib left */}
            <mesh position={[-hw / 2, wallH - 0.12, z]} rotation={[0, 0, 0.15]}>
              <boxGeometry args={[hw, 0.15, 0.12]} />
              <meshStandardMaterial color="#3a2818" roughness={0.85} />
            </mesh>
            {/* Diagonal rib right */}
            <mesh position={[hw / 2, wallH - 0.12, z]} rotation={[0, 0, -0.15]}>
              <boxGeometry args={[hw, 0.15, 0.12]} />
              <meshStandardMaterial color="#3a2818" roughness={0.85} />
            </mesh>
          </group>
        );
      })}
      {/* Longitudinal beam */}
      <mesh position={[0, wallH - 0.12, 0]}>
        <boxGeometry args={[0.2, 0.25, hd * 2]} />
        <meshStandardMaterial color="#3a2818" roughness={0.85} />
      </mesh>

      {/* ═══ Walls — stone with horizontal coursing lines ═══ */}
      {/* North wall */}
      <mesh position={[0, wallH / 2, -hd]}>
        <boxGeometry args={[hw * 2, wallH, 0.4]} />
        <meshStandardMaterial color="#8a7a68" roughness={0.92} />
      </mesh>
      {/* South wall (entrance) */}
      <mesh position={[0, wallH / 2, hd]}>
        <boxGeometry args={[hw * 2, wallH, 0.4]} />
        <meshStandardMaterial color="#8a7a68" roughness={0.92} />
      </mesh>
      {/* West wall */}
      <mesh position={[-hw, wallH / 2, 0]}>
        <boxGeometry args={[0.4, wallH, hd * 2]} />
        <meshStandardMaterial color="#8a7a68" roughness={0.92} />
      </mesh>
      {/* East wall */}
      <mesh position={[hw, wallH / 2, 0]}>
        <boxGeometry args={[0.4, wallH, hd * 2]} />
        <meshStandardMaterial color="#8a7a68" roughness={0.92} />
      </mesh>
      {/* Stone coursing lines on side walls */}
      {Array.from({ length: 10 }, (_, i) => {
        const y = 0.8 + i * 1;
        return (
          <group key={`course-${i}`}>
            <mesh position={[-hw + 0.01, y, 0]}>
              <boxGeometry args={[0.02, 0.03, hd * 2]} />
              <meshStandardMaterial color="#5a4a38" roughness={1} />
            </mesh>
            <mesh position={[hw - 0.01, y, 0]}>
              <boxGeometry args={[0.02, 0.03, hd * 2]} />
              <meshStandardMaterial color="#5a4a38" roughness={1} />
            </mesh>
          </group>
        );
      })}
      {/* Wall wainscoting / lower wood paneling */}
      <mesh position={[-hw + 0.15, 1.2, 0]}>
        <boxGeometry args={[0.12, 2.4, hd * 2 - 1]} />
        <meshStandardMaterial color="#4a3018" roughness={0.85} />
      </mesh>
      <mesh position={[hw - 0.15, 1.2, 0]}>
        <boxGeometry args={[0.12, 2.4, hd * 2 - 1]} />
        <meshStandardMaterial color="#4a3018" roughness={0.85} />
      </mesh>

      {/* ═══ Gothic Pillars along both walls ═══ */}
      {Array.from({ length: 7 }, (_, i) => {
        const z = -hd + 3 + i * 5;
        return (
          <group key={`pillars-${i}`}>
            <GothicPillar position={[-hw + 0.5, 0, z]} height={wallH} />
            <GothicPillar position={[hw - 0.5, 0, z]} height={wallH} />
          </group>
        );
      })}

      {/* ═══ Gothic Arches between pillars ═══ */}
      {Array.from({ length: 6 }, (_, i) => {
        const z = -hd + 5.5 + i * 5;
        return (
          <group key={`arches-${i}`}>
            <GothicArch position={[-hw + 0.35, 0, z]} rotation={[0, Math.PI / 2, 0]} width={4} height={wallH - 1} />
            <GothicArch position={[hw - 0.6, 0, z]} rotation={[0, Math.PI / 2, 0]} width={4} height={wallH - 1} />
          </group>
        );
      })}

      {/* ═══ Night Sky Windows ═══ */}
      {Array.from({ length: 6 }, (_, i) => {
        const z = -hd + 5.5 + i * 5;
        return (
          <group key={`windows-${i}`}>
            <NightSkyWindow position={[-hw + 0.1, 5, z]} facing="east" showMoon={i === 2} seed={i} />
            <NightSkyWindow position={[hw - 0.1, 5, z]} facing="west" showMoon={i === 4} seed={i + 10} />
          </group>
        );
      })}

      {/* ═══ Stained Glass Window (far north wall) ═══ */}
      <StainedGlassWindow position={[0, 4, -hd + 0.3]} />

      {/* ═══ Head Table (raised platform at north end) ═══ */}
      {/* Platform */}
      <mesh position={[0, 0.25, -hd + 3]}>
        <boxGeometry args={[hw * 1.5, 0.5, 3]} />
        <meshStandardMaterial color="#5a4a38" roughness={0.9} />
      </mesh>
      {/* Head table on platform */}
      <mesh position={[0, 0.75, -hd + 3]}>
        <boxGeometry args={[hw * 1.4, 0.08, 1.2]} />
        <meshStandardMaterial color="#5a3018" roughness={0.85} />
      </mesh>

      {/* ═══ Four Long Dining Tables ═══ */}
      <DiningTable position={[-7, 0, 2]} length={28} />
      <DiningTable position={[-3, 0, 2]} length={28} />
      <DiningTable position={[3, 0, 2]} length={28} />
      <DiningTable position={[7, 0, 2]} length={28} />

      {/* ═══ House Banners ═══ */}
      {/* West wall banners */}
      <HouseBanner position={[-hw + 0.3, 7.5, -8]} rotation={[0, Math.PI / 2, 0]} color="#1a5a1a" emblemColor="#c0c0c0" /> {/* Slytherin */}
      <HouseBanner position={[-hw + 0.3, 7.5, -2]} rotation={[0, Math.PI / 2, 0]} color="#8b0000" emblemColor="#ffd700" /> {/* Gryffindor */}
      <HouseBanner position={[-hw + 0.3, 7.5, 4]} rotation={[0, Math.PI / 2, 0]} color="#1a3a6a" emblemColor="#c9792e" /> {/* Ravenclaw */}
      <HouseBanner position={[-hw + 0.3, 7.5, 10]} rotation={[0, Math.PI / 2, 0]} color="#c4a033" emblemColor="#1a1a1a" /> {/* Hufflepuff */}
      {/* East wall banners */}
      <HouseBanner position={[hw - 0.3, 7.5, -8]} rotation={[0, -Math.PI / 2, 0]} color="#8b0000" emblemColor="#ffd700" /> {/* Gryffindor */}
      <HouseBanner position={[hw - 0.3, 7.5, -2]} rotation={[0, -Math.PI / 2, 0]} color="#1a5a1a" emblemColor="#c0c0c0" /> {/* Slytherin */}
      <HouseBanner position={[hw - 0.3, 7.5, 4]} rotation={[0, -Math.PI / 2, 0]} color="#c4a033" emblemColor="#1a1a1a" /> {/* Hufflepuff */}
      <HouseBanner position={[hw - 0.3, 7.5, 10]} rotation={[0, -Math.PI / 2, 0]} color="#1a3a6a" emblemColor="#c9792e" /> {/* Ravenclaw */}

      {/* ═══ Wall Torches (only 3 per side for performance) ═══ */}
      {Array.from({ length: 3 }, (_, i) => {
        const z = -hd + 6 + i * 10;
        return (
          <group key={`torches-${i}`}>
            <WallTorch position={[-hw + 0.3, 3.5, z]} rotation={[0, Math.PI / 2, 0]} />
            <WallTorch position={[hw - 0.3, 3.5, z]} rotation={[0, -Math.PI / 2, 0]} />
          </group>
        );
      })}

      {/* ═══ Floating Candles ═══ */}
      {candles.map((c, i) => (
        <FloatingCandle key={i} position={c.pos} phase={c.phase} />
      ))}

      {/* ═══ Atmospheric Lighting — bright but few lights ═══ */}
      <ambientLight color="#ffeedd" intensity={1.2} />
      {/* 3 main overhead fills */}
      <pointLight position={[0, 9, 0]} color="#ffbb66" intensity={8} distance={60} decay={0.6} />
      <pointLight position={[0, 8, -12]} color="#ffaa55" intensity={5} distance={50} decay={0.8} />
      <pointLight position={[0, 8, 12]} color="#ffaa55" intensity={5} distance={50} decay={0.8} />
      {/* Stained glass accent */}
      <pointLight position={[0, 6, -hd + 2]} color="#8899cc" intensity={3} distance={25} decay={1} />

      {/* ═══ Table candles (mesh only, no lights) ═══ */}
      {[-7, -3, 3, 7].map((tx) =>
        Array.from({ length: 6 }, (_, j) => {
          const z = -10 + j * 4;
          return (
            <group key={`tc-${tx}-${j}`} position={[tx, 0.82, z]}>
              <mesh>
                <cylinderGeometry args={[0.025, 0.03, 0.2, 6]} />
                <meshStandardMaterial color="#f5e6c8" emissive="#f5e6c8" emissiveIntensity={0.1} roughness={0.5} />
              </mesh>
              <mesh position={[0, 0.13, 0]}>
                <sphereGeometry args={[0.02, 6, 6]} />
                <meshBasicMaterial color="#ffcc44" />
              </mesh>
            </group>
          );
        })
      )}
    </group>
  );
}
