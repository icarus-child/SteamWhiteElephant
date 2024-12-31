"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";

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
  className: string;
  selected?: boolean;
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

  useEffect(() => {
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

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
        TestName
      </div>
      <div className={"rounded-lg size-full" + " " + props.className}></div>
    </div>
  );
}
