"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";

export type PresentPlaceholderProps = {
  className: string;
  resizeHandler?: Function;
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
    //if (props.resizeHandler) props.resizeHandler();
  }

  useEffect(() => {
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      ref={ref}
      className="h-1/2 shrink-0 pointer-events-none z-20 snap-center"
      style={eleStyle}
    >
      <div className={"rounded-lg w-full h-full" + " " + props.className}></div>
    </div>
  );
}
