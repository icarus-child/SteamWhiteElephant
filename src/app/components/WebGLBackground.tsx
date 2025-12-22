"use client";

import { useEffect, useRef } from "react";
import { fragmentShader, vertexShader } from "./shaders/balatro";

export type Color4 = {
  r: number;
  g: number;
  b: number;
  a: number;
};

type WebGLBackgroundProps = {
  outer: Color4;
  middle: Color4;
  inner: Color4;
};

export default function WebGLBackground({
  outer,
  middle,
  inner,
}: WebGLBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ---- WebGL2 context (explicit) ----
    const gl = canvas.getContext("webgl2", {
      antialias: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      console.error("WebGL2 not supported");
      return;
    }

    // ---- Resize handling ----
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = Math.floor(window.innerWidth * dpr);
      const height = Math.floor(window.innerHeight * dpr);

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";

      gl.viewport(0, 0, width, height);
    };

    resize();
    window.addEventListener("resize", resize);

    // ---- Shader compilation helpers ----
    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw new Error("Shader compile failed");
      }
      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexShader));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentShader));
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      throw new Error("Program link failed");
    }

    gl.useProgram(program);

    // ---- Fullscreen quad ----
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const posLoc = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, "uTime");
    const resLoc = gl.getUniformLocation(program, "uResolution");
    const outerLoc = gl.getUniformLocation(program, "outerColor");
    const middleLoc = gl.getUniformLocation(program, "middleColor");
    const innerLoc = gl.getUniformLocation(program, "innerColor");

    // ---- Animation loop ----
    let running = true;
    const startTime = performance.now();

    const loop = (now: number) => {
      if (!running) return;

      gl.uniform1f(timeLoc, (now - startTime) * 0.001);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform4f(outerLoc, outer.r, outer.g, outer.b, outer.a);
      gl.uniform4f(middleLoc, middle.r, middle.g, middle.b, middle.a);
      gl.uniform4f(innerLoc, inner.r, inner.g, inner.b, inner.a);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);

    return () => {
      running = false;
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        display: "block",
      }}
    />
  );
}
