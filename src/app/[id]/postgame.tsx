import * as THREE from "three";
import { Player, RoomPlayer } from "@/types/player";
import TiltCard from "../components/TiltCard";
import { useMemo, useState } from "react";
import { Environment } from "@react-three/drei";
import BoosterPack from "../components/BoosterPack";
import { CanvasTexture } from "three";
import WebGLBackground from "../components/WebGLBackground";
import { Canvas } from "@react-three/fiber";

type FinalPresentProps = {
  isMine: boolean;
  myGift: boolean;
  player: Player;
  gifter: Player;
  model: any;
  texture?: THREE.Texture;
};

const FinalPresent = ({
  isMine,
  player,
  gifter,
  myGift,
  model,
  texture,
}: FinalPresentProps) => {
  const imageUrl = useMemo(() => {
    if (!player.present?.items[0].gameId) return;
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${player.present?.items[0].gameId}/library_600x900_2x.jpg`;
  }, [player.present?.items[0].gameId]);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  model.scale.setScalar(1);

  return (
    <div className="flex flex-col w-fit gap-8">
      <div className="flex flex-row">
        <TiltCard url={imageUrl ?? ""} height="h-[22em]" width="w-[15em]">
          <a
            href={`https://store.steampowered.com/app/${player.present?.items[0].gameId}`}
            className="underline absolute bottom-3 text-center w-full text-[#AACCFF] 3xl:text-lg text-sm"
            target="_blank"
          >
            steam link
          </a>
        </TiltCard>
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="w-[15em] h-[22em]"
        >
          <Canvas
            camera={{ position: [0, 0, -2], scale: [0.014, 0.014, 0.02] }}
            orthographic={true}
          >
            <BoosterPack
              model={model}
              isHovered={isHovered}
              albedo={texture as CanvasTexture}
            />
            <Environment
              files="/wrapped-present/christmas_photo_studio_01_2k.exr"
              environmentRotation={[0, Math.PI, 0]}
            />
          </Canvas>
        </div>
      </div>
      <div className="font-inter flex flex-row bg-[#946666]/60 py-2 px-3 rounded-xl border-2 border-[#CA8888]">
        <p className={`font-bold ${isMine ? "text-[#F4EF51]" : ""}`}>
          {player.name}
        </p>
        <div className="flex-grow" />
        <p className="text-gray-300">
          Gifted by{" "}
          <span className={`${myGift ? "text-[#F4EF51]" : ""}`}>
            {gifter.name}
          </span>
        </p>
      </div>
    </div>
  );
};

type PostGameProps = {
  player: RoomPlayer;
  players: Player[];
  models: any[];
  textures: Map<string, THREE.Texture>;
};
export default function PostGame({
  player,
  players,
  models,
  textures,
}: PostGameProps) {
  return (
    <>
      <h1 className="text-center mt-10 mb-5 font-inknut text-white text-5xl">
        Thanks for Playing!
      </h1>
      <div className="grid place-content-center">
        <div className="flex flex-wrap gap-10 mx-10 mt-10 place-content-center">
          {players.map((p, i) => (
            <FinalPresent
              model={models[i]}
              texture={textures.get(p.present?.gifterId ?? "")}
              myGift={player.id === p.present?.gifterId}
              isMine={player.id === p.id}
              player={p}
              gifter={
                players.find((p2) => p2.id === p.present?.gifterId) as Player
              }
              key={i}
            />
          ))}
          <WebGLBackground
            outer={{ r: 0.761, g: 0.396, b: 0.443, a: 1.0 }}
            middle={{ r: 0.361, g: 0.188, b: 0.212, a: 1.0 }}
            inner={{ r: 0.561, g: 0.29, b: 0.325, a: 1.0 }}
          />
        </div>
      </div>
    </>
  );
}
