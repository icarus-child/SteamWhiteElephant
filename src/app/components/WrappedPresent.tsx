"use client";

import { Present } from "@/types/present";
import { CSSProperties, useEffect, useRef, useState } from "react";

export type WrappedPresentPlaceholderProps = {
  present: Present;
  className: string;
  onClickAction: () => void;
  isMyTurn: boolean;
  playerId: string;
};

export default function PresentPlaceholder(
  props: WrappedPresentPlaceholderProps,
) {
  const [eleStyle, setEleStyle] = useState<CSSProperties>({});
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function updateSize() {
    if (!ref.current) return;
    setEleStyle({
      width: ref.current.clientHeight * 1,
      paddingLeft: ref.current.clientHeight * 0.1,
      paddingRight: ref.current.clientHeight * 0.1,
    });
  }

  useEffect(() => {
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // TODO: make multi-item gifts work
  const presentItem = props.present.items[0];
  return (
    <div
      ref={ref}
      className="h-1/2 shrink-0 pointer-events-none z-20 snap-center"
      style={eleStyle}
    >
      <div
        className={
          "relative rounded-lg w-full h-full pointer-events-auto flex flex-col" +
          " " +
          props.className
        }
        onMouseEnter={() => {
          if (props.isMyTurn) setIsHovered(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered ? (
          <button
            className={`absolute text-blue border-2 border-blue p-2 rounded-lg top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${props.present.gifterId === props.playerId ? " cursor-not-allowed" : ""}`}
            onClick={() => props.onClickAction()}
            disabled={props.present.gifterId === props.playerId}
          >
            {props.present.gifterId != props.playerId ? "Take" : "Yours"}
          </button>
        ) : null}
        {presentItem.tags.map((tag, i) => {
          if (
            i < props.present.maxTags &&
            i > props.present.maxTags - props.present.timesTraded - 1
          )
            return (
              <p key={i} className="text-black">
                {tag}
              </p>
            );
        })}
      </div>
    </div>
  );
}
