"use client";

import { Player, RoomPlayer } from "@/types/player";

type PlayerObjectProps = {
  player: Player;
  isMe: boolean;
};

const PlayerObject = ({ player, isMe }: PlayerObjectProps) => {
  return <p className={`${isMe ? "text-red-100" : ""}`}>{player.name}</p>;
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
    <div>
      {player.id === players[0]?.id ? (
        <button onClick={startGameAction}>Start Game</button>
      ) : (
        <></>
      )}
      <div>
        {players.map((p, i) => (
          <PlayerObject player={p} isMe={p.id === player.id} key={i} />
        ))}
      </div>
    </div>
  );
}
