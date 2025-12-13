"use client";

import { CameraControls, View } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

function TestView({ color }: { color: string }) {
  return (
    <View style={{ width: "100%", height: "400px" }}>
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshPhongMaterial />
      </mesh>
      <ambientLight intensity={1} />
      <directionalLight position={[0, 2, 5]} color={color} />
      <CameraControls />
    </View>
  );
}

const colors = ["red", "blue", "orange"];

const element = colors.map((v, i) => {
  return <TestView color={v} key={i} />;
});

export default function Page() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <h1>Html content here</h1>
      {element}
      <div className="fixed w-screen h-screen">
        <Canvas className="absolute w-full h-screen">
          <View.Port />
        </Canvas>
      </div>
    </div>
  );
}
