"use client";

import * as THREE from "three";
import { Present } from "@/types/present";
import { CSSProperties, useEffect, useRef, useState } from "react";
import BoosterPack from "./BoosterPack";
import { Environment, View } from "@react-three/drei";

export type WrappedPresentProps = {
  present: Present;
  className?: string;
  onClickAction: () => void;
  isMyTurn: boolean;
  playerId: string;
  model: any;
};

export default function WrappedPresent(props: WrappedPresentProps) {
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

  const rotation = new THREE.Euler(0, Math.PI * 1.0, 0);

  // TODO: make multi-item gifts work
  const presentItem = props.present.items[0];
  return (
    <div
      ref={ref}
      className="h-full shrink-0 pointer-events-none z-20 snap-center"
      style={eleStyle}
    >
      <div
        className={
          "relative rounded-lg w-full h-full pointer-events-auto flex flex-col border-blue-100 border-2" +
          " " +
          props.className
        }
        onMouseEnter={() => {
          if (props.isMyTurn) setIsHovered(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        <View className="h-full w-full">
          {/* <PerspectiveCamera position={[0, 0, 10]} /> */}
          <BoosterPack model={props.model} />
          <Environment
            files="/wrapped-present/christmas_photo_studio_01_2k.exr"
            environmentRotation={rotation}
            backgroundRotation={rotation}
          />
        </View>
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
