"use client";

import Draggable from "@/app/components/Draggable";
import Present from "@/app/components/Present";
import WrappedPresent from "@/app/components/WrappedPresent";
import { useGameState } from "./gamestate";
import { RoomPlayer } from "@/types/player";
import { redirect, useParams } from "next/navigation";
import { useState } from "react";

type ClientGameProps = {
  player: RoomPlayer;
};

export default function ClientGame({ player }: ClientGameProps) {
  const roomId = useParams().id as string;
  if (roomId != player.room) redirect(`/${player.room}`);

  const [players, presents] = useGameState(
    () => `ws://${window.location.host}/${player.room}/ws`,
    player,
  );

  const [selected, setSelected] = useState<number>(0);

  const playerElements = players?.map((player, i) => {
    return (
      <Present
        player={player}
        selected={i == selected}
        key={i}
        className="bg-[#88B799]"
      />
    );
  });

  const presentElements = presents?.map((present, i) => {
    return (
      <WrappedPresent key={i} className="bg-[#B8B799]" present={present} />
    );
  });

  return (
    <div className="h-screen">
      <Draggable className="justify-center overflow-x-scroll overflow-hidden flex flex-row items-center hide-scrollbar p-5 cursor-grab h-2/5">
        {presentElements}
      </Draggable>
      <Draggable
        snap={true}
        className="overflow-x-scroll overflow-hidden flex flex-row hide-scrollbar cursor-grab h-3/5"
      >
        {playerElements}
      </Draggable>
    </div>
  );
}
