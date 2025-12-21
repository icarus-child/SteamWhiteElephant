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
import { isMobile } from "react-device-detect";
import { CanvasTexture } from "three";

export type WrappedPresentProps = {
  present: Present;
  className?: string;
  onClickAction: () => void;
  isMyTurn: boolean;
  playerId: string;
  model: any;
  texture?: THREE.Texture;
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

  // TODO: make multi-item gifts work
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
      {/* 130 character maximum */}
      <h1
        className="place-self-center text-white font-inter font-bold text-xl mt-5 text-center"
        style={{ textShadow: "10px 10px 10px #11111199" }}
      >
        Custom Name
      </h1>
      <View className="h-full w-full pointer-events-auto">
        <BoosterPack
          model={props.model}
          isHovered={isHovered}
          albedo={props.texture as CanvasTexture}
        />
        <Environment
          files="/wrapped-present/christmas_photo_studio_01_2k.exr"
          environmentRotation={[0, Math.PI, 0]}
        />
      </View>
      {(isHovered || isMobile) && props.isMyTurn ? (
        <button
          className={`font-fjalla text-2xl absolute bg-white text-[#FF7B8D] active:bg-[#AF5B6D] hover:text-white hover:bg-[#FF7B8D] disabled:text-[#404040] disabled:bg-[#a0a0a0] p-2 rounded-lg top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 ${props.present.gifterId === props.playerId ? " cursor-not-allowed" : ""}`}
          onClick={() => props.onClickAction()}
          disabled={props.present.gifterId === props.playerId}
        >
          {props.present.gifterId != props.playerId ? "TAKE" : "Yours"}
        </button>
      ) : null}
      {!isHovered ? (
        <div className="absolute top-[30%] gap-4 text-center w-full flex flex-col pointer-events-none z-10 place-items-center">
          {props.present.items[0]?.tags.slice(1, 7).map((tag, i) => {
            return (
              <p
                key={i}
                className="w-fit px-2 rounded-xl text-white bg-black/70 font-inter font-bold"
              >
                {tag}
              </p>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
