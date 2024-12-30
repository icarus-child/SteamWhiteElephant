"use client";

import { createRef, RefObject, useEffect, useRef, useState } from "react";
import { isFirefox } from "react-device-detect";

const updateCursor = (ele: HTMLElement) => {
  ele.style.cursor = "grabbing";
  ele.style.userSelect = "none";
};

const resetCursor = (ele: HTMLElement) => {
  ele.style.cursor = "grab";
  ele.style.removeProperty("user-select");
};

function Buffer({ snap }: SnapControlledProps) {
  if (snap) {
    return (
      <div
        id="buffer"
        style={{
          width: "50%",
          height: "10em",
          flexShrink: 0,
          pointerEvents: "none",
        }}
      ></div>
    );
  }
  return (
    <div
      id="buffer"
      style={{
        maxWidth: "15em",
        width: "20%",
        height: "10em",
        flexShrink: 0,
        pointerEvents: "none",
      }}
    ></div>
  );
}

type SnapControlledProps = {
  snap: boolean | undefined;
};

function MiddleLine({ snap }: SnapControlledProps) {
  if (snap) {
    return <div className="middleline z-10 w-2 h-20 bg-sky-50"></div>;
  }
  return null;
}

type MousePos = {
  left: number;
  top: number;
  x: number;
  y: number;
};

export type DraggableProps = {
  className: string;
  snap?: boolean;
  children: React.ReactNode;
};

export default function Draggable(props: DraggableProps) {
  const startPos: RefObject<MousePos> = useRef<MousePos>({
    left: 0,
    top: 0,
    x: 0,
    y: 0,
  });
  const ref: RefObject<HTMLDivElement | null> = createRef();
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [isSmoothScroll, setIsSmoothScroll] = useState<string>("");
  const scrollTargetPoint = useRef(0);
  const scrollTargetIndex = useRef(0);

  function wheelEventHandlerSnap(e: WheelEvent) {
    const ele = e.target as HTMLDivElement;
    if (e.deltaY > 0) {
      scrollTargetIndex.current = Math.min(
        scrollTargetIndex.current + 1,
        Math.max(ele.children.length - 4, 0),
      );
    } else if (e.deltaY < 0) {
      scrollTargetIndex.current = Math.max(scrollTargetIndex.current - 1, 0);
    }
    const scrollLocation = getChildCenterByIndex(
      ele,
      scrollTargetIndex.current,
    );
    if (scrollLocation == null) {
      return;
    }
    if (isFirefox) {
      ele.scrollLeft = scrollLocation;
    } else {
      ele.scrollTo({
        left: scrollLocation,
        behavior: "smooth",
      });
    }
  }

  function wheelEventHandlerNoSnap(e: WheelEvent) {
    const ele = e.target as HTMLDivElement;
    scrollTargetPoint.current = Math.max(
      Math.min(
        scrollTargetPoint.current + e.deltaY,
        ele.scrollWidth - ele.clientWidth,
      ),
      0,
    );
    ele.scrollLeft = scrollTargetPoint.current;
  }

  useEffect(() => {
    if (props.snap) {
      ref.current?.removeEventListener("wheel", wheelEventHandlerSnap);
      ref.current?.addEventListener("wheel", wheelEventHandlerSnap);
    } else {
      ref.current?.removeEventListener("wheel", wheelEventHandlerNoSnap);
      ref.current?.addEventListener("wheel", wheelEventHandlerNoSnap);
    }
  }, [ref.current?.children]);

  function getClosestElementCenter(
    ref: HTMLDivElement,
    dx: number,
  ): { left: number | null; index: number } {
    let leftStack = 0;
    let count = 0;
    const halfway = Math.min(
      Math.max(
        startPos.current.left - dx + ref.clientWidth / 2,
        ref.clientWidth / 2,
      ),
      ref.scrollWidth - ref.clientWidth / 2,
    );
    for (let i = 0; i < ref.children.length; i++) {
      let el = ref.children.item(i);
      if (el == null || el.classList.contains("middleline")) continue;
      leftStack += el.clientWidth;
      if (leftStack > halfway) {
        if (i == 0) {
          do {
            i++;
            el = ref.children.item(i);
          } while (el == null || el.classList.contains("middleline"));
          leftStack += el.clientWidth;
        } else if (i == ref.children.length - 1) {
          leftStack -= el.clientWidth;
          i--;
          el = ref.children.item(i);
          if (el == null) break;
        }
        return {
          left: leftStack - ref.clientWidth / 2 - el.clientWidth / 2,
          index: count,
        };
      }
      if (el.id != "buffer") count++;
    }
    return { left: null, index: -1 };
  }

  function getChildCenterByIndex(
    ref: HTMLDivElement,
    targetIndex: number,
  ): number | null {
    let count = 0;
    let leftStack = 0;
    for (let i = 0; i < ref.children.length; i++) {
      let el = ref.children.item(i);
      if (el == null || el.classList.contains("middleline")) continue;
      leftStack += el.clientWidth;
      if (el.id != "buffer" && count == targetIndex) {
        return leftStack - ref.clientWidth / 2 - el.clientWidth / 2;
      }
      if (el.id != "buffer") count++;
    }
    return null;
  }

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!ref.current || e.button != 0) return;
    startPos.current = {
      left: ref.current.scrollLeft,
      top: ref.current.scrollTop,
      x: e.clientX,
      y: e.clientY,
    };
    setIsMouseDown(true);
    updateCursor(ref.current);
    if (props.snap) {
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!isMouseDown || !ref.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    ref.current.scrollTop = startPos.current.top - dy;
    ref.current.scrollLeft = startPos.current.left - dx;
    scrollTargetPoint.current = Math.max(
      Math.min(
        startPos.current.left - dx,
        ref.current.scrollWidth - ref.current.clientWidth,
      ),
      0,
    );
  }

  function handleMouseUp(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!isMouseDown || !ref.current) return;
    resetCursor(ref.current);
    setIsMouseDown(false);
    if (!props.snap) {
      return;
    }
    const { left: scrollLocation, index } = getClosestElementCenter(
      ref.current,
      e.clientX - startPos.current.x,
    );
    if (scrollLocation == null) {
      return;
    }
    scrollTargetIndex.current = index;
    if (isFirefox) {
      ref.current.scrollLeft = scrollLocation;
    } else {
      ref.current.scrollTo({
        left: scrollLocation,
        behavior: "smooth",
      });
    }
  }

  useEffect(() => {
    if (isFirefox) setIsSmoothScroll("scroll-smooth");
  }, [isFirefox]);

  useEffect(() => {
    if (ref.current == null || !props.snap) {
      return;
    }
    const temp = getChildCenterByIndex(ref.current, 0) ?? 0;
    ref.current.scrollLeft = temp;
  }, [ref.current?.children]);

  return (
    <div
      ref={ref}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className={props.className + " " + isSmoothScroll}
    >
      <Buffer snap={props.snap} />
      <MiddleLine snap={props.snap} />
      {props.children}
      <Buffer snap={props.snap} />
    </div>
  );
}