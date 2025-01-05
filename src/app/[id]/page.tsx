"use client";

import Draggable from "@/app/components/Draggable";
import Present from "@/app/components/Present";
import WrappedPresent from "@/app/components/WrappedPresent";
import { Player } from "@/types/player";
import { Present as PresentType } from "@/types/present";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

export default function Home() {
  const [_1, setIsConnected] = useState<boolean>(false);
  const [_2, setTransport] = useState<string>("N/A");
  const [players, setPlayers] = useState<Player[]>([]);
  const [presents, setPresents] = useState<PresentType[]>([]);

  const roomId = useParams().id as string;

  const socket = useMemo(() => {
    return io({
      extraHeaders: {
        roomid: roomId,
      },
    });
  }, []);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    function onUpdatePlayers(eventPlayers: Player[]) {
      setPlayers(eventPlayers);
      for (const p of eventPlayers) {
        console.log(p.name);
      }
    }

    function onUpdatePresents(eventPresents: PresentType[]) {
      setPresents(eventPresents);
      for (const p of eventPresents) {
        for (const i of p.items) {
          console.log(i.name);
        }
      }
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("players", onUpdatePlayers);
    socket.on("presents", onUpdatePresents);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("players", onUpdatePlayers);
      socket.off("presents", onUpdatePresents);
    };
  }, []);

  return (
    <div className="h-screen">
      <Draggable className="overflow-x-scroll overflow-hidden flex flex-row items-center hide-scrollbar p-5 cursor-grab h-2/5 bg-red-700">
        <WrappedPresent className="bg-[#B8B799]" />
        <WrappedPresent className="bg-[#1E5945]" />
        <WrappedPresent className="bg-[#EFA94A]" />
        <WrappedPresent className="bg-[#31372B]" />
        <WrappedPresent className="bg-[#BDECB6]" />
        <WrappedPresent className="bg-[#828282]" />
        <WrappedPresent className="bg-[#354D73]" />
        <WrappedPresent className="bg-[#B8B799]" />
        <WrappedPresent className="bg-[#1E5945]" />
        <WrappedPresent className="bg-[#EFA94A]" />
        <WrappedPresent className="bg-[#31372B]" />
        <WrappedPresent className="bg-[#BDECB6]" />
        <WrappedPresent className="bg-[#828282]" />
        <WrappedPresent className="bg-[#354D73]" />
      </Draggable>
      <Draggable
        snap={true}
        focus={2}
        className="overflow-x-scroll overflow-hidden flex flex-row hide-scrollbar cursor-grab h-3/5 bg-red-800"
      >
        <Present className="bg-[#B8B799]" />
        <Present className="bg-[#1E5945]" />
        <Present selected={true} className="bg-[#EFA94A]" />
        <Present className="bg-[#31372B]" />
        <Present className="bg-[#BDECB6]" />
        <Present className="bg-[#828282]" />
        <Present className="bg-[#354D73]" />
        <Present className="bg-[#B8B799]" />
        <Present className="bg-[#1E5945]" />
        <Present className="bg-[#EFA94A]" />
        <Present className="bg-[#31372B]" />
        <Present className="bg-[#BDECB6]" />
        <Present className="bg-[#828282]" />
        <Present className="bg-[#354D73]" />
      </Draggable>
    </div>
  );
}
