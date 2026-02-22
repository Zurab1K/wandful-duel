import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { type RoomDef } from "@/lib/hogwartsRooms";
import GreatHallScene from "./GreatHallScene";

// ─── Room geometry ────────────────────────────────────────

function RoomMesh({ room }: { room: RoomDef }) {
  const [hw, hh, hd] = room.size;
  const [cx, cy, cz] = room.center;

  return (
    <group position={[cx, cy, cz]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[hw * 2, hd * 2]} />
        <meshStandardMaterial color={room.floorColor} roughness={0.9} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, hh * 2, 0]}>
        <planeGeometry args={[hw * 2, hd * 2]} />
        <meshStandardMaterial color={room.ceilingColor} roughness={1} />
      </mesh>

      {/* Walls — skip sections where doors are */}
      <RoomWalls room={room} />

      {/* Props */}
      {room.props.map((prop, i) =>
        prop.type === "box" ? (
          <mesh key={i} position={prop.position}>
            <boxGeometry args={prop.size} />
            <meshStandardMaterial color={prop.color} roughness={0.8} />
          </mesh>
        ) : (
          <mesh key={i} position={prop.position}>
            <cylinderGeometry args={[prop.size[0], prop.size[2], prop.size[1], 16]} />
            <meshStandardMaterial color={prop.color} roughness={0.7} />
          </mesh>
        )
      )}

      {/* Lights */}
      {room.lights.map((light, i) => (
        <pointLight
          key={i}
          position={light.position}
          color={light.color}
          intensity={light.intensity}
          distance={40}
          decay={1}
        />
      ))}

      {/* Ambient */}
      <ambientLight color={room.ambientColor} intensity={room.ambientIntensity} />

      {/* NPCs */}
      {room.npcs.map((npc) => (
        <NPCFigure key={npc.id} npc={npc} />
      ))}

      {/* Door markers (glowing arches) */}
      {room.doors.map((door, i) => (
        <DoorMarker key={i} position={door.position} wall={door.wall} />
      ))}
    </group>
  );
}

function RoomWalls({ room }: { room: RoomDef }) {
  const [hw, hh, hd] = room.size;
  const wallThickness = 0.3;
  const wallHeight = hh * 2;

  // Check if a wall segment has a door
  const hasDoor = (wall: string) => room.doors.some((d) => d.wall === wall);

  const segments: JSX.Element[] = [];

  // North wall (-z)
  if (!hasDoor("north")) {
    segments.push(
      <mesh key="n" position={[0, wallHeight / 2, -hd]}>
        <boxGeometry args={[hw * 2, wallHeight, wallThickness]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.9} />
      </mesh>
    );
  } else {
    // Wall with door opening (two segments on either side)
    segments.push(
      <mesh key="nl" position={[-hw / 2 - hw / 4, wallHeight / 2, -hd]}>
        <boxGeometry args={[hw, wallHeight, wallThickness]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.9} />
      </mesh>,
      <mesh key="nr" position={[hw / 2 + hw / 4, wallHeight / 2, -hd]}>
        <boxGeometry args={[hw, wallHeight, wallThickness]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.9} />
      </mesh>,
      // Archway top
      <mesh key="nt" position={[0, wallHeight * 0.85, -hd]}>
        <boxGeometry args={[hw / 2, wallHeight * 0.3, wallThickness]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.9} />
      </mesh>
    );
  }

  // South wall (+z)
  if (!hasDoor("south")) {
    segments.push(
      <mesh key="s" position={[0, wallHeight / 2, hd]}>
        <boxGeometry args={[hw * 2, wallHeight, wallThickness]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.9} />
      </mesh>
    );
  } else {
    segments.push(
      <mesh key="sl" position={[-hw / 2 - hw / 4, wallHeight / 2, hd]}>
        <boxGeometry args={[hw, wallHeight, wallThickness]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.9} />
      </mesh>,
      <mesh key="sr" position={[hw / 2 + hw / 4, wallHeight / 2, hd]}>
        <boxGeometry args={[hw, wallHeight, wallThickness]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.9} />
      </mesh>,
      <mesh key="st" position={[0, wallHeight * 0.85, hd]}>
        <boxGeometry args={[hw / 2, wallHeight * 0.3, wallThickness]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.9} />
      </mesh>
    );
  }

  // West wall (-x)
  if (!hasDoor("west")) {
    segments.push(
      <mesh key="w" position={[-hw, wallHeight / 2, 0]}>
        <boxGeometry args={[wallThickness, wallHeight, hd * 2]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.9} />
      </mesh>
    );
  } else {
    segments.push(
      <mesh key="wf" position={[-hw, wallHeight / 2, -hd / 2 - hd / 4]}>
        <boxGeometry args={[wallThickness, wallHeight, hd]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.9} />
      </mesh>,
      <mesh key="wb" position={[-hw, wallHeight / 2, hd / 2 + hd / 4]}>
        <boxGeometry args={[wallThickness, wallHeight, hd]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.9} />
      </mesh>,
      <mesh key="wt" position={[-hw, wallHeight * 0.85, 0]}>
        <boxGeometry args={[wallThickness, wallHeight * 0.3, hd / 2]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.9} />
      </mesh>
    );
  }

  // East wall (+x)
  if (!hasDoor("east")) {
    segments.push(
      <mesh key="e" position={[hw, wallHeight / 2, 0]}>
        <boxGeometry args={[wallThickness, wallHeight, hd * 2]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.9} />
      </mesh>
    );
  } else {
    segments.push(
      <mesh key="ef" position={[hw, wallHeight / 2, -hd / 2 - hd / 4]}>
        <boxGeometry args={[wallThickness, wallHeight, hd]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.9} />
      </mesh>,
      <mesh key="eb" position={[hw, wallHeight / 2, hd / 2 + hd / 4]}>
        <boxGeometry args={[wallThickness, wallHeight, hd]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.9} />
      </mesh>,
      <mesh key="et" position={[hw, wallHeight * 0.85, 0]}>
        <boxGeometry args={[wallThickness, wallHeight * 0.3, hd / 2]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.9} />
      </mesh>
    );
  }

  return <>{segments}</>;
}

// ─── Door marker (glowing arch) ──────────────────────────

function DoorMarker({
  position,
  wall,
}: {
  position: [number, number, number];
  wall: string;
}) {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.intensity = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.4;
    }
  });

  const rotation: [number, number, number] =
    wall === "north" || wall === "south" ? [0, 0, 0] : [0, Math.PI / 2, 0];

  return (
    <group position={position} rotation={rotation}>
      <pointLight ref={lightRef} position={[0, 1.5, 0]} color="#eab308" intensity={1} distance={5} />
      {/* Arch glow */}
      <mesh position={[0, 1.5, 0]}>
        <ringGeometry args={[1.2, 1.4, 16, 1, 0, Math.PI]} />
        <meshBasicMaterial color="#eab308" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── NPC figure ──────────────────────────────────────────

function NPCFigure({
  npc,
}: {
  npc: { name: string; position: [number, number, number]; robeColor: string; hostile: boolean };
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Idle sway
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={npc.position}>
      {/* Body */}
      <mesh position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.25, 1, 8, 16]} />
        <meshStandardMaterial color={npc.robeColor} roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#d4a574" roughness={0.6} />
      </mesh>
      {/* Hostile indicator */}
      {npc.hostile && (
        <pointLight position={[0, 2.2, 0]} color="#ff4444" intensity={0.5} distance={3} />
      )}
      {/* Name indicator glow */}
      <pointLight position={[0, 1, 0.5]} color={npc.hostile ? "#ff4444" : "#44aa44"} intensity={0.3} distance={2} />
    </group>
  );
}

// ─── First-person camera controller ──────────────────────

interface CameraControllerProps {
  playerPos: React.MutableRefObject<THREE.Vector3>;
  playerRot: React.MutableRefObject<number>;
  moveInput: React.MutableRefObject<{ forward: number; turn: number; sprint: boolean }>;
  onDoorEnter: (doorIndex: number) => void;
  currentRoom: RoomDef;
}

function CameraController({
  playerPos,
  playerRot,
  moveInput,
  onDoorEnter,
  currentRoom,
}: CameraControllerProps) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    const input = moveInput.current;

    // Dead-zone: ignore tiny residual values so character stops cleanly
    const fwd = Math.abs(input.forward) < 0.05 ? 0 : input.forward;
    const trn = Math.abs(input.turn) < 0.05 ? 0 : input.turn;

    if (fwd === 0 && trn === 0) {
      // No input — keep camera in sync but don't move
      camera.position.copy(playerPos.current);
      camera.rotation.set(0, playerRot.current, 0);
      return;
    }

    const speed = input.sprint ? 8 : 4;
    const turnSpeed = input.sprint ? 1.8 : 1.2;

    // Turn
    playerRot.current -= trn * turnSpeed * delta;

    // Move forward/backward
    const dx = Math.sin(playerRot.current) * fwd * speed * delta;
    const dz = Math.cos(playerRot.current) * fwd * speed * delta;

    const newX = playerPos.current.x + dx;
    const newZ = playerPos.current.z + dz;

    // Simple bounds check (stay within room)
    const [cx, , cz] = currentRoom.center;
    const [hw, , hd] = currentRoom.size;
    const margin = 0.8;

    const clampedX = Math.max(cx - hw + margin, Math.min(cx + hw - margin, newX));
    const clampedZ = Math.max(cz - hd + margin, Math.min(cz + hd - margin, newZ));

    playerPos.current.set(clampedX, 1.6, clampedZ);

    // Check door proximity
    for (let i = 0; i < currentRoom.doors.length; i++) {
      const door = currentRoom.doors[i];
      const doorWorld = [
        door.position[0] + cx,
        door.position[1],
        door.position[2] + cz,
      ];
      const dist = Math.sqrt(
        (playerPos.current.x - doorWorld[0]) ** 2 +
        (playerPos.current.z - doorWorld[2]) ** 2
      );
      if (dist < 2) {
        onDoorEnter(i);
        return;
      }
    }

    // Update camera
    camera.position.copy(playerPos.current);
    camera.rotation.set(0, playerRot.current, 0, "YXZ");
  });

  return null;
}

// ─── Main world component ────────────────────────────────

interface HogwartsWorldProps {
  currentRoom: RoomDef;
  moveInput: React.MutableRefObject<{ forward: number; turn: number; sprint: boolean }>;
  playerPos: React.MutableRefObject<THREE.Vector3>;
  playerRot: React.MutableRefObject<number>;
  onDoorEnter: (doorIndex: number) => void;
  /** Wand tip for first-person wand */
  wandTip: { x: number; y: number } | null;
  spellActive: boolean;
  spellColor: string;
  shieldActive: boolean;
  houseColor?: string;
}

function WorldInner({
  currentRoom,
  moveInput,
  playerPos,
  playerRot,
  onDoorEnter,
  wandTip,
  spellActive,
  spellColor,
  shieldActive,
  houseColor = "#740001",
}: HogwartsWorldProps) {
  return (
    <>
      <fog attach="fog" args={["#3a2a18", 20, 70]} />

      {/* Global hemisphere light for base visibility */}
      <hemisphereLight args={["#ffeedd", "#8a7a60", 1.8]} />

      {/* Render current room */}
      {currentRoom.id === "great-hall" ? <GreatHallScene /> : <RoomMesh room={currentRoom} />}

      {/* Camera controller */}
      <CameraController
        playerPos={playerPos}
        playerRot={playerRot}
        moveInput={moveInput}
        onDoorEnter={onDoorEnter}
        currentRoom={currentRoom}
      />

      {/* First-person wand */}
      <FirstPersonWandInner wandTip={wandTip} spellActive={spellActive} spellColor={spellColor} houseColor={houseColor} />

      {/* Shield */}
      {shieldActive && (
        <mesh position={[playerPos.current.x, 1.5, playerPos.current.z]}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshBasicMaterial color={houseColor} transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      )}
    </>
  );
}

// First-person wand rendered relative to camera
function FirstPersonWandInner({
  wandTip,
  spellActive,
  spellColor,
  houseColor = "#740001",
}: {
  wandTip: { x: number; y: number } | null;
  spellActive: boolean;
  spellColor: string;
  houseColor?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const smoothedRot = useRef({ x: 0, y: 0 });

  const targetRot = useMemo(() => {
    if (!wandTip) return { x: 0, y: 0 };
    return {
      x: -(wandTip.y - 0.5) * 0.8,
      y: -(wandTip.x - 0.5) * 0.6,
    };
  }, [wandTip]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Smooth rotation
    smoothedRot.current.x += (targetRot.x - smoothedRot.current.x) * 8 * delta;
    smoothedRot.current.y += (targetRot.y - smoothedRot.current.y) * 8 * delta;

    // Position wand relative to camera
    const offset = new THREE.Vector3(0.4, -0.3, -0.6);
    offset.applyQuaternion(camera.quaternion);
    groupRef.current.position.copy(camera.position).add(offset);
    groupRef.current.quaternion.copy(camera.quaternion);
    groupRef.current.rotateX(smoothedRot.current.x + 0.3);
    groupRef.current.rotateZ(smoothedRot.current.y + 0.3);
  });

  return (
    <group ref={groupRef}>
      {/* Wand shaft */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.012, 0.02, 0.5, 8]} />
        <meshStandardMaterial color="#4a3728" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.022, 0.026, 0.12, 8]} />
        <meshStandardMaterial color={houseColor} roughness={0.8} />
      </mesh>
      {/* Tip */}
      <mesh position={[0, 0.46, 0]}>
        <sphereGeometry args={[0.015, 12, 12]} />
        <meshStandardMaterial
          color={spellActive ? spellColor : "#8a7a6a"}
          emissive={spellActive ? spellColor : "#000000"}
          emissiveIntensity={spellActive ? 2 : 0}
        />
      </mesh>
      <pointLight
        position={[0, 0.5, 0]}
        color={spellActive ? spellColor : "#eab308"}
        intensity={spellActive ? 4 : 0.6}
        distance={4}
        decay={2}
      />
    </group>
  );
}

export default function HogwartsWorld(props: HogwartsWorldProps) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        gl={{ antialias: true, alpha: false }}
        style={{ background: "#0a0808" }}
      >
        <WorldInner {...props} />
      </Canvas>
    </div>
  );
}
