"use client";

import React, { useCallback, useState } from "react";

type Props = {
  className?: string;
};

export default function ShareButton({ className }: Props) {
  const [copied, setCopied] = useState(false);

  const onShare = useCallback(async () => {
    const shareData = {
      title: document.title || "공유하기",
      text: document.title || "",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch (_) {}
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {
      alert("링크가 복사되었습니다");
    }
  }, []);

  return (
    <div className={className}>
      <button
        onClick={onShare}
        aria-label="공유하기"
        className="flex items-center gap-1 rounded-full bg-black/70 text-white px-3 py-1.5 backdrop-blur-md shadow-md active:scale-95 transition-transform"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M13 4.5a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0V6.31l-6.72 6.72a.75.75 0 0 1-1.06-1.06L17.94 5.25H13.75A.75.75 0 0 1 13 4.5Z" />
          <path d="M6.75 5.5h4a.75.75 0 0 1 0 1.5h-4A1.25 1.25 0 0 0 5.5 8.25v9.5a1.25 1.25 0 0 0 1.25 1.25h9.5a1.25 1.25 0 0 0 1.25-1.25v-4a.75.75 0 0 1 1.5 0v4A2.75 2.75 0 0 1 16.25 20h-9.5A2.75 2.75 0 0 1 4 17.25v-9.5A2.75 2.75 0 0 1 6.75 5.5Z" />
        </svg>
        <span className="text-xs font-semibold">공유하기</span>
      </button>
      {copied && (
        <div className="mt-1 text-[10px] text-white/90 bg-black/70 rounded-full px-2 py-0.5 text-center">
          링크가 복사되었습니다
        </div>
      )}
    </div>
  );
}


