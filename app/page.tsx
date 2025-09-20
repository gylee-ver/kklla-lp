"use client";

// 이미지 깨짐 이슈 방지를 위해 기본 <img> 사용
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

type Rect = { left: number; top: number; width: number; height: number };

const TALLY_URL = "https://tally.so/r/nPxdbx";
const TARGET_COLOR = { r: 0, g: 255, b: 240 }; // #00FFF0 (1.png)
const COLOR_TOLERANCE = 30; // 색상 허용 오차

type RGB = { r: number; g: number; b: number };

function OverlayImage({
  src,
  alt,
  targetColor,
  targetColors,
  eventKey,
  tolerance = 30,
  aspectMin = 3.5,
  minAreaRatio = 0.001,
}: {
  src: string;
  alt: string;
  targetColor?: RGB;
  targetColors?: RGB[]; // any-of colors
  eventKey: string;
  tolerance?: number;
  aspectMin?: number;
  minAreaRatio?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(
    null
  );
  const [rects, setRects] = useState<Rect[]>([]);

  const analyze = useCallback(async () => {
    const displaySrc = src.replace(/^\//, '/optimized/').replace(/\.png$/i, '.webp');
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    const loaded = await new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = displaySrc;
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

    const isWithin = (r: number, g: number, b: number) => {
      const candidates = targetColors && targetColors.length > 0 ? targetColors : (targetColor ? [targetColor] : []);
      for (const c of candidates) {
        if (
          Math.abs(r - c.r) <= tolerance &&
          Math.abs(g - c.g) <= tolerance &&
          Math.abs(b - c.b) <= tolerance
        ) {
          return true;
        }
      }
      return false;
    };

    const visited = new Uint8Array(width * height);
    const out: Rect[] = [];
    const inBounds = (x: number, y: number) => x >= 0 && y >= 0 && x < width && y < height;
    const idxAt = (x: number, y: number) => y * width + x;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const p = idxAt(x, y);
        if (visited[p]) continue;
        const bidx = p * 4;
        const r = data[bidx];
        const g = data[bidx + 1];
        const b = data[bidx + 2];
        if (!isWithin(r, g, b)) {
          visited[p] = 1;
          continue;
        }

        const qx = [x];
        const qy = [y];
        visited[p] = 1;
        let qi = 0;
        let minX = x, minY = y, maxX = x, maxY = y;
        while (qi < qx.length) {
          const cx = qx[qi];
          const cy = qy[qi];
          qi++;
          if (cx < minX) minX = cx;
          if (cy < minY) minY = cy;
          if (cx > maxX) maxX = cx;
          if (cy > maxY) maxY = cy;
          const neighbors: [number, number][] = [
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
              visited[np] = 1;
            }
          }
        }

        const w = maxX - minX + 1;
        const h = maxY - minY + 1;
        const aspect = w / Math.max(1, h);
        const area = w * h;
        if (aspect >= aspectMin && area >= width * height * minAreaRatio) {
          const pad = Math.round(Math.min(width, height) * 0.006);
          const left = Math.max(0, minX - pad);
          const top = Math.max(0, minY - pad);
          const rw = Math.min(width - left, w + pad * 2);
          const rh = Math.min(height - top, h + pad * 2);
          out.push({ left, top, width: rw, height: rh });
        }
      }
    }
    setRects(out);
  }, [src, targetColor, targetColors, tolerance, aspectMin, minAreaRatio]);

  useEffect(() => {
    analyze();
    const onResize = () => setRects((rs) => (rs ? [...rs] : rs));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [analyze]);

  const scale = useMemo(() => {
    if (!containerRef.current || !naturalSize) return 1;
    const displayedWidth = containerRef.current.clientWidth;
    return displayedWidth / naturalSize.w;
  }, [naturalSize]);

  const onClick = useCallback(
    (index: number) => {
      try {
        window.dataLayer?.push({ event: "preorder_cta_click", source: src, index, key: eventKey });
        if (typeof window.gtag === "function") {
          window.gtag("event", "preorder_cta_click", {
            event_category: "engagement",
            event_label: `${eventKey} ${src} ${index}`,
          });
        }
      } catch {}
    },
    [eventKey, src]
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <img src={src.replace(/^\//, '/optimized/').replace(/\.png$/i, '.webp')} alt={alt} className="w-full h-auto block" />
      {naturalSize && rects.length > 0
        ? rects.map((r, i) => (
            <a
              key={`${src}-${i}-${r.left}-${r.top}`}
              href={TALLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={alt}
              onClick={() => onClick(i)}
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
  );
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(
    null
  );
  const [targetRects, setTargetRects] = useState<Rect[]>([]);

  const analyzeImage = useCallback(async () => {
    const src = "/optimized/1.webp";
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
        const qx = [x];
        const qy = [y];
        visited[p] = 1;
        let qi = 0;
        let minX = x, minY = y, maxX = x, maxY = y;
        while (qi < qx.length) {
          const cx = qx[qi];
          const cy = qy[qi];
          qi++;
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
  }, [naturalSize]);

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
          <img src="/optimized/header.webp" alt="헤더 이미지" className="w-full h-auto block" />
        </div>

        {/* 본문 이미지 (1.png) + 투명 오버레이 링크 */}
        <div ref={containerRef} className="relative w-full">
          <img src="/optimized/1.webp" alt="상세 이미지" className="w-full h-auto block" />

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

        {/* 2 ~ 3 단순 이미지 */}
        <div className="w-full">
          <img src="/optimized/2.webp" alt="섹션 2" className="w-full h-auto block" />
        </div>
        <div className="w-full">
          <img src="/optimized/3.webp" alt="섹션 3" className="w-full h-auto block" />
        </div>

        {/* 4.png: #00FFF0 근사치 CTA 탐지 */}
        <OverlayImage
          src="/4.png"
          alt="사전 예약하고 혜택 받기"
          targetColor={{ r: 0, g: 255, b: 240 }}
          tolerance={30}
          eventKey="cta-4"
        />

        {/* 5.png: #000752 근사치 CTA 탐지 */}
        <OverlayImage
          src="/5.png"
          alt="증명된 끌라 사전 예약하기"
          targetColor={{ r: 0, g: 7, b: 82 }}
          tolerance={35}
          aspectMin={3.0}
          eventKey="cta-5"
        />

        {/* 6 ~ 7 단순 이미지 (6은 6-1로 교체) */}
        <div className="w-full">
          <img src="/optimized/6-1.webp" alt="섹션 6" className="w-full h-auto block" />
        </div>
        <div className="w-full">
          <img src="/optimized/7.webp" alt="섹션 7" className="w-full h-auto block" />
        </div>

        {/* 8.png: #00FF00 근사치 CTA 탐지 */}
        <OverlayImage
          src="/8.png"
          alt="사전 예약하고 혜택 받기"
          targetColors={[{ r: 0, g: 255, b: 0 }, { r: 0, g: 255, b: 240 }]}
          tolerance={40}
          eventKey="cta-8"
        />
      </div>
    </div>
  );
}
