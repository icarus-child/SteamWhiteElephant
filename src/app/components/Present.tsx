"use client";

import { Player } from "@/types/player";
import { CSSProperties, useLayoutEffect, useRef, useState } from "react";

type SelectedPlayerProps = {
  selected: boolean;
};

function SelectedPlayer(props: SelectedPlayerProps) {
  if (!props.selected) return;
  return (
    <svg
      className="absolute w-fit top-2 left-0 right-0 mx-auto"
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
        <path d="M12 0H0L6 8L12 0Z" fill="#bfdbfe"></path>
      </g>
    </svg>
  );
}

export type PresentPlaceholderProps = {
  player: Player;
  localPlayer: Player;
  isMyTurn: boolean;
  className: string;
  selected: boolean;
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

  const isFrozen =
    (props.player.present?.timesTraded ?? 0) >=
    (props.player.present?.maxTags ?? 0);
  const isClientsBroughtGift =
    props.localPlayer.present?.gifterId === props.player.present?.gifterId;
  return (
    <div
      ref={ref}
      className="h-3/5 w-12 shrink-0 pointer-events-none z-20 relative snap-center"
      style={eleStyle}
    >
      <SelectedPlayer selected={props.selected ?? false} />
      <div
        className={
          "text-center font-bold text-xl pt-5 pb-10" +
          " " +
          (props.selected ? "text-yellow-200" : "text-blue-200")
        }
      >
        {props.player.name}
      </div>
      {props.player.present ? (
        <div
          className={
            "rounded-lg size-full pointer-events-auto relative" +
            " " +
            (props.className ? props.className : "")
          }
        >
          {props.isMyTurn ? (
            <button
              className={`absolute text-blue border-2 border-blue p-2 rounded-lg top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isClientsBroughtGift || isFrozen ? " cursor-not-allowed" : ""}`}
              onClick={() => props.onClickAction()}
              disabled={isClientsBroughtGift || isFrozen}
            >
              {isFrozen ? "Frozen" : isClientsBroughtGift ? "Yours" : "Take"}
            </button>
          ) : null}

          {/*  TODO: make multi-item gifts work */}
          {props.player.present?.items[0]?.tags.map((tag, i) => {
            if (
              i < (props.player.present?.maxTags ?? 0) &&
              i >
                (props.player.present?.maxTags ?? 0) -
                  (props.player.present?.timesTraded ?? 0) -
                  1
            )
              return (
                <p key={i} className="text-black">
                  {tag}
                </p>
              );
          })}
        </div>
      ) : null}
    </div>
  );
}
