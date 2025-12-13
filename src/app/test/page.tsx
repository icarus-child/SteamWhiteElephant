"use client";

import * as THREE from "three";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Environment, useGLTF, useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Vector3 } from "three";

export default function BoosterPack(props: ThreeElements["mesh"]) {
  const gltf = useGLTF("/wrapped-present/booster-pack.glb");
  const normalMap = useTexture("/wrapped-present/NormalMap.png");
  const meshRef = useRef<THREE.Mesh>(null!);
  const { pointer } = useThree();
  const target = new Vector3();

  useEffect(() => {
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          child.material.normalMap = normalMap;
          child.material.normalScale = new THREE.Vector2(1, 1);
          child.material.needsUpdate = true;
        }
      }
    });
  }, [gltf, normalMap]);

  useFrame(() => {
    const mesh = meshRef.current;

    const dist = mesh.position.distanceTo({
      x: pointer.x,
      y: pointer.y,
      z: 0.5,
    });
    const influenceRadius = 0.7;

    if (dist < influenceRadius) {
      target.set(pointer.x, pointer.y, 0.8);
    } else {
      target.set(0, 0, 0);
    }

    const lookVector = target.clone().sub(mesh.position);
    const targetRotationY = Math.atan2(lookVector.x, lookVector.z);
    const targetRotationX = Math.atan2(lookVector.y, lookVector.z);
    mesh.rotation.y += (targetRotationY - mesh.rotation.y) * 0.1;
    mesh.rotation.x += (targetRotationX * 0.4 - mesh.rotation.x) * 0.1;
  });

  return (
    <mesh {...props} ref={meshRef}>
      <primitive object={gltf.scene} args={[1, 1, 1]} />
    </mesh>
  );
}

function Page() {
  const rotation = new THREE.Euler(0, Math.PI * 1.0, 0);
  return (
    <div className="h-screen w-screen">
      <Canvas camera={{ position: [0, 0, -10] }} orthographic={false}>
        <BoosterPack />
        <Environment
          files="/wrapped-present/christmas_photo_studio_01_2k.exr"
          background
          environmentRotation={rotation}
          backgroundRotation={rotation}
        />
      </Canvas>
    </div>
  );
}
