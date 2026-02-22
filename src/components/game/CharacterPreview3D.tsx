import { useRef, useEffect, useMemo } from "react";
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
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const gltf = useLoader(GLTFLoader, "/models/Soldier.glb");

  // Set up animation mixer and play idle animation
  useEffect(() => {
    if (!gltf.scene || !gltf.animations.length) return;

    const mixer = new THREE.AnimationMixer(gltf.scene);
    mixerRef.current = mixer;

    // Find an idle animation, or use the first one
    const idleClip =
      gltf.animations.find((a) => /idle/i.test(a.name)) ||
      gltf.animations[0];

    if (idleClip) {
      const action = mixer.clipAction(idleClip);
      action.play();
    }

    return () => {
      mixer.stopAllAction();
    };
  }, [gltf]);

  // Recolor materials based on house
  useEffect(() => {
    if (!gltf.scene) return;

    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

        materials.forEach((material, idx) => {
          if (material && (material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
            const mat = material.clone() as THREE.MeshStandardMaterial;
            const r = mat.color.r;
            const g = mat.color.g;
            const b = mat.color.b;

            // Dark materials → robe color
            if (r < 0.3 && g < 0.3 && b < 0.3) {
              mat.color.set(robeColor);
              mat.roughness = 0.8;
            }
            // Medium gray → accent
            else if (r > 0.3 && r < 0.7 && Math.abs(r - g) < 0.15 && Math.abs(r - b) < 0.15) {
              mat.color.set(accentColor);
              mat.roughness = 0.7;
            }

            if (Array.isArray(mesh.material)) {
              mesh.material[idx] = mat;
            } else {
              mesh.material = mat;
            }
          }
        });
      }
    });
  }, [gltf, robeColor, accentColor]);

  // Update animation mixer + gentle bob
  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
    if (groupRef.current) {
      groupRef.current.position.y = -0.92 + Math.sin(Date.now() * 0.0012) * 0.01;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.92, 0]} scale={0.5}>
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.92, 0]} receiveShadow>
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial color="#2a2520" roughness={0.95} />
      </mesh>

      <SoldierModel robeColor={robeColor} accentColor={accentColor} />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI * 0.3}
        maxPolarAngle={Math.PI * 0.6}
        target={[0, 0.0, 0]}
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
        camera={{ position: [0, 0.1, 2.8], fov: 38 }}
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
