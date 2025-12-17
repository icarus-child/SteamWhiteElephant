"use client";

import * as THREE from "three";
import Draggable from "@/app/components/Draggable";
import Present from "@/app/components/Present";
import WrappedPresent from "@/app/components/WrappedPresent";
import { useGameState } from "./gamestate";
import { RoomPlayer } from "@/types/player";
import { redirect, useParams } from "next/navigation";
import { Present as PresentType } from "@/types/present";
import { RefObject, useMemo, useRef, useState } from "react";
import PostGame from "./postgame";
import Lobby from "./lobby";
import { Canvas } from "@react-three/fiber";
import { useGLTF, View } from "@react-three/drei";
import WebGLBackground from "../components/WebGLBackground";

function useModelPool(source: THREE.Object3D, count: number) {
  const pool = useRef<THREE.Object3D[]>([]);

  useMemo(() => {
    while (pool.current.length < count) {
      pool.current.push(source.clone(true));
    }
  }, [count, source]);

  useMemo(() => {
    pool.current.length = count;
  }, [count]);

  return pool.current;
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
  const models = useModelPool(gltf.scene, presents.length);
  const container = useRef<HTMLDivElement>(null);
  const claimedPresents = useMemo(() => {
    return players
      .map((p) => p.present?.gifterId)
      .filter((e) => {
        return e !== undefined;
      });
  }, [players]);

  // if (!isStarted) {
  //   return (
  //     <Lobby
  //       player={player}
  //       players={players}
  //       startGameAction={() => {
  //         startGame(player);
  //       }}
  //     />
  //   );
  // }

  if (claimedPresents.length === presents.length) {
    return <PostGame player={player} players={players} />;
  }

  const presentElements = presents?.map((present, i) => {
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
          captureScrollAction={setScrollEventPresents}
        />
      );
    }
  });

  const playerElements = players?.map((presentPlayer, i) => {
    const index = players.findIndex((p) => {
      return presentPlayer.present?.gifterId === p.id;
    });
    return (
      <Present
        model={models[index]}
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
      <WebGLBackground />
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
