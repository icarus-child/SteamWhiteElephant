"use client";

import * as THREE from "three";
import { Present } from "@/types/present";
import {
  CSSProperties,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import BoosterPack from "./BoosterPack";
import { Environment, View } from "@react-three/drei";

export type WrappedPresentProps = {
  present: Present;
  className?: string;
  onClickAction: () => void;
  isMyTurn: boolean;
  playerId: string;
  model: any;
  captureScrollAction: (e: any) => void;
};

export default function WrappedPresent(props: WrappedPresentProps) {
  const [eleStyle, setEleStyle] = useState<CSSProperties>({});
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function updateSize() {
    if (!ref.current) return;
    setEleStyle({
      width: ref.current.clientHeight * 0.7,
      paddingLeft: ref.current.clientHeight * 0,
      paddingRight: ref.current.clientHeight * 0,
    });
  }

  useEffect(() => {
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const model = props.model;
  const [modelScale, setModelScale] = useState<number>(0);
  useLayoutEffect(() => {
    if (!ref.current) return;
    setModelScale(ref.current.clientHeight / 450);
  }, [ref.current?.clientHeight]);
  model.scale.setScalar(modelScale);

  const rotation = new THREE.Euler(0, Math.PI * 1.0, 0);

  // TODO: make multi-item gifts work
  const presentItem = props.present.items[0];
  return (
    <div
      ref={ref}
      style={eleStyle}
      className={
        "h-full shrink-0 z-20 snap-center pointer-events-auto relative rounded-lg w-full h-full flex flex-col" +
        " " +
        props.className
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onWheel={(e) => props.captureScrollAction(e)}
    >
      <View className="h-full w-full pointer-events-auto">
        <BoosterPack model={props.model} isHovered={isHovered} />
        <Environment
          files="/wrapped-present/christmas_photo_studio_01_2k.exr"
          environmentRotation={rotation}
          backgroundRotation={rotation}
        />
      </View>
      {isHovered && props.isMyTurn ? (
        <button
          className={`absolute bg-white text-[#FF7B8D] p-2 rounded-lg top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${props.present.gifterId === props.playerId ? " cursor-not-allowed" : ""}`}
          onClick={() => props.onClickAction()}
          disabled={props.present.gifterId === props.playerId}
        >
          {props.present.gifterId != props.playerId ? "TAKE" : "Yours"}
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
  );
}
