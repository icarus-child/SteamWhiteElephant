"use client";

import Draggable from "@/app/components/Draggable";
import Present from "@/app/components/Present";
import WrappedPresent from "@/app/components/WrappedPresent";
import { useGameState } from "./gamestate";
import { RoomPlayer } from "@/types/player";
import { redirect, useParams } from "next/navigation";
import { Present as PresentType } from "@/types/present";

type ClientGameProps = {
  player: RoomPlayer;
};

export default function ClientGame({ player }: ClientGameProps) {
  const roomId = useParams().id as string;
  if (roomId != player.room) redirect(`/${player.room}`);

  const [players, presents, turnIndex, takePresent] = useGameState(
    () => `ws://${window.location.host}/${player.room}/ws`,
    player,
  );

  const playerElements = players?.map((player, i) => {
    return (
      <Present
        player={player}
        selected={i == turnIndex}
        key={i}
        className="bg-[#88B799]"
        onClick={
          player.present
            ? () => takePresent((player.present as PresentType).gifterId)
            : () => {}
        }
      />
    );
  });

  const presentElements = presents?.map((present, i) => {
    console.log(`players length: ${players.length}, index: ${turnIndex}`);
    console.log(
      `player turn's id: ${players[turnIndex].id}, my id: ${player.id}`,
    );
    if (players[turnIndex].id == player.id) {
      console.log("my turn");
    } else console.log("not my turn");
    return (
      <WrappedPresent
        key={i}
        className="bg-[#B8B799]"
        isMyTurn={players[turnIndex].id == player.id}
        present={present}
        onClickAction={() => {
          takePresent(present.gifterId);
        }}
      />
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
