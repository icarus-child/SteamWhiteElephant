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
import Image from "next/image";

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
  const [isTagsHovered, setIsTagsHovered] = useState(false);
  const [isPermaTags, setIsPermaTags] = useState(false);
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
      {/* 20 character maximum */}
      <h1
        className="place-self-center text-white font-inter font-bold text-md 3xl:text-2xl mt-5 text-center max-w-[100%]"
        style={{ textShadow: "10px 10px 10px #11111199" }}
      >
        {props.present.giftName}
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
          className={`font-fjalla 3xl:text-2xl text-lg absolute bg-white text-[#FF7B8D] active:bg-[#AF5B6D] hover:text-white hover:bg-[#FF7B8D] disabled:text-[#404040] disabled:bg-[#a0a0a0] 3xl:p-2 px-2 py-1 rounded-lg top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 ${props.present.gifterId === props.playerId ? " cursor-not-allowed" : ""}`}
          onClick={() => props.onClickAction()}
          disabled={props.present.gifterId === props.playerId}
        >
          {props.present.gifterId != props.playerId ? "TAKE" : "Yours"}
        </button>
      ) : null}
      {isTagsHovered || isPermaTags ? (
        <div className="absolute top-[30%] gap-2 text-center w-full flex flex-col pointer-events-none z-10 place-items-center">
          {props.present.items[0]?.tags.slice(1, 7).map((tag, i) => {
            return (
              <p
                key={i}
                className="w-fit px-2 rounded-xl text-white bg-black/70 font-inter font-bold 3xl:text-lg text-sm"
              >
                {tag}
              </p>
            );
          })}
        </div>
      ) : null}
      <button
        onMouseEnter={() => {
          setIsTagsHovered(true);
          setIsHovered(false);
        }}
        onMouseLeave={() => {
          setIsTagsHovered(false);
          setIsHovered(true);
        }}
        onClick={() => {
          if (isPermaTags) {
            setIsPermaTags(false);
          } else {
            setIsPermaTags(true);
          }
        }}
        className={`absolute bottom-0 place-self-center rounded-md h-[8%] aspect-square bg-white/80 hover:text-white active:bg-[#AF5B6D] ${isPermaTags ? "text-[#FF7B8D] hover:bg-[#a0a0a0]" : "text-[#a0a0a0] hover:bg-[#FF7B8D]"}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          className="p-1"
        >
          <rect x="2" y="5" width="3" height="2" rx="1" />
          <rect x="7" y="5" width="15" height="2" rx="1" />

          <rect x="2" y="11" width="3" height="2" rx="1" />
          <rect x="7" y="11" width="15" height="2" rx="1" />

          <rect x="2" y="17" width="3" height="2" rx="1" />
          <rect x="7" y="17" width="15" height="2" rx="1" />
        </svg>
      </button>
    </div>
  );
}
