"use client";

import { Player } from "@/types/player";
import React, { CSSProperties, useLayoutEffect, useRef, useState } from "react";

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent) {
    const card = ref.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const midX = rect.width / 2;
    const midY = rect.height / 2;

    const rotateY = ((x - midX) / midX) * 10; // max 10deg
    const rotateX = -((y - midY) / midY) * 10;

    card.style.transform = `
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
    `;
  }

  function reset() {
    const card = ref.current;
    if (!card) return;
    card.style.transform = "rotateX(0deg) rotateY(0deg)";
  }

  return (
    <div className="tilt-wrapper">
      <div
        ref={ref}
        className="tilt-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={reset}
      >
        {children}
      </div>
    </div>
  );
}

type SelectedPlayerProps = {
  selected: boolean;
};

function SelectedPlayer(props: SelectedPlayerProps) {
  if (!props.selected) return;
  return (
    <>
      <svg
        className="absolute w-fit top-2 mx-auto"
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
        className="absolute w-fit top-12 mx-auto"
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
      width: ref.current.clientHeight * 1,
      paddingLeft: ref.current.clientHeight * 0.1,
      paddingRight: ref.current.clientHeight * 0.1,
    });
  }

  useLayoutEffect(() => {
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const isRevealed =
    (props.player.present?.timesTraded ?? 0) >=
    (props.player.present?.maxTags ?? 0) + 1;
  const isFrozen =
    (props.player.present?.timesTraded ?? 0) >=
    (props.player.present?.maxTags ?? 0) + 1;
  const isClientsBroughtGift =
    props.localPlayer.present?.gifterId === props.player.present?.gifterId;
  return (
    <div
      ref={ref}
      className="h-full w-12 shrink-0 pointer-events-auto z-20 flex flex-col place-items-center snap-center"
      style={eleStyle}
    >
      <SelectedPlayer selected={props.selected ?? false} />
      <div
        className={
          "text-center font-bold text-xl pt-5 pb-5" +
          " " +
          (props.selected ? "text-white" : "text-[#FFDDDD]")
        }
      >
        {props.player.name}
      </div>

      {props.player.present ? (
        isRevealed || true ? (
          <>
            <h1
              className="pb-3 pt-2 text-2xl font-black text-[#eeeeee]"
              style={{ textShadow: "10px 10px 10px #11111199" }}
            >
              {props.player.present.items[0].name}
            </h1>
            <div
              className={
                "rounded-3xl h-[65%] w-[55%] relative" + " " + props.className
              }
              style={{
                backgroundImage: `
                  linear-gradient(
                    #00000000 50%,
                    #220000 87%,
                    #440000 100%
                  ),
                  url('/library_balatro_test.jpg')
                `,
                backgroundSize: "cover, 105%",
                backgroundPosition: "center, center",
                backgroundRepeat: "no-repeat, no-repeat",
                border: "8px solid #440000", // Define border size and make it transparent
              }}
            >
              <a
                href={`https://store.steampowered.com/app/${props.player.present.items[0].gameId}`}
                className="underline absolute bottom-3 text-center w-full text-[#AACCFF] text-lg"
                target="_blank"
              >
                steam link
              </a>
            </div>
          </>
        ) : //<View className="h-full w-full pointer-events-auto">
        //  <BoosterPack model={props.model} isHovered={isHovered} />
        //  <Environment
        //    files="/wrapped-present/christmas_photo_studio_01_2k.exr"
        //    environmentRotation={rotation}
        //    backgroundRotation={rotation}
        //  />
        //</View>
        //{props.player.present?.items[0]?.tags.map((tag, i) => {
        //  if (
        //    i < (props.player.present?.maxTags ?? 0) &&
        //    i >
        //      (props.player.present?.maxTags ?? 0) -
        //        (props.player.present?.timesTraded ?? 0) -
        //        1
        //  )
        //    return (
        //      <p key={i} className="text-black">
        //        {tag}
        //      </p>
        //    );
        //})}
        null
      ) : null}
      {props.isMyTurn && props.player.present ? (
        <button
          className={`pointer-events-auto text-blue border-2 border-blue p-2 rounded-lg top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isClientsBroughtGift || isFrozen ? " cursor-not-allowed" : ""}`}
          onClick={() => props.onClickAction()}
          disabled={isClientsBroughtGift || isFrozen}
        >
          {isFrozen ? "Frozen" : isClientsBroughtGift ? "Yours" : "Take"}
        </button>
      ) : null}
    </div>
  );
}
