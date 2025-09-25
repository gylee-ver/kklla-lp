"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function LandingPromoModal() {
  const [open, setOpen] = useState(false);
  const [src, setSrc] = useState<string>("/opening.png");
  const imgContainerRef = useRef<HTMLDivElement | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("promo_dismissed");
    if (!dismissed) setOpen(true);
  }, []);

  // track size for overlay scaling
  useEffect(() => {
    if (!open) return;
    const update = () => setContainerWidth(imgContainerRef.current?.clientWidth || 0);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [open]);

  const scale = useMemo(() => {
    if (!natural || !containerWidth) return 1;
    return containerWidth / natural.w;
  }, [natural, containerWidth]);

  const onLoaded = (e: HTMLImageElement) => {
    setNatural({ w: e.naturalWidth, h: e.naturalHeight });
  };

  const onError = () => {
    // fallback 이미지 시도
    if (src !== "/Group 58.png") setSrc("/Group 58.png");
  };

  const dismiss = () => {
    sessionStorage.setItem("promo_dismissed", "1");
    setOpen(false);
  };

  // '자세히 알아보기' 영역 추정: 이미지 하단 중앙 띠 영역
  const learnRect = useMemo(() => {
    if (!natural) return null;
    const w = natural.w;
    const h = natural.h;
    const width = Math.min(w * 0.7, 560);
    const height = Math.max(44, h * 0.07);
    const left = (w - width) / 2;
    const top = h - height - Math.max(24, h * 0.05);
    return { left, top, width, height };
  }, [natural]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={dismiss} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div ref={imgContainerRef} className="relative w-[min(90vw,480px)] select-none">
          <Image
            src={src}
            alt="프로모션"
            width={960}
            height={1200}
            className="w-full h-auto block rounded-2xl"
            onLoad={(e) => onLoaded(e.currentTarget)}
            onError={onError}
            priority
            unoptimized
          />

          {natural && learnRect && (
            <button
              aria-label="자세히 알아보기"
              className="absolute"
              onClick={dismiss}
              style={{
                left: learnRect.left * scale,
                top: learnRect.top * scale,
                width: learnRect.width * scale,
                height: learnRect.height * scale,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}


