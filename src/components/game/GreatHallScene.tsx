import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Floating Candle ─────────────────────────────────────
function FloatingCandle({ position, phase }: { position: [number, number, number]; phase: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      // Gentle bobbing
      groupRef.current.position.y = position[1] + Math.sin(t * 0.8 + phase) * 0.15;
    }
    if (lightRef.current) {
      // Flickering flame
      lightRef.current.intensity = 1.2 + Math.sin(t * 6 + phase) * 0.3 + Math.sin(t * 9.7 + phase * 2) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Candle body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.5, 6]} />
        <meshStandardMaterial color="#f5e6c8" roughness={0.6} />
      </mesh>
      {/* Flame */}
      <mesh position={[0, 0.32, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#ffaa33" />
      </mesh>
      <mesh position={[0, 0.38, 0]} scale={[0.6, 1.2, 0.6]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshBasicMaterial color="#ffdd66" transparent opacity={0.8} />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 0.35, 0]}
        color="#ff9933"
        intensity={1.2}
        distance={8}
        decay={2}
      />
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

  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.intensity = 2.5 + Math.sin(clock.getElapsedTime() * 4 + position[0] * 3) * 0.5;
    }
  });

  return (
    <group position={position} rotation={rotation || [0, 0, 0]}>
      {/* Bracket */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[0.12, 0.3, 0.2]} />
        <meshStandardMaterial color="#3a2a18" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Torch cup */}
      <mesh position={[0, 0.2, 0.2]}>
        <cylinderGeometry args={[0.08, 0.12, 0.15, 8]} />
        <meshStandardMaterial color="#2a1a0a" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Flame */}
      <mesh position={[0, 0.35, 0.2]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#ff8822" />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0.4, 0.3]} color="#ff8833" intensity={2.5} distance={8} decay={2} />
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

// ─── The Great Hall Scene ────────────────────────────────
export default function GreatHallScene() {
  const hw = 12; // half width
  const hd = 18; // half depth
  const wallH = 10; // full wall height
  const cx = 0, cz = 0;

  // Generate floating candle positions
  const candles = useMemo(() => {
    const arr: { pos: [number, number, number]; phase: number }[] = [];
    for (let i = 0; i < 60; i++) {
      arr.push({
        pos: [
          (Math.random() - 0.5) * (hw * 2 - 4),
          5 + Math.random() * 4,
          (Math.random() - 0.5) * (hd * 2 - 4),
        ],
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  return (
    <group position={[cx, 0, cz]}>
      {/* ═══ Floor ═══ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[hw * 2, hd * 2]} />
        <meshStandardMaterial color="#4a3828" roughness={0.92} />
      </mesh>
      {/* Floor center aisle (darker stone) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[3, hd * 2 - 2]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.95} />
      </mesh>

      {/* ═══ Ceiling - vaulted look ═══ */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, wallH, 0]}>
        <planeGeometry args={[hw * 2, hd * 2]} />
        <meshStandardMaterial color="#2a1a12" roughness={1} />
      </mesh>
      {/* Ceiling beams */}
      {Array.from({ length: 8 }, (_, i) => {
        const z = -hd + 2 + i * (hd * 2 / 7);
        return (
          <mesh key={`beam-${i}`} position={[0, wallH - 0.15, z]}>
            <boxGeometry args={[hw * 2, 0.3, 0.25]} />
            <meshStandardMaterial color="#3a2818" roughness={0.9} />
          </mesh>
        );
      })}

      {/* ═══ Walls ═══ */}
      {/* North wall (far end with stained glass) */}
      <mesh position={[0, wallH / 2, -hd]}>
        <boxGeometry args={[hw * 2, wallH, 0.4]} />
        <meshStandardMaterial color="#7a6b5a" roughness={0.95} />
      </mesh>
      {/* South wall (entrance - with door opening) */}
      <mesh position={[-hw / 2 - hw / 4, wallH / 2, hd]}>
        <boxGeometry args={[hw, wallH, 0.4]} />
        <meshStandardMaterial color="#7a6b5a" roughness={0.95} />
      </mesh>
      <mesh position={[hw / 2 + hw / 4, wallH / 2, hd]}>
        <boxGeometry args={[hw, wallH, 0.4]} />
        <meshStandardMaterial color="#7a6b5a" roughness={0.95} />
      </mesh>
      <mesh position={[0, wallH * 0.85, hd]}>
        <boxGeometry args={[hw / 2, wallH * 0.3, 0.4]} />
        <meshStandardMaterial color="#7a6b5a" roughness={0.95} />
      </mesh>
      {/* West wall */}
      <mesh position={[-hw, wallH / 2, 0]}>
        <boxGeometry args={[0.4, wallH, hd * 2]} />
        <meshStandardMaterial color="#7a6b5a" roughness={0.95} />
      </mesh>
      {/* East wall */}
      <mesh position={[hw, wallH / 2, 0]}>
        <boxGeometry args={[0.4, wallH, hd * 2]} />
        <meshStandardMaterial color="#7a6b5a" roughness={0.95} />
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

      {/* ═══ Wall Torches ═══ */}
      {Array.from({ length: 7 }, (_, i) => {
        const z = -hd + 4 + i * 5;
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

      {/* ═══ Atmospheric Lighting ═══ */}
      <ambientLight color="#ffd699" intensity={0.3} />
      {/* Main warm fills */}
      <pointLight position={[0, 8, 0]} color="#ff9944" intensity={3} distance={40} decay={1} />
      <pointLight position={[-6, 6, -8]} color="#ff8833" intensity={2} distance={25} decay={1.5} />
      <pointLight position={[6, 6, -8]} color="#ff8833" intensity={2} distance={25} decay={1.5} />
      <pointLight position={[-6, 6, 8]} color="#ff8833" intensity={2} distance={25} decay={1.5} />
      <pointLight position={[6, 6, 8]} color="#ff8833" intensity={2} distance={25} decay={1.5} />
      {/* Cooler accent from stained glass */}
      <pointLight position={[0, 5, -hd + 3]} color="#6688bb" intensity={1.5} distance={20} decay={1.5} />
    </group>
  );
}
