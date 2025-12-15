"use client";

import * as THREE from "three";
import { useFrame, ThreeElements } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { useTexture } from "@react-three/drei";

type BoosterPackProps = {
  model: any;
  isHovered: boolean;
  extra?: ThreeElements["mesh"];
};

export default function BoosterPack({
  model,
  extra,
  isHovered,
}: BoosterPackProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { pointer } = useThree();
  const target = new Vector3();
  const normalMap = useTexture("/wrapped-present/NormalMap.png");

  useEffect(() => {
    model.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          child.material.normalMap = normalMap;
          child.material.normalScale = new THREE.Vector2(1, 1);
          child.material.needsUpdate = true;
        }
      }
    });
  }, [model, normalMap]);

  useFrame(() => {
    const mesh = meshRef.current;

    if (isHovered) {
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

  return <primitive {...extra} ref={meshRef} object={model} />;
}
