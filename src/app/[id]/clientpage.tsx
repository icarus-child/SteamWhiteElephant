"use client";

import * as THREE from "three";
import Draggable from "@/app/components/Draggable";
import Present from "@/app/components/Present";
import WrappedPresent from "@/app/components/WrappedPresent";
import { useGameState } from "./gamestate";
import { RoomPlayer } from "@/types/player";
import { redirect, useParams } from "next/navigation";
import { Present as PresentType } from "@/types/present";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import PostGame from "./postgame";
import Lobby from "./lobby";
import { Canvas } from "@react-three/fiber";
import { useGLTF, View } from "@react-three/drei";
import WebGLBackground from "../components/WebGLBackground";
import { preload } from "react-dom";

function deepCloneModel(source: THREE.Object3D) {
  const clone = source.clone(true);

  clone.traverse((child: any) => {
    if (child.isMesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material = child.material.map((m: any) => m.clone());
      } else {
        child.material = child.material.clone();
      }
    }
  });

  return clone;
}

function useModelPool(source: THREE.Object3D, count: number) {
  const pool = useRef<THREE.Object3D[]>([]);

  useMemo(() => {
    while (pool.current.length < count) {
      pool.current.push(deepCloneModel(source));
    }
  }, [count, source]);

  useMemo(() => {
    pool.current.length = count;
  }, [count]);

  return pool.current;
}

export async function blobToThreeTexture(blob: Blob): Promise<THREE.Texture> {
  const bitmap = await createImageBitmap(blob);

  const texture = new THREE.Texture(bitmap);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

function usePresentTextures(
  presents: PresentType[],
): Map<string, THREE.Texture> {
  const [textures, setTextures] = useState<Map<string, THREE.Texture>>(
    new Map(),
  );

  useEffect(() => {
    let cancelled = false;

    async function loadTextures() {
      const entries = await Promise.all(
        presents.map(async (p) => {
          if (textures.has(p.gifterId)) return null;

          const res = await fetch("/api/texture?id=" + p.gifterId, {
            method: "GET",
          });
          const blob = await res.blob();
          const tex = await blobToThreeTexture(blob);
          return [p.gifterId, tex] as const;
        }),
      );

      if (cancelled) return;

      setTextures((prev) => {
        const next = new Map(prev);
        for (const e of entries) {
          if (e) next.set(e[0], e[1]);
        }
        return next;
      });
    }

    loadTextures();
    return () => {
      cancelled = true;
    };
  }, [presents]);

  return textures;
}

type ClientGameProps = {
  player: RoomPlayer;
};

export default function ClientGame({ player }: ClientGameProps) {
  const roomId = useParams().id as string;
  if (roomId != player.room) redirect(`/${player.room}`);

  const gltf = useGLTF("/wrapped-present/booster-pack.glb");

  const [scrollEventPresents, setScrollEventPresents] = useState<
    WheelEvent | undefined
  >(undefined);

  const [players, presents, turnIndex, takePresent, isStarted, startGame] =
    useGameState(
      () => `ws://${window.location.host}/${player.room}/ws`,
      player,
    );
  const textures = usePresentTextures(presents);
  const models = useModelPool(gltf.scene, presents.length);
  useEffect(() => {
    for (const p of presents) {
      preload(
        `https://cdn.cloudflare.steamstatic.com/steam/apps/${p.items[0].gameId}/library_600x900_2x.jpg`,
        { as: "image" },
      );
    }
  });
  const container = useRef<HTMLDivElement>(null);
  const claimedPresents = useMemo(() => {
    return players
      .map((p) => p.present?.gifterId)
      .filter((e) => {
        return e !== undefined;
      });
  }, [players]);

  const presentElements = useMemo(() => {
    return presents?.map((present, i) => {
      if (!claimedPresents.includes(present.gifterId)) {
        return (
          <WrappedPresent
            key={i}
            isMyTurn={players[turnIndex].id == player.id}
            playerId={player.id}
            present={present}
            onClickAction={() => {
              takePresent(present.gifterId);
            }}
            model={models[i]}
            texture={textures.get(present.gifterId)}
            captureScrollAction={setScrollEventPresents}
          />
        );
      }
    });
  }, [presents, textures]);

  const playerElements = useMemo(() => {
    return players?.map((presentPlayer, i) => {
      return (
        <Present
          player={presentPlayer}
          localPlayer={player}
          isMyTurn={players[turnIndex].id == player.id}
          selected={i == turnIndex}
          key={i}
          onClickAction={() =>
            takePresent((presentPlayer.present as PresentType).gifterId)
          }
        />
      );
    });
  }, [players]);

  if (claimedPresents.length === presents.length) {
    return (
      <PostGame
        player={player}
        players={players}
        models={models}
        textures={textures}
      />
    );
  }

  if (!isStarted) {
    return (
      <Lobby
        player={player}
        players={players}
        startGameAction={() => startGame(player)}
      />
    );
  }

  return (
    <div className="h-screen w-screen" ref={container}>
      <Draggable
        className="overflow-x-scroll overflow-hidden flex flex-row hide-scrollbar p-5 cursor-grab h-2/5"
        scrollEvent={scrollEventPresents}
      >
        {presentElements}
      </Draggable>
      <Draggable
        snap={true}
        className="overflow-x-scroll overflow-hidden flex flex-row hide-scrollbar cursor-grab h-3/5"
      >
        {playerElements}
      </Draggable>
      <WebGLBackground
        outer={{ r: 0.761, g: 0.396, b: 0.443, a: 1 }}
        middle={{ r: 0.361, g: 0.188, b: 0.212, a: 1.0 }}
        inner={{ r: 0.561, g: 0.29, b: 0.325, a: 1.0 }}
      />
      <div className="fixed h-screen w-screen top-0 left-0 pointer-events-none">
        <Canvas
          eventSource={container as RefObject<HTMLDivElement>}
          camera={{ position: [0, 0, -2], scale: [0.013, 0.013, 0.02] }}
          orthographic={true}
        >
          <View.Port />
        </Canvas>
      </div>
    </div>
  );
}
