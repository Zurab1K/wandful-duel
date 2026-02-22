import { useRef, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface CharacterPreviewProps {
  robeColor: string;
  accentColor: string;
}

function SoldierModel({ robeColor, accentColor }: CharacterPreviewProps) {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useLoader(GLTFLoader, "/models/Soldier.glb");

  useEffect(() => {
    if (!gltf.scene) return;

    // Traverse the model and recolor clothing materials
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;

        if (material && material.isMeshStandardMaterial) {
          // Clone material so we don't mutate shared references
          const mat = material.clone();

          // The Soldier model has a few materials - color the main outfit
          // Check the original color to decide what to recolor
          const origColor = material.color;
          const r = origColor.r;
          const g = origColor.g;
          const b = origColor.b;

          // Dark/black materials → robe color (main outfit)
          if (r < 0.3 && g < 0.3 && b < 0.3) {
            mat.color.set(robeColor);
            mat.roughness = 0.8;
          }
          // Medium gray materials → accent
          else if (r > 0.3 && r < 0.7 && Math.abs(r - g) < 0.15 && Math.abs(r - b) < 0.15) {
            mat.color.set(accentColor);
            mat.roughness = 0.7;
          }
          // Skin-like materials → keep original
          // Everything else → slight tint

          mesh.material = mat;
        }
      }
    });
  }, [gltf, robeColor, accentColor]);

  // Gentle idle bob
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 1.2) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]} scale={1}>
      <primitive object={gltf.scene} />
    </group>
  );
}

function CharacterScene({ robeColor, accentColor }: CharacterPreviewProps) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} castShadow />
      <directionalLight position={[-2, 3, -2]} intensity={0.4} color="#aaccff" />
      <pointLight position={[0, 1, 2.5]} intensity={0.5} color="#ffeedd" />
      <pointLight position={[0, -0.5, -1]} intensity={0.2} color="#aaaacc" />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial color="#2a2520" roughness={0.95} />
      </mesh>

      <SoldierModel robeColor={robeColor} accentColor={accentColor} />

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
    <div
      className="w-full h-[340px] md:h-[420px] rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ background: "radial-gradient(ellipse at center, #1a1510 0%, #0a0808 100%)" }}
    >
      <Canvas
        camera={{ position: [0, 0.3, 2.5], fov: 40 }}
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
