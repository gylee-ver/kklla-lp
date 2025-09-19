"use client";

import NextImage from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

type Rect = { left: number; top: number; width: number; height: number };

const TALLY_URL = "https://tally.so/r/nPxdbx";
const TARGET_COLOR = { r: 0, g: 255, b: 240 }; // #00FFF0
const COLOR_TOLERANCE = 30; // 색상 허용 오차

export default function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(
    null
  );
  const [targetRects, setTargetRects] = useState<Rect[]>([]);

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

    const isWithin = (r: number, g: number, b: number) =>
      Math.abs(r - TARGET_COLOR.r) <= COLOR_TOLERANCE &&
      Math.abs(g - TARGET_COLOR.g) <= COLOR_TOLERANCE &&
      Math.abs(b - TARGET_COLOR.b) <= COLOR_TOLERANCE;

    const visited = new Uint8Array(width * height);
    const rects: Rect[] = [];

    const inBounds = (x: number, y: number) => x >= 0 && y >= 0 && x < width && y < height;
    const idxAt = (x: number, y: number) => (y * width + x);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const p = idxAt(x, y);
        if (visited[p]) continue;
        const base = p * 4;
        const r = data[base];
        const g = data[base + 1];
        const b = data[base + 2];
        if (!isWithin(r, g, b)) {
          visited[p] = 1;
          continue;
        }

        // BFS로 연결된 영역 수집
        let qx = [x];
        let qy = [y];
        visited[p] = 1;
        let qi = 0;
        let minX = x, minY = y, maxX = x, maxY = y;
        let count = 0;
        while (qi < qx.length) {
          const cx = qx[qi];
          const cy = qy[qi];
          qi++;
          count++;
          if (cx < minX) minX = cx;
          if (cy < minY) minY = cy;
          if (cx > maxX) maxX = cx;
          if (cy > maxY) maxY = cy;
          const neighbors = [
            [cx + 1, cy],
            [cx - 1, cy],
            [cx, cy + 1],
            [cx, cy - 1],
          ];
          for (const [nx, ny] of neighbors) {
            if (!inBounds(nx, ny)) continue;
            const np = idxAt(nx, ny);
            if (visited[np]) continue;
            const nb = np * 4;
            const nr = data[nb];
            const ng = data[nb + 1];
            const nbv = data[nb + 2];
            if (isWithin(nr, ng, nbv)) {
              visited[np] = 1;
              qx.push(nx);
              qy.push(ny);
            } else {
              visited[np] = 1; // 방문 처리
            }
          }
        }

        // 후보 필터링: 충분한 크기 + 가로로 긴 모양
        const w = maxX - minX + 1;
        const h = maxY - minY + 1;
        const aspect = w / Math.max(1, h);
        const area = w * h;
        const areaThreshold = (width * height) * 0.001; // 전체의 0.1% 이상
        if (aspect >= 3.5 && area >= areaThreshold) {
          const pad = Math.round(Math.min(width, height) * 0.006);
          const left = Math.max(0, minX - pad);
          const top = Math.max(0, minY - pad);
          const rw = Math.min(width - left, w + pad * 2);
          const rh = Math.min(height - top, h + pad * 2);
          rects.push({ left, top, width: rw, height: rh });
        }
      }
    }

    setTargetRects(rects);
  }, []);

  useEffect(() => {
    analyzeImage();
    const onResize = () => {
      // 리사이즈 시 재계산 필요 없음 (자연 크기 기준 rect 유지, 스케일만 재적용)
      setTargetRects((rs) => (rs ? [...rs] : rs));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [analyzeImage]);

  const scale = useMemo(() => {
    if (!containerRef.current || !naturalSize) return 1;
    const displayedWidth = containerRef.current.clientWidth; // 컨테이너 너비와 동일
    return displayedWidth / naturalSize.w;
  }, [naturalSize, containerRef.current?.clientWidth]);

  const onOverlayClick = useCallback((index: number) => {
    try {
      window.dataLayer?.push({ event: "preorder_cta_click", source: "1.png", index });
      if (typeof window.gtag === "function") {
        window.gtag("event", "preorder_cta_click", {
          event_category: "engagement",
          event_label: `1.png overlay ${index}`,
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
        {/* 헤더 (sticky) */}
        <div className="w-full sticky top-0 z-30 bg-white">
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

          {naturalSize && targetRects.length > 0
            ? targetRects.map((r, i) => (
                <a
                  key={`${r.left}-${r.top}-${r.width}-${r.height}-${i}`}
                  href={TALLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="사전 예약하고 혜택 받기"
                  onClick={() => onOverlayClick(i)}
                  className="absolute"
                  style={{
                    left: r.left * scale,
                    top: r.top * scale,
                    width: r.width * scale,
                    height: r.height * scale,
                    display: "block",
                    background: "transparent",
                  }}
                />
              ))
            : null}
        </div>
      </div>
    </div>
  );
}
