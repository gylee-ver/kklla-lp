"use client";

import Script from "next/script";
import { useEffect } from "react";

type AnalyticsProviderProps = {
  children: React.ReactNode;
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID;
const HOTJAR_SV = process.env.NEXT_PUBLIC_HOTJAR_SV || "6";

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

  return (
    <>
      {GA_ID ? (
        <>
          <Script
            id="ga4-src"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);} 
              gtag('js', new Date());
              gtag('config', '${GA_ID}', {
                anonymize_ip: true,
                send_page_view: true
              });
            `}
          </Script>
        </>
      ) : null}

      {HOTJAR_ID ? (
        <Script id="hotjar" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:${Number(HOTJAR_ID)},hjsv:${Number(HOTJAR_SV)}};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      ) : null}

      {children}
    </>
  );
}


