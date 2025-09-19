"use client";

import React, { useEffect, useMemo, useState } from "react";

type MobileFrameProps = {
  children: React.ReactNode;
  baseWidth?: number; // px
  baseHeight?: number; // px
  background?: string;
  className?: string;
};

export default function MobileFrame({
  children,
  baseWidth = 390,
  baseHeight = 844,
  background = "#0b0b0b",
  className,
}: MobileFrameProps) {
  const [scale, setScale] = useState(1);

  const recomputeScale = useMemo(() => {
    return () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scaleByWidth = vw / baseWidth;
      const scaleByHeight = vh / baseHeight;
      const next = Math.min(scaleByWidth, scaleByHeight);
      setScale(next > 1 ? 1 : next);
    };
  }, [baseWidth, baseHeight]);

  useEffect(() => {
    recomputeScale();
    window.addEventListener("resize", recomputeScale);
    return () => window.removeEventListener("resize", recomputeScale);
  }, [recomputeScale]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background,
      }}
    >
      <div
        style={{
          width: baseWidth,
          height: baseHeight,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.2)",
          borderRadius: 24,
          overflow: "hidden",
          background: "#ffffff",
        }}
        className={className}
      >
        {children}
      </div>
    </div>
  );
}


