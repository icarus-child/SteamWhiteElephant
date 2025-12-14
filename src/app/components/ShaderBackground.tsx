"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./shaders/balatro";

export default function ShaderBackground() {
  const material = useRef<THREE.ShaderMaterial>(null);
  const time = useRef(0);
  const { size } = useThree();

  useFrame((state) => {
    if (material.current) {
      material.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={`void main(){gl_Position=vec4(position,1.0);}`}
        fragmentShader={`
          precision highp float;
          uniform float uTime;
          void main(){
            gl_FragColor = vec4(0.5 + 0.5*sin(uTime),0.0,0.0,1.0);
          }
        `}
        uniforms={{ uTime: { value: 0 } }}
        depthTest={false}
      />
    </mesh>
  );
}
