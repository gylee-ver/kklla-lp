"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";

const TALLY_URL = "https://tally.so/r/nPxdbx";
const TOTAL = 50;
const START_CONFIRMED = 28;
const DAILY_INC = 2;
const CAP_CONFIRMED = 46; // 46부터 더 이상 증가하지 않음

// KST 유틸
function getKstNow(): Date {
  return new Date(Date.now() + 9 * 60 * 60 * 1000);
}
function getKst0900(d: Date): Date {
  const t = new Date(d.getTime());
  t.setUTCHours(0, 0, 0, 0); // KST 자정
  t.setTime(t.getTime() + 9 * 60 * 60 * 1000);
  return t; // KST 09:00 같은 날
}
function getPrevOrSameBoundary(nowKst: Date): Date {
  const today0900 = getKst0900(nowKst);
  if (nowKst.getTime() < today0900.getTime()) {
    return new Date(today0900.getTime() - 24 * 60 * 60 * 1000);
  }
  return today0900;
}

// 기준일(시작일) 09:00 KST - 필요 시 바꾸세요
const SEED_BOUNDARY_KST_MS = Date.UTC(2025, 8, 25, 0, 0, 0, 0) + 9 * 60 * 60 * 1000;

function computeConfirmed(): number {
  const nowKst = getKstNow();
  const prevBoundary = getPrevOrSameBoundary(nowKst);
  const diff = prevBoundary.getTime() - SEED_BOUNDARY_KST_MS;
  const days = Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)));
  const inc = days * DAILY_INC;
  const confirmed = Math.min(START_CONFIRMED + inc, CAP_CONFIRMED);
  return confirmed;
}

export default function FloatingCta() {
  const [show, setShow] = useState(false);
  const confirmed = useMemo(() => computeConfirmed(), []);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop || document.body.scrollTop;
      const height = doc.scrollHeight - doc.clientHeight;
      const ratio = height > 0 ? scrolled / height : 0;
      setShow(ratio >= 0.15);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const urgent = confirmed > 40;

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-[900] px-4 pointer-events-none">
      <div className="mx-auto w-full max-w-[390px] relative pointer-events-auto">
        {/* 라벨 */}
        <div className="absolute -top-12 right-0 select-none">
          <div className="rounded-full bg-black/60 px-4 py-1.5 backdrop-blur-sm">
            <span
              className={`text-base md:text-lg bg-clip-text text-transparent animate-[hue_3s_linear_infinite]`}
              style={{
                backgroundImage: urgent
                  ? "linear-gradient(90deg, #ff4d4f, #ff7875, #ff4d4f)"
                  : "linear-gradient(90deg, #ffe58f, #ffd666, #ffe58f)",
              }}
            >
              선착순 50명 <span className="font-extrabold">마감임박!</span> {confirmed}/{TOTAL}
            </span>
          </div>
        </div>

        {/* 버튼 */}
        <a
          href={TALLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-tally-cta
          data-keep-utm="true"
          className="block w-full"
        >
          <Image
            src="/optimized/low-floating.webp"
            alt="사전 예약하고 혜택 받기"
            width={1200}
            height={210}
            className="w-full h-auto drop-shadow-xl"
            priority
            unoptimized
          />
        </a>
      </div>

      <style jsx>{`
        @keyframes hue {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
      `}</style>
    </div>
  );
}


