"use client";

import Draggable from "@/app/components/Draggable";
import Present from "@/app/components/Present";
import WrappedPresent from "@/app/components/WrappedPresent";
import { Player } from "@/types/player";
import { Present as PresentType } from "@/types/present";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { socket } from "./socket";

export default function Home() {
  const [_1, setIsConnected] = useState<boolean>(false);
  const [_2, setTransport] = useState<string>("N/A");
  const [players, setPlayers] = useState<Player[]>([]);
  const [presents, setPresents] = useState<PresentType[]>([]);

  const roomId = useParams().id as string;

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
      console.log("roomid: " + roomId);
      socket.emit("room", roomId);
      console.time("request players");

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    function onUpdatePlayers(eventPlayers: Player[]) {
      if (!eventPlayers) return;
      console.timeEnd("request players");
      console.time("parse players");
      setPlayers(eventPlayers);
      console.timeEnd("parse players");
    }

    function onUpdatePresents(eventPresents: PresentType[]) {
      if (!eventPresents) return;
      setPresents(eventPresents);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("players", onUpdatePlayers);
    socket.on("presents", onUpdatePresents);

    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("players", onUpdatePlayers);
      socket.off("presents", onUpdatePresents);
    };
  }, []);

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
