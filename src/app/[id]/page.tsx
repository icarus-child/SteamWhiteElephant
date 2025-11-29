"use client";

import Draggable from "@/app/components/Draggable";
import Present from "@/app/components/Present";
import WrappedPresent from "@/app/components/WrappedPresent";
import { useParams } from "next/navigation";
import { usePlayers, usePresents } from "./gamestate";

export default function Home() {
  const roomId = useParams().id as string;
  const [players] = usePlayers(
    () => `ws://${window.location.host}/${roomId}/ws`,
  );
  const [presents] = usePresents(
    () => `ws://${window.location.host}/${roomId}/ws`,
  );

  const playerElements = players?.map((player, i) => {
    return <Present name={player.name} key={i} className="bg-[#B8B799]" />;
  });

  const presentElements = presents?.map((present, i) => {
    return <WrappedPresent key={i} className="bg-[#B8B799]" />;
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
