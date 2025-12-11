import { Player, RoomPlayer } from "@/types/player";

type FinalPresentProps = {
  isMine: boolean;
  myGift: boolean;
  player: Player;
  gifter: Player;
};

const FinalPresent = ({
  isMine,
  player,
  gifter,
  myGift,
}: FinalPresentProps) => {
  return (
    <div className={`p-5 bg-orange-800 rounded-lg`}>
      <p className={`${isMine ? "text-red-100" : "text-black"}`}>
        {player.name}
      </p>
      <p>{player.present?.items[0].name}</p>
      <p className={`${myGift ? "text-blue-300" : "text-black"}`}>
        gifted by {gifter.name}
      </p>
    </div>
  );
};

type PostGameProps = {
  player: RoomPlayer;
  players: Player[];
};
export default function PostGame({ player, players }: PostGameProps) {
  return (
    <div className="grid gap-5 grid-cols-3 p-5">
      {players.map((p, i) => (
        <FinalPresent
          myGift={player.id === p.present?.gifterId}
          isMine={player.id === p.id}
          player={p}
          gifter={players.find((p2) => p2.id === p.present?.gifterId) as Player}
          key={i}
        />
      ))}
    </div>
  );
}
