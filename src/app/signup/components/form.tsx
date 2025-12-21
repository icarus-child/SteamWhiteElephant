"use client";

import * as THREE from "three";
import { signup } from "@/actions/auth";
import { GetSteamGameName, ParseGameId } from "@/actions/steam";
import {
  ChangeEvent,
  FormEvent,
  JSX,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Button from "@/app/components/Button";
import { RoomExists } from "@/db/room";
import { Environment, useGLTF } from "@react-three/drei";
import Input from "@/app/components/Input";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { isFirefox } from "react-device-detect";
import { Canvas } from "@react-three/fiber";
import BoosterPack from "@/app/components/BoosterPack";

useGLTF.preload("/wrapped-present/booster-pack.glb");

function Errors(errors: string[]): JSX.Element[] {
  const rows = [];
  for (let i = 0; i < errors.length; i++) {
    rows.push(
      <p className="block" key={i}>
        {errors[i]}
      </p>,
    );
  }
  return rows;
}

type MiniSketchPadProps = {
  onTextureChange: (blob: Blob) => void;
};

function MiniSketchPad({ onTextureChange }: MiniSketchPadProps) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  // const baseTexture = useTexture("/wrapped-present/Albedo.png");

  const [color, setColor] = useState("#6699ff");
  const [mode, setMode] = useState<"pen" | "eraser">("pen");
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const foregroundImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const bgImg = new window.Image();
    bgImg.src = "/wrapped-present/AlbedoBackground.png";

    const fgImg = new window.Image();
    fgImg.src = "/wrapped-present/AlbedoForeground.png";

    bgImg.onload = () => {
      backgroundImageRef.current = bgImg;
      syncSketchToTexture();
    };

    fgImg.onload = () => {
      foregroundImageRef.current = fgImg;
      syncSketchToTexture();
    };
  }, []);

  const rasterCanvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 1024;
    return c;
  }, []);

  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(rasterCanvas);
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;

    // Crop to region: for example, middle half of texture
    t.repeat.set(1, -1); // scale in U and V
    // t.offset.set(0, 0); // shift in U and V

    // Rotate 90° clockwise around center
    t.center.set(0.5, 0.5); // rotation pivot = center

    return t;
  }, [rasterCanvas]);

  const gltf = useGLTF("/wrapped-present/booster-pack.glb");
  const model = useMemo(() => {
    return gltf.scene;
  }, []);

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
    if (!canvasRef.current) return;

    const svg = await canvasRef.current.exportSvg();
    const ctx = rasterCanvas.getContext("2d")!;

    const img = new Image();
    img.onload = () => {
      if (!backgroundImageRef.current || !foregroundImageRef.current) return;
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
      const padding = 1; // leave 1px transparent around edges

      // When drawing, offset strokes by padding
      ctx.clearRect(0, 0, rasterCanvas.width, rasterCanvas.height);
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
      // ctx.drawImage(img, 0, 0, rasterCanvas.width, rasterCanvas.height);
      texture.needsUpdate = true;

      // EXPORT IMAGE FOR FORM
      rasterCanvas.toBlob((blob) => {
        if (blob) onTextureChange(blob);
      }, "image/png");
    };

    img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  return (
    <>
      <div className="flex flex-col gap-2 w-fit">
        {/* Toolbar */}
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

        {/* Canvas */}
        <ReactSketchCanvas
          className="bg-[#ececec]"
          ref={canvasRef}
          canvasColor="transparent"
          strokeWidth={8}
          eraserWidth={14}
          strokeColor={color}
          allowOnlyPointerType="all"
          withTimestamp
          // onStroke={() => syncSketchToTexture()}
          onChange={() => syncSketchToTexture()}
        />
      </div>
      <div className="grow" />
      <div
        className="h-full w-80"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Canvas
          camera={{ position: [0, 0, -2], scale: [0.013, 0.013, 0.02] }}
          orthographic={true}
        >
          <Environment
            files="/wrapped-present/christmas_photo_studio_01_2k.exr"
            environmentRotation={[0, Math.PI, 0]}
          />
          <BoosterPack isHovered={isHovered} model={model} albedo={texture} />
        </Canvas>
      </div>
    </>
  );
}

export type Inputs = {
  name: string | null;
  room: string | null;
  games: string[];
  texture: Blob | null;
};

export default function Form() {
  const [inputs, setInputs] = useState<Inputs>({
    name: null,
    room: "game",
    games: [],
    texture: null,
  });
  const [pending, setPending] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [gameName, setGameName] = useState<string>("Type above");
  const [submitButton, setSubmitButton] = useState<string>(
    "Create or Join Room",
  );
  let timerId: number | undefined = undefined;

  const fetchGameName = async (gameIdRaw: string) => {
    const gameId = await ParseGameId(gameIdRaw);
    if (gameId == null) {
      setGameName("Invalid Input");
      return;
    }
    const gameName = await GetSteamGameName(gameId);
    if (gameName == null || gameName == "") {
      setGameName("Game not found");
      return;
    }
    setGameName(gameName);
  };

  const checkRoomAvailability = async (roomId: string) => {
    const exists = await RoomExists(roomId);
    setSubmitButton(exists ? "Join Room" : "Create Room");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    setErrors(await signup(inputs));
    setPending(false);
  };

  const handleGameIdChange = async (event: ChangeEvent<HTMLInputElement>) => {
    // const inputid = Number(event.target.name);
    const value = event.target.value;
    const { games, ...rest } = inputs;
    // games[inputid] = value;
    games[0] = value;
    setInputs({ ...rest, games });
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      if (event.target.value == "") {
        setGameName("Game not found");
      }
      fetchGameName(event.target.value);
    }, 500) as unknown as number;
  };

  const handleRoomIdChange = async (event: ChangeEvent<HTMLInputElement>) => {
    handleChange(event);
    checkRoomAvailability(event.target.value);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs({ ...inputs, [name]: value });
  };

  return (
    <form
      id="signup"
      className="px-20 w-full max-w-[80em]"
      onSubmit={handleSubmit}
    >
      <div className="flex lg:flex-row lg:gap-5 gap-10 lg:place-items-start place-items-center flex-col min-h-[18em]">
        <div className="w-[30em] flex flex-col place-items-center">
          <h2 className="font-inknut font-semibold text-3xl text-white pb-1">
            New Gifter
          </h2>
          <p className="text-white font-inter pb-6">
            Enter your player name and room ID
          </p>
          <Input
            id="inline-name"
            name="name"
            placeholder="Player Name"
            onChange={handleChange}
            type="text"
            className="mb-4"
          />
          <Input
            id="inline-room"
            name="room"
            placeholder="Room ID"
            onChange={handleRoomIdChange}
            type="text"
            className="mb-4"
            hidden={true}
          />
          <Button className="mb-6">{submitButton}</Button>
          <div className={`${pending ? "" : "hidden"}`}>
            <div className="font-bold">Loading...</div>
          </div>
          <div className={`${pending ? "hidden" : ""}`}>
            <div
              id="error"
              className="text-white italic font-medium text-center"
            >
              {Errors(errors)}
            </div>
          </div>
        </div>
        <div className="grow" />
        <div className="w-[30em] flex flex-col place-items-center justify-items-end">
          <h2 className="font-inknut font-semibold text-3xl text-white pb-1">
            Steam Gift
          </h2>
          <p className="text-white font-inter pb-6">
            Copy the Steam Game URL or ID into the field below
          </p>
          <Input
            id="game"
            name="game"
            type="text"
            placeholder="https://store.steam..."
            onChange={handleGameIdChange}
            form="text"
            className="mb-4"
          />
          <span
            id="game-name"
            className="text-white font-inter place-self-start"
          >
            {gameName}
          </span>
        </div>
      </div>
      <h2 className="font-inknut font-semibold text-3xl text-white pb-10">
        Wrapping Paper
      </h2>
      <div className="flex flex-row w-full h-[30em]">
        <MiniSketchPad
          onTextureChange={(b: Blob) => {
            setInputs({ ...inputs, ["texture"]: b });
          }}
        />
      </div>
    </form>
  );
}
