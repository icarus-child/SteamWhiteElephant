"use client";

import { Player, RoomPlayer } from "@/types/player";
import WebGLBackground from "../components/WebGLBackground";

type PlayerObjectProps = {
  player: Player;
  isMe: boolean;
  isHost: boolean;
};

const PlayerObject = ({ player, isMe, isHost }: PlayerObjectProps) => {
  return (
    <p
      className={`font-inter text-xl font-bold ${isMe ? "text-red-300" : "text-white"}`}
    >
      {player.name}{" "}
      {isHost ? <span className="text-yellow-300">(host)</span> : null}
    </p>
  );
};

type LobbyProps = {
  player: RoomPlayer;
  players: Player[];
  startGameAction: () => void;
};

export default function Lobby({
  player,
  players,
  startGameAction,
}: LobbyProps) {
  return (
    <div className="bg-[#4B744C] w-screen h-screen flex flex-col place-items-center gap-10 py-10">
      <h1 className="text-6xl font-inknut text-white my-8">
        Waiting for Start...
      </h1>
      <p className="text-[#efefef]">
        {players.length} {players.length === 1 ? "player" : "players"} in lobby
      </p>
      {player.id === players[0]?.id ? (
        <button
          className="text-white bg-black text-lg w-fit px-4 py-2 rounded-full font-inter font-bold hover:bg-white hover:text-black active:bg-[#cfcfcf]"
          onClick={() => {
            startGameAction();
          }}
        >
          START GAME
        </button>
      ) : (
        <></>
      )}
      <div className="flex flex-row flex-wrap gap-10 px-20 w-full max-w-6xl">
        {players.map((p, i) => (
          <PlayerObject
            player={p}
            isMe={p.id === player.id}
            isHost={p.id === players[0].id}
            key={i}
          />
        ))}
      </div>
      {/* <WebGLBackground /> */}
    </div>
  );
}
