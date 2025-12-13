"use client";

import * as THREE from "three";
import Draggable from "@/app/components/Draggable";
import Present from "@/app/components/Present";
import WrappedPresent from "@/app/components/WrappedPresent";
import { useGameState } from "./gamestate";
import { RoomPlayer } from "@/types/player";
import { redirect, useParams } from "next/navigation";
import { Present as PresentType } from "@/types/present";
import { RefObject, useMemo, useRef } from "react";
import PostGame from "./postgame";
import Lobby from "./lobby";
import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera, View } from "@react-three/drei";
import BoosterPack from "../test/page";

type ClientGameProps = {
  player: RoomPlayer;
};

export default function ClientGame({ player }: ClientGameProps) {
  const roomId = useParams().id as string;
  if (roomId != player.room) redirect(`/${player.room}`);

  const [players, presents, turnIndex, takePresent, isStarted, startGame] =
    useGameState(
      () => `ws://${window.location.host}/${player.room}/ws`,
      player,
    );

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
        />
      );
    }
  });

  const playerElements = players?.map((presentPlayer, i) => {
    return (
      <Present
        player={presentPlayer}
        localPlayer={player}
        isMyTurn={players[turnIndex].id == player.id}
        selected={i == turnIndex}
        key={i}
        className="bg-[#88B799]"
        onClickAction={() =>
          takePresent((presentPlayer.present as PresentType).gifterId)
        }
      />
    );
  });

  return (
    <div className="h-screen w-screen" ref={container}>
      <Draggable className="justify-center overflow-x-scroll overflow-hidden flex flex-row items-center hide-scrollbar p-5 cursor-grab h-2/5">
        {presentElements}
      </Draggable>
      <Draggable
        snap={true}
        className="overflow-x-scroll overflow-hidden flex flex-row hide-scrollbar cursor-grab h-3/5"
      >
        {playerElements}
      </Draggable>

      <div className="fixed h-screen w-screen top-0 left-0">
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
