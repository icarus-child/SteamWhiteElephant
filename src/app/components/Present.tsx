"use client";

import { Player } from "@/types/player";
import {
  CSSProperties,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import TiltCard from "./TiltCard";

type SelectedPlayerProps = {
  selected: boolean;
};

function SelectedPlayer(props: SelectedPlayerProps) {
  if (!props.selected) return;
  return (
    <>
      <svg
        className="absolute w-fit 3xl:top-2 top-1 mx-auto"
        height={8}
        width={12}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          <path d="M12 0H0L6 8L12 0Z" fill="#CA8888"></path>
        </g>
      </svg>
      <svg
        className="absolute w-fit 3xl:top-12 top-9 mx-auto"
        height={8}
        width={12}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          <path d="M12 8H0L6 0L12 8Z" fill="#CA8888"></path>
        </g>
      </svg>
    </>
  );
}

export type PresentPlaceholderProps = {
  player: Player;
  localPlayer: Player;
  isMyTurn: boolean;
  className?: string;
  selected: boolean;
  focused?: boolean;
  onClickAction: () => void;
};

export default function PresentPlaceholder(props: PresentPlaceholderProps) {
  const [eleStyle, setEleStyle] = useState<CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);

  function updateSize() {
    if (!ref.current) return;
    setEleStyle({
      width: ref.current.clientHeight * 0.7,
      paddingLeft: ref.current.clientHeight * 0.01,
      paddingRight: ref.current.clientHeight * 0.01,
    });
  }

  useLayoutEffect(() => {
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const imageUrl = useMemo(() => {
    if (!props.player.present?.items[0].gameId) return;
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${props.player.present?.items[0].gameId}/library_600x900_2x.jpg`;
  }, [props.player.present?.items[0].gameId]);

  const isFrozen =
    (props.player.present?.timesTraded ?? 0) >=
    (props.player.present?.maxTags ?? 0) + 1;
  const isClientsBroughtGift =
    props.localPlayer.id === props.player.present?.gifterId;
  return (
    <div
      ref={ref}
      className="h-full shrink-0 pointer-events-auto z-20 flex flex-col place-items-center snap-center"
      style={eleStyle}
    >
      <SelectedPlayer selected={props.selected ?? false} />
      <div
        className={
          "text-center font-bold 3xl:text-2xl text-md 3xl:pt-[0.7em] pt-[0.9em] pb-5" +
          " " +
          (props.selected ? "text-white" : "text-[#FFDDDD]")
        }
      >
        {props.player.name}
      </div>

      {props.player.present && imageUrl ? (
        <>
          <h1
            className="3xl:pb-6 pb-3 3xl:pt-5 pt-2 3xl:text-3xl text-xl font-black text-[#eeeeee] pointer-events-none font-inter"
            style={{ textShadow: "10px 10px 10px #11111199" }}
          >
            {props.player.present.items[0].name}
          </h1>
          <TiltCard url={imageUrl}>
            <a
              href={`https://store.steampowered.com/app/${props.player.present.items[0].gameId}`}
              className="underline absolute bottom-3 text-center w-full text-[#AACCFF] 3xl:text-lg text-sm"
              target="_blank"
            >
              steam link
            </a>
          </TiltCard>
        </>
      ) : null}
      {props.isMyTurn && props.player.present ? (
        <button
          onClick={() => props.onClickAction()}
          disabled={isClientsBroughtGift || isFrozen}
          className="steal-btn 3xl:mt-7 mt-5 text-[#FF7B8D] font-black 3xl:text-4xl text-2xl rounded-xl disabled:pointer-events-none disabled:text-[#404040] disabled:bg-[#a0a0a0] hover:rounded-b-3xl hover:rounded-t-lg transition-[border-radius] 3xl:py-3 py-2 px-10"
        >
          <span className="steal-text font-fjalla">
            {isFrozen ? "LOCKED" : isClientsBroughtGift ? "YOURS" : "STEAL"}
          </span>
          <span
            aria-hidden={false}
            className="steal-marquee font-climate text-white"
          >
            STEAL
          </span>
        </button>
      ) : null}
    </div>
  );
}
