"use client";

import { useEffect } from "react";

type AnalyticsProviderProps = {
  children: React.ReactNode;
};

export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = Object.fromEntries(url.searchParams.entries());
    if (Object.keys(params).length > 0) {
      try {
        sessionStorage.setItem("utm_params", JSON.stringify(params));
      } catch {}
    }
  }, []);

  return <>{children}</>;
}


