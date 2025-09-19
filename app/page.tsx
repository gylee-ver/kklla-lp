"use client";

import NextImage from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

type Rect = { left: number; top: number; width: number; height: number } | null;

const TALLY_URL = "https://tally.so/r/nPxdbx";
const TARGET_COLOR = { r: 0, g: 255, b: 240 }; // #00FFF0
const COLOR_TOLERANCE = 30; // 색상 허용 오차

export default function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(
    null
  );
  const [targetRect, setTargetRect] = useState<Rect>(null);

  const analyzeImage = useCallback(async () => {
    const src = "/1.png";
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    const loaded = await new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

    const width = loaded.naturalWidth;
    const height = loaded.naturalHeight;
    setNaturalSize({ w: width, h: height });

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(loaded, 0, 0);
    const { data } = ctx.getImageData(0, 0, width, height);

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx + 0];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const within =
          Math.abs(r - TARGET_COLOR.r) <= COLOR_TOLERANCE &&
          Math.abs(g - TARGET_COLOR.g) <= COLOR_TOLERANCE &&
          Math.abs(b - TARGET_COLOR.b) <= COLOR_TOLERANCE;

        if (within) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (
      minX !== Infinity &&
      minY !== Infinity &&
      maxX !== -Infinity &&
      maxY !== -Infinity
    ) {
      // 약간의 여백을 더해 클릭 영역을 넉넉하게
      const pad = Math.round(Math.min(width, height) * 0.006);
      const left = Math.max(0, minX - pad);
      const top = Math.max(0, minY - pad);
      const w = Math.min(width - left, maxX - left + pad * 2);
      const h = Math.min(height - top, maxY - top + pad * 2);
      setTargetRect({ left, top, width: w, height: h });
    } else {
      setTargetRect(null);
    }
  }, []);

  useEffect(() => {
    analyzeImage();
    const onResize = () => {
      // 리사이즈 시 재계산 필요 없음 (자연 크기 기준 rect 유지, 스케일만 재적용)
      setTargetRect((r) => (r ? { ...r } : r));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [analyzeImage]);

  const scale = useMemo(() => {
    if (!containerRef.current || !naturalSize) return 1;
    const displayedWidth = containerRef.current.clientWidth; // 컨테이너 너비와 동일
    return displayedWidth / naturalSize.w;
  }, [naturalSize, containerRef.current?.clientWidth]);

  const onOverlayClick = useCallback(() => {
    try {
      window.dataLayer?.push({ event: "preorder_cta_click", source: "1.png" });
      if (typeof window.gtag === "function") {
        window.gtag("event", "preorder_cta_click", {
          event_category: "engagement",
          event_label: "1.png overlay",
        });
      }
    } catch {}
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        minHeight: "100dvh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{ width: 390 }}
        className="mx-auto flex flex-col items-stretch"
      >
        {/* 헤더 */}
        <div className="w-full">
          <NextImage
            src="/header.png"
            alt="헤더 이미지"
            width={780}
            height={400}
            priority
            className="w-full h-auto block"
          />
        </div>

        {/* 본문 이미지 (1.png) + 투명 오버레이 링크 */}
        <div ref={containerRef} className="relative w-full">
          <NextImage
            src="/1.png"
            alt="상세 이미지"
            width={780}
            height={1200}
            className="w-full h-auto block"
          />

          {naturalSize && targetRect ? (
            <a
              href={TALLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="사전 예약하고 혜택 받기"
              onClick={onOverlayClick}
              className="absolute"
              style={{
                left: targetRect.left * scale,
                top: targetRect.top * scale,
                width: targetRect.width * scale,
                height: targetRect.height * scale,
                display: "block",
                // 투명 버튼
                background: "transparent",
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
