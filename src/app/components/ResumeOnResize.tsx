import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

export default function ResumeOnResize() {
  const { invalidate, clock } = useThree();

  useEffect(() => {
    let timeout: number;

    const onResize = () => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        clock.start(); // 🔑 restart RAF timing
        invalidate(); // 🔑 force a frame
      }, 50);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clock, invalidate]);

  return null;
}
