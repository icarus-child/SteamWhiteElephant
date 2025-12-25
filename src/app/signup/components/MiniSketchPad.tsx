import * as THREE from "three";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Environment, useGLTF } from "@react-three/drei";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { isFirefox } from "react-device-detect";
import { Canvas } from "@react-three/fiber";
import BoosterPack from "@/app/components/BoosterPack";
import Input from "@/app/components/Input";

type MiniSketchPadProps = {
  onTextureChange: (blob: Blob) => void;
  onGiftNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function MiniSketchPad({
  onTextureChange,
  onGiftNameChange,
}: MiniSketchPadProps) {
  const [selectedWrap, setSelectedWrap] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [giftName, setGiftName] = useState<string>("Custom Name");
  const [color, setColor] = useState("#6699ff");
  const [mode, setMode] = useState<"pen" | "eraser">("pen");
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const foregroundImageRef = useRef<HTMLImageElement | null>(null);
  const rasterCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  const wraps: WrappingPaper[] = [
    { name: "Scuffed", color: "#A4CFC6" },
    { name: "Retro", color: "#795493" },
    { name: "Pixel", color: "#243A5E" },
    { name: "Artdeco", color: "#F5F3EA" },
  ];

  function handleGiftNameChange(event: ChangeEvent<HTMLInputElement>) {
    onGiftNameChange(event);
    setGiftName(event.target.value);
  }

  type WrappingPaper = {
    name: string;
    color: string;
  };

  function WrappingButton({
    color,
    selected,
    index,
  }: {
    color: string;
    selected: boolean;
    index: number;
  }) {
    return (
      <button
        className={`w-10 aspect-square  rounded-lg ${selected ? "border-4 border-white" : ""}`}
        style={{ backgroundColor: color }}
        type="button"
        onClick={() => setSelectedWrap(index)}
      />
    );
  }

  useEffect(() => {
    const bgImg = new window.Image();
    bgImg.src = `/wrapped-present/${wraps[selectedWrap].name}_Albedo_Background.png`;

    const fgImg = new window.Image();
    fgImg.src = `/wrapped-present/${wraps[selectedWrap].name}_Albedo_Foreground.png`;

    bgImg.onload = () => {
      backgroundImageRef.current = bgImg;
      syncSketchToTexture();
    };

    fgImg.onload = () => {
      foregroundImageRef.current = fgImg;
      syncSketchToTexture();
    };
  }, [selectedWrap]);

  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 1024;
    rasterCanvasRef.current = c;

    const t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;

    t.repeat.set(1, -1);
    t.center.set(0.5, 0.5);

    textureRef.current = t;
  }, []);

  const gltf = useGLTF("/wrapped-present/booster-pack.glb");
  const model = useMemo(() => {
    return gltf.scene.clone(true);
  }, [gltf.scene]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isFirefox) return;
      document
        .querySelectorAll('[id^="react-sketch-canvas__stroke-group"]')
        .forEach((el) => el.removeAttribute("mask"));
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  async function syncSketchToTexture() {
    if (!canvasRef.current || !rasterCanvasRef.current) return;

    const svg = await canvasRef.current.exportSvg();
    const ctx = rasterCanvasRef.current.getContext("2d")!;

    const img = new Image();
    img.onload = () => {
      if (
        !backgroundImageRef.current ||
        !foregroundImageRef.current ||
        !textureRef.current
      )
        return;
      const modelCanvasSize = 1024;
      const drawingCenter = {
        x: 820,
        y: 720,
      };
      const drawingCanvasPosition = {
        x: drawingCenter.x - modelCanvasSize / 2,
        y: drawingCenter.y - modelCanvasSize / 2,
      };
      const drawingCanvasSize = { x: 400, y: 600 };
      const padding = 1;

      ctx.clearRect(
        0,
        0,
        rasterCanvasRef.current?.width ?? 0,
        rasterCanvasRef.current?.height ?? 0,
      );
      ctx.drawImage(
        backgroundImageRef.current,
        0,
        0,
        modelCanvasSize,
        modelCanvasSize,
      );
      ctx.drawImage(
        img,
        padding + drawingCanvasPosition.x,
        padding + drawingCanvasPosition.y,
        drawingCanvasSize.x - 2 * padding,
        drawingCanvasSize.y - 2 * padding,
      );
      ctx.drawImage(
        foregroundImageRef.current,
        0,
        0,
        modelCanvasSize,
        modelCanvasSize,
      );
      textureRef.current.needsUpdate = true;

      rasterCanvasRef.current?.toBlob((blob: any) => {
        if (blob) onTextureChange(blob);
      }, "image/png");
    };

    img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  return (
    <>
      <div className="flex flex-col gap-2 w-fit">
        <div className="flex items-center gap-2 bg-zinc-100 p-2 rounded-lg">
          <button
            onClick={() => {
              setMode("pen");
              canvasRef.current?.eraseMode(false);
            }}
            className={`px-2 py-1 rounded ${
              mode === "pen" ? "bg-zinc-800 text-white" : "bg-white text-black"
            }`}
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"></path>
              <path d="M13.5 6.5l4 4"></path>
            </svg>
          </button>

          <button
            onClick={() => {
              setMode("eraser");
              canvasRef.current?.eraseMode(true);
            }}
            className={`px-2 py-1 rounded ${
              mode === "eraser"
                ? "bg-zinc-800 text-white"
                : "bg-white text-black"
            }`}
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 20h-10.5l-4.21 -4.3a1 1 0 0 1 0 -1.41l10 -10a1 1 0 0 1 1.41 0l5 5a1 1 0 0 1 0 1.41l-9.2 9.3"></path>
              <path d="M18 13.3l-6.3 -6.3"></path>
            </svg>
          </button>

          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 p-0 border rounded"
          />

          <button
            onClick={() => canvasRef.current?.undo()}
            className="px-2 py-1 rounded bg-white text-black active:bg-black active:text-white"
            type="button"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 14l-4-4 4-4" />
              <path d="M5 10h7a5 5 0 1 1 0 10" />
            </svg>
          </button>

          <button
            onClick={() => canvasRef.current?.redo()}
            className="px-2 py-1 rounded bg-white text-black active:bg-black active:text-white"
            type="button"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 14l4-4-4-4" />
              <path d="M19 10h-7a5 5 0 1 0 0 10" />
            </svg>
          </button>
        </div>

        <ReactSketchCanvas
          className="bg-[#ececec]"
          ref={canvasRef}
          canvasColor="transparent"
          strokeWidth={8}
          eraserWidth={14}
          strokeColor={color}
          allowOnlyPointerType="all"
          withTimestamp
          onChange={() => syncSketchToTexture()}
        />
      </div>
      <div className="max-w-[20em] ml-10 w-full">
        <Input
          id="gift-name"
          name="giftName"
          type="text"
          placeholder="Custom Name"
          onChange={handleGiftNameChange}
          form="text"
          className="h-fit"
        />
        <div className="flex flex-row p-5 gap-3">
          {wraps.map((w, i) => {
            return (
              <WrappingButton
                color={w.color}
                key={i}
                index={i}
                selected={selectedWrap === i}
              />
            );
          })}
        </div>
      </div>
      <div className="grow" />
      <div
        className="h-full w-80"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <h1
          className="place-self-center text-white font-inter font-bold text-xl mt-5 text-center"
          style={{ textShadow: "10px 10px 10px #11111144" }}
        >
          {giftName.length ? giftName : "Custom Name"}
        </h1>
        <Canvas
          camera={{ position: [0, 0, -2], scale: [0.011, 0.011, 0.02] }}
          orthographic={true}
        >
          <Environment
            files="/wrapped-present/christmas_photo_studio_01_2k.exr"
            environmentRotation={[0, Math.PI, 0]}
          />
          <BoosterPack
            isHovered={isHovered}
            model={model}
            albedo={textureRef.current}
          />
        </Canvas>
      </div>
    </>
  );
}
