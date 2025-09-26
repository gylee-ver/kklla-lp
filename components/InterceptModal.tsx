"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TALLY_URL = "https://tally.so/r/nPxdbx";

type Rect = { left: number; top: number; width: number; height: number };

export default function InterceptModal() {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ctaRect, setCtaRect] = useState<Rect | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Once-per-session control
  useEffect(() => {
    const s = sessionStorage.getItem("intercept_shown");
    if (s === "1") setShown(true);
  }, []);

  const scale = useMemo(() => {
    if (!natural || !containerWidth) return 1;
    return containerWidth / natural.w;
  }, [natural, containerWidth]);

  const analyzeImage = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    setNatural({ w, h });
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, w, h);

    // Detect bright cyan bar (#00FFF0 ± tolerance)
    const target = { r: 0, g: 255, b: 240 };
    const tol = 28;
    const idxAt = (x: number, y: number) => (y * w + x) * 4;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const step = Math.max(1, Math.floor(w / 800));
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const i = idxAt(x, y);
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (
          Math.abs(r - target.r) <= tol &&
          Math.abs(g - target.g) <= tol &&
          Math.abs(b - target.b) <= tol
        ) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (minX !== Infinity) {
      const pad = Math.round(Math.min(w, h) * 0.01);
      const left = Math.max(0, minX - pad);
      const top = Math.max(0, minY - pad);
      const width = Math.min(w - left, maxX - minX + pad * 2);
      const height = Math.min(h - top, maxY - minY + pad * 2);
      setCtaRect({ left, top, width, height });
    } else {
      setCtaRect(null);
    }
  }, []);

  // Back intercept
  useEffect(() => {
    // prepare state to catch first back
    try { history.pushState(null, "", location.href); } catch {}
    const onPop = (e: PopStateEvent) => {
      if (shown) return; // already shown this session
      e.preventDefault();
      setOpen(true);
      setShown(true);
      sessionStorage.setItem("intercept_shown", "1");
      // neutralize current back
      try { history.pushState(null, "", location.href); } catch {}
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [shown]);

  useEffect(() => {
    if (!open) return;
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) analyzeImage();
    else img.addEventListener("load", analyzeImage, { once: true });
  }, [open, analyzeImage]);

  // Track container width for scaling overlays
  useEffect(() => {
    if (!open) return;
    const update = () => {
      const el = containerRef.current;
      setContainerWidth(el ? el.clientWidth : 0);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [open]);

  // Exit region heuristic (below CTA)
  const exitRect: Rect | null = useMemo(() => {
    if (!natural) return null;
    const w = natural.w;
    const h = natural.h;
    if (ctaRect) {
      const top = Math.min(h - 80, ctaRect.top + ctaRect.height + 48);
      const width = Math.min(w * 0.9, ctaRect.width);
      const left = (w - width) / 2;
      const height = 56;
      return { left, top, width, height };
    }
    // fallback near bottom center
    return { left: w * 0.1, top: h - 90, width: w * 0.8, height: 56 };
  }, [natural, ctaRect]);

  const onExit = useCallback(() => {
    setOpen(false);
    // allow actual back
    try { history.back(); } catch {}
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000]">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/60" />

      {/* Centered modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div ref={containerRef} className="relative w-[min(90vw,390px)]">
          <img ref={imgRef} src="/optimized/intercept-1.webp" alt="인터셉트" className="w-full h-auto block rounded-2xl" />

          {/* CTA overlay */}
          {natural && ctaRect && (
            <a
              data-tally-cta
              data-keep-utm="true"
              href={TALLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="사전 예약하고 혜택 받기"
              className="absolute"
              style={{
                left: ctaRect.left * scale,
                top: ctaRect.top * scale,
                width: ctaRect.width * scale,
                height: ctaRect.height * scale,
              }}
            />
          )}

          {/* Exit overlay */}
          {natural && exitRect && (
            <button
              aria-label="괜찮습니다, 나가기"
              className="absolute"
              onClick={onExit}
              style={{
                left: exitRect.left * scale,
                top: exitRect.top * scale,
                width: exitRect.width * scale,
                height: exitRect.height * scale,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}


