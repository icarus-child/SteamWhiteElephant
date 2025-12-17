"use client";

import React, {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { isFirefox, isSafari } from "react-device-detect";

const updateCursor = (ele: HTMLElement) => {
  ele.style.cursor = "grabbing";
  ele.style.userSelect = "none";
};

const resetCursor = (ele: HTMLElement) => {
  ele.style.cursor = "grab";
  ele.style.removeProperty("user-select");
};

type SnapControlledProps = {
  snap: boolean | undefined;
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
        minWidth: "5em",
        width: "30%",
        height: "10em",
        flex: 1,
        pointerEvents: "none",
      }}
    ></div>
  );
}

type MousePos = {
  left: number;
  top: number;
  x: number;
  y: number;
};

export type DraggableProps = {
  className: string;
  scrollEvent?: WheelEvent;
  ref?: RefObject<HTMLElement | null>;
  snap?: boolean;
  focus?: number;
  children: React.ReactNode;
};

export default function Draggable(props: DraggableProps) {
  const startPos: RefObject<MousePos> = useRef<MousePos>({
    left: 0,
    top: 0,
    x: 0,
    y: 0,
  });
  const ref: RefObject<HTMLDivElement | null> = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [scrollClass, setScrollClass] = useState<string>("");
  const [refWidth, setRefWidth] = useState<number>(0);
  const scrollTargetPoint = useRef(0);
  const scrollTargetIndex = useRef(0);

  const wheelEventHandlerSnap = useCallback((e: WheelEvent) => {
    // const ele = e.target as HTMLDivElement;
    if (!ref.current) return;
    const ele = ref.current;
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
    if (isFirefox || isSafari) {
      ele.scrollLeft = scrollLocation;
    } else {
      ele.scrollTo({
        left: scrollLocation,
        behavior: "smooth",
      });
    }
  }, []);

  const wheelEventHandlerNoSnap = useCallback((e: WheelEvent) => {
    // const ele = e.target as HTMLDivElement;
    if (!ref.current) return;
    const ele = ref.current;
    scrollTargetPoint.current = Math.max(
      Math.min(
        scrollTargetPoint.current + e.deltaY,
        ele.scrollWidth - ele.clientWidth,
      ),
      0,
    );
    if (isFirefox || isSafari) {
      ele.scrollLeft = scrollTargetPoint.current;
    } else {
      ele.scrollTo({
        left: scrollTargetPoint.current,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    if (!props.scrollEvent) return;
    if (props.snap) {
      wheelEventHandlerSnap(props.scrollEvent);
    } else {
      wheelEventHandlerNoSnap(props.scrollEvent);
    }
  }, [props.scrollEvent, props.snap]);

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
          count--;
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

  function MiddleLine({ snap }: SnapControlledProps) {
    if (snap) {
      if (!ref.current) return;
      return (
        <div
          className="middleline bg-[#946666d0] border-[#CA8888] border-y-8 h-16 shrink-0 absolute top-0 z-10 pointer-events-none shadow-xl shadow-[#401111]/50"
          style={{ width: refWidth }}
        ></div>
      );
    }
    return null;
  }

  const resizeHandler = useCallback(() => {
    if (!ref.current) return;
    let width = 0;
    for (let i = 0; i < ref.current.children.length; i++) {
      let el = ref.current.children.item(i);
      if (el == null || el.classList.contains("middleline")) continue;
      width += el.scrollWidth;
    }
    setRefWidth(width);
  }, []);

  useEffect(() => {
    if (props.snap) {
      ref.current?.addEventListener("wheel", wheelEventHandlerSnap);
      window.addEventListener("resize", resizeHandler);
      return () => {
        ref.current?.removeEventListener("wheel", wheelEventHandlerSnap);
        window.removeEventListener("resize", resizeHandler);
      };
    } else {
      ref.current?.addEventListener("wheel", wheelEventHandlerNoSnap);
      return () => {
        ref.current?.removeEventListener("wheel", wheelEventHandlerNoSnap);
      };
    }
  }, []);

  useEffect(() => {
    setTimeout(resizeHandler, 100);
  }, [React.Children.count(props.children)]);

  useEffect(() => {
    if (isFirefox) setScrollClass("scroll-smooth");
    if (isSafari) setScrollClass("scroll-smooth snap-x");
  }, [isFirefox]);

  useLayoutEffect(() => {
    setTimeout(() => {
      if (ref.current == null || !props.snap) {
        return;
      }
      const temp = getChildCenterByIndex(ref.current, props.focus ?? 0) ?? 0;
      scrollTargetIndex.current = props.focus ?? 0;
      ref.current.scrollLeft = temp;
    }, 100);
  }, [React.Children.count(props.children)]);

  return (
    <div
      ref={ref}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      className={props.className + " " + scrollClass}
    >
      <Buffer snap={props.snap} />
      <MiddleLine snap={props.snap} />
      {props.children}
      <Buffer snap={props.snap} />
    </div>
  );
}
